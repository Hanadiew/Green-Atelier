import { supabase } from '../supabase.js'
import { userId } from './auth.js'
import { deriveOrderStatus } from './orders.js'

/**
 * A profile's display name. full_name is nullable and first/last are too, so
 * template-stringing them renders the literal "null null".
 */
function personName(row) {
  const parts = [row?.first_name, row?.last_name].filter(Boolean)
  return row?.full_name || parts.join(' ') || null
}

function normalizeAdminEmails() {
  return (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

function isKnownAdminEmail(email) {
  const normalized = (email || '').trim().toLowerCase()
  return normalized === 'admin@email.com' || normalizeAdminEmails().includes(normalized)
}

/**
 * Gets the current user's staff role from the database.
 * Returns 'admin', 'moderator', or null if the user has no admin role.
 */
export async function getCurrentStaffRole() {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.warn('Failed to get auth session for admin check:', sessionError.message)
    }

    const activeUser = sessionData?.session?.user
    const activeUserId = activeUser?.id ?? userId.value
    const activeEmail = activeUser?.email?.toLowerCase() ?? ''

    if (!activeUserId) return null

    if (isKnownAdminEmail(activeEmail)) {
      return 'admin'
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', activeUserId)
      .maybeSingle()

    if (error) {
      console.warn('Failed to load staff role:', error.message)
      return null
    }

    return data?.role ?? null
  } catch (error) {
    console.warn('Admin role lookup failed:', error)
    return null
  }
}

/**
 * Checks if the current user is an admin or moderator.
 */
export async function isStaffMember() {
  const role = await getCurrentStaffRole()
  return role !== null
}

/**
 * Checks if the current user is an admin (not just moderator).
 */
export async function isAdmin() {
  const role = await getCurrentStaffRole()
  return role === 'admin'
}

/**
 * Checks if the current user is a moderator (or admin).
 */
export async function isModerator() {
  const role = await getCurrentStaffRole()
  return role === 'admin' || role === 'moderator'
}

// =============================================================================
// DASHBOARD STATISTICS
// =============================================================================

/**
 * Fetches dashboard summary statistics.
 * Returns an object with counts and totals.
 */
export async function getDashboardStats() {
  // Fetch multiple stats in parallel
  const [usersResult, activeListingsResult, pendingListingsResult, ordersResult, pendingReportsResult] =
    await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending_review'),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ])

  // Each count is read independently so one broken query does not blank the
  // whole dashboard — but a failure must not masquerade as a genuine zero.
  const counts = {
    totalUsers: usersResult,
    activeListings: activeListingsResult,
    pendingListings: pendingListingsResult,
    totalOrders: ordersResult,
    pendingReports: pendingReportsResult,
  }

  for (const [name, result] of Object.entries(counts)) {
    if (result.error) console.error(`Dashboard stat "${name}" failed:`, result.error.message)
  }

  const totalUsers = usersResult.count ?? 0
  const activeListings = activeListingsResult.count ?? 0
  const pendingListings = pendingListingsResult.count ?? 0
  const totalOrders = ordersResult.count ?? 0
  const pendingReports = pendingReportsResult.count ?? 0

  // Fetch sales totals
  const { data: salesData, error: salesError } = await supabase
    .from('order_items')
    .select('price_paid, platform_fee')

  if (salesError) {
    console.error('Failed to fetch sales data:', salesError.message)
  }

  const totalSales = (salesData ?? []).reduce((sum, item) => sum + (Number(item.price_paid) || 0), 0)
  const platformCommission = (salesData ?? []).reduce(
    (sum, item) => sum + (Number(item.platform_fee) || 0),
    0,
  )

  return {
    totalUsers,
    activeListings,
    pendingListings,
    totalOrders,
    pendingReports,
    totalSales,
    platformCommission,
  }
}

// =============================================================================
// LISTINGS MANAGEMENT
// =============================================================================

// The seller embed is hinted because wishlists and cart_items are both keyed
// (user_id, listing_id), which PostgREST reads as many-to-many links between
// listings and profiles — ambiguous against listings.seller_id without a hint.
const LISTING_FIELDS = `
  id, title, brand, category, condition, listing_price, original_price,
  images, status, created_at, updated_at, seller_id,
  seller:profiles!listings_seller_id_fkey(id, username, full_name, first_name, last_name, avatar_url),
  trustcheck:trustcheck_assessments(evidence_score, status)
`

/**
 * Fetches listings for admin review with filters and pagination.
 */
export async function getAdminListings({
  status = null,
  search = '',
  brand = null,
  category = null,
  page = 1,
  perPage = 20,
} = {}) {
  let query = supabase.from('listings').select(LISTING_FIELDS, { count: 'exact' })

  if (status) query = query.eq('status', status)
  if (brand) query = query.ilike('brand', `%${brand}%`)
  if (category) query = query.eq('category', category)

  if (search) {
    // Use full-text search
    const terms = search
      .toLowerCase()
      .split(/\s+/)
      .map((t) => t.replace(/[^a-z0-9]/g, ''))
      .filter(Boolean)
    const tsQuery = terms.length ? terms.map((t) => `${t}:*`).join(' & ') : null
    if (tsQuery) {
      query = query.textSearch('search_vector', tsQuery, { config: 'simple' })
    }
  }

  query = query.order('created_at', { ascending: false })

  const from = (page - 1) * perPage
  const { data, error, count } = await query.range(from, from + perPage - 1)

  if (error) throw error

  return {
    listings: (data ?? []).map(formatListingForAdmin),
    total: count ?? 0,
  }
}

/**
 * Fetches a single listing with all its details for admin review.
 */
export async function getAdminListing(listingId) {
  // Everything the seller filled in, not just the card fields — a moderator
  // cannot decide on a listing they can only see the title and price of. The
  // extra columns stay out of LISTING_FIELDS so the paginated table query is
  // not dragged down by them.
  const { data, error } = await supabase
    .from('listings')
    .select(
      `id, title, brand, category, item_type, condition, color, material, size,
       is_vintage, description, year_purchased, origin, packaging,
       listing_price, original_price, accept_offers, images, status,
       rejection_reason, created_at, updated_at, seller_id,
       seller:profiles!listings_seller_id_fkey(id, username, full_name, first_name, last_name, avatar_url),
       listing_verification(serial_number, authenticity_document_url, review_notes,
                            ocr_text, ocr_engine, receipt_path, certificate_path,
                            serial_image_path),
       trustcheck:trustcheck_assessments(brand, model, reference_country,
                            has_front, has_back, has_interior, has_receipt,
                            has_serial, has_certificate, ocr_origin_match,
                            evidence_score, status, assessed_at)`,
    )
    .eq('id', listingId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  // maybeSingle on a one-to-one embed still hands back an object here, but a
  // missing row arrives as null — both callers below tolerate that.
  const v = data.listing_verification ?? {}
  const tc = Array.isArray(data.trustcheck) ? data.trustcheck[0] : data.trustcheck

  return {
    id: data.id,
    title: data.title,
    brand: data.brand,
    category: data.category,
    itemType: data.item_type,
    condition: data.condition,
    color: data.color,
    material: data.material,
    size: data.size,
    isVintage: data.is_vintage,
    description: data.description,
    yearPurchased: data.year_purchased,
    origin: data.origin,
    packaging: data.packaging ?? [],
    price: Number(data.listing_price),
    originalPrice: data.original_price ? Number(data.original_price) : null,
    acceptOffers: data.accept_offers,
    images: data.images ?? [],
    image: data.images?.[0] || '/demo/bag1.png',
    status: data.status,
    rejectionReason: data.rejection_reason,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    seller: {
      id: data.seller?.id,
      username: data.seller?.username,
      fullName: personName(data.seller),
      avatarUrl: data.seller?.avatar_url,
    },
    verification: {
      serialNumber: v.serial_number ?? null,
      // Stored as a private storage path, not a URL, despite the column name.
      authenticityDocPath: v.authenticity_document_url ?? null,
      receiptPath: v.receipt_path ?? null,
      certificatePath: v.certificate_path ?? null,
      serialImagePath: v.serial_image_path ?? null,
      ocrText: v.ocr_text ?? null,
      ocrEngine: v.ocr_engine ?? null,
      reviewNotes: v.review_notes ?? null,
    },
    trustcheck: tc
      ? {
          brand: tc.brand,
          model: tc.model,
          referenceCountry: tc.reference_country,
          score: tc.evidence_score,
          status: tc.status,
          assessedAt: tc.assessed_at,
          evidence: {
            hasFront: tc.has_front,
            hasBack: tc.has_back,
            hasInterior: tc.has_interior,
            hasReceipt: tc.has_receipt,
            hasSerial: tc.has_serial,
            hasCertificate: tc.has_certificate,
            ocrOriginMatch: tc.ocr_origin_match,
          },
        }
      : null,
  }
}

function formatListingForAdmin(listing) {
  return {
    id: listing.id,
    title: listing.title,
    brand: listing.brand,
    category: listing.category,
    condition: listing.condition,
    price: Number(listing.listing_price),
    originalPrice: listing.original_price ? Number(listing.original_price) : null,
    image: listing.images?.[0] || '/demo/bag1.png',
    status: listing.status,
    createdAt: listing.created_at,
    updatedAt: listing.updated_at,
    seller: {
      id: listing.seller.id,
      username: listing.seller.username,
      fullName: personName(listing.seller),
      avatar: listing.seller.avatar_url,
    },
    trustcheck: listing.trustcheck
      ? {
          score: listing.trustcheck.evidence_score,
          status: listing.trustcheck.status,
        }
      : null,
  }
}

/**
 * Statuses a moderator can still make a publish/reject call on. 'active' needs
 * no decision and 'sold' is order history, so those two are the only ones that
 * leave a listing read-only. 'archived' is included so anything stranded there
 * by the old seller soft-delete can be brought back.
 */
const DECIDABLE_LISTING_STATUSES = ['pending_review', 'draft', 'archived', 'rejected']

export function isDecidableListingStatus(status) {
  return DECIDABLE_LISTING_STATUSES.includes(status)
}

/**
 * Approves a pending listing by changing its status to active.
 */
export async function approveListing(listingId) {
  const { error } = await supabase.from('listings').update({ status: 'active' }).eq('id', listingId)

  if (error) throw error
}

/**
 * Rejects a pending listing.
 */
export async function rejectListing(listingId, reason = null) {
  const { error } = await supabase
    .from('listings')
    .update({ status: 'rejected', rejection_reason: reason })
    .eq('id', listingId)

  if (error) throw error
}

// =============================================================================
// USERS MANAGEMENT
// =============================================================================

const USER_FIELDS = `
  id, username, full_name, first_name, last_name, avatar_url, bio, phone,
  email, email_confirmed_at, last_sign_in_at, banned_until,
  city, state, country, created_at, updated_at, is_trusted_seller
`

/**
 * Fetches users with pagination and search.
 */
export async function getAdminUsers({ search = '', page = 1, perPage = 20 } = {}) {
  let query = supabase.from('admin_users').select(USER_FIELDS, { count: 'exact' })

  if (search) {
    // Search by username or name
    query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`)
  }

  query = query.order('created_at', { ascending: false })

  const from = (page - 1) * perPage
  const { data, error, count } = await query.range(from, from + perPage - 1)

  if (error) throw error

  return {
    users: (data ?? []).map(formatUserForAdmin),
    total: count ?? 0,
  }
}

/**
 * Fetches a single user with detailed stats.
 */
export async function getAdminUser(userId) {
  const { data, error } = await supabase
    .from('admin_users')
    .select(USER_FIELDS)
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  // Everything else a moderator needs on one screen: the saved addresses, the
  // bank details a payout would go to, and what is owed. Each is read separately
  // and tolerated failing — one missing panel beats a blank page.
  const [statsResult, addressResult, bankResult, payoutResult] = await Promise.all([
    supabase.from('profile_stats').select('*').eq('user_id', userId).maybeSingle(),
    supabase
      .from('addresses')
      .select(
        `id, address_type, first_name, surname, company, phone_code, phone,
         street_address, apartment, city, state, postcode, country, is_default`,
      )
      .eq('user_id', userId)
      .order('is_default', { ascending: false }),
    // Admin read is allowed by seller_payout_accounts_own; addresses needed a new
    // policy (see 20260805000300) because that one was owner-only.
    supabase
      .from('seller_payout_accounts')
      .select('id, bank_name, account_holder_name, account_number, is_default, created_at')
      .eq('user_id', userId)
      .order('is_default', { ascending: false }),
    supabase.from('payouts').select('amount, status').eq('seller_id', userId),
  ])

  for (const [name, result] of Object.entries({
    stats: statsResult,
    addresses: addressResult,
    bank: bankResult,
    payouts: payoutResult,
  })) {
    if (result.error) console.error(`Admin user "${name}" lookup failed:`, result.error.message)
  }

  const statsData = statsResult.data
  const payouts = payoutResult.data ?? []
  const sumBy = (status) =>
    payouts.filter((p) => p.status === status).reduce((s, p) => s + Number(p.amount), 0)

  return {
    ...formatUserForAdmin(data),
    bio: data.bio,
    phone: data.phone,
    emailConfirmedAt: data.email_confirmed_at,
    lastSignInAt: data.last_sign_in_at,
    bannedUntil: data.banned_until,
    updatedAt: data.updated_at,
    stats: statsData
      ? {
          listingCount: statsData.listing_count ?? 0,
          salesCount: statsData.sales_count ?? 0,
          purchaseCount: statsData.purchase_count ?? 0,
        }
      : { listingCount: 0, salesCount: 0, purchaseCount: 0 },
    addresses: (addressResult.data ?? []).map((a) => ({
      id: a.id,
      type: a.address_type,
      name: [a.first_name, a.surname].filter(Boolean).join(' '),
      company: a.company,
      phone: a.phone ? `${a.phone_code ?? ''} ${a.phone}`.trim() : null,
      line1: a.apartment ? `${a.street_address}, ${a.apartment}` : a.street_address,
      line2: [a.postcode, a.city].filter(Boolean).join(' '),
      line3: [a.state, a.country].filter(Boolean).join(', '),
      isDefault: a.is_default,
    })),
    bankAccounts: (bankResult.data ?? []).map((b) => ({
      id: b.id,
      bankName: b.bank_name,
      accountHolder: b.account_holder_name,
      accountNumber: b.account_number,
      isDefault: b.is_default,
    })),
    payoutSummary: {
      pending: sumBy('pending') + sumBy('processing'),
      paid: sumBy('paid'),
      failed: sumBy('failed'),
      count: payouts.length,
    },
  }
}

/**
 * Grants or revokes the Trusted Seller badge.
 *
 * No new policy was needed: profiles_update_own already admits is_admin(), and
 * guard_profile_privileges() — which pins is_trusted_seller back to its old value
 * for everyone else — explicitly exempts admins. That guard is the reason a
 * seller cannot award themselves the badge.
 */
export async function setTrustedSeller(userId, trusted) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_trusted_seller: Boolean(trusted) })
    .eq('id', userId)
    .select('is_trusted_seller')
    .single()

  if (error) throw error
  return data.is_trusted_seller
}

/**
 * Suspends, restores or permanently deletes an account.
 *
 * Routed through the admin-manage-user Edge Function because all three need the
 * service role: banning and deleting live in auth.users, which the browser key
 * cannot touch at all.
 */
async function manageUser(action, userId, extra = {}) {
  const { data, error } = await supabase.functions.invoke('admin-manage-user', {
    body: { action, userId, ...extra },
  })
  if (error) {
    const detail = await error.context?.json?.().catch(() => null)
    throw new Error(detail?.error ?? error.message)
  }
  return data
}

/** Blocks sign-in without touching any records. The reversible option. */
export function suspendUser(userId, days = 3650) {
  return manageUser('suspend', userId, { days })
}

export function reactivateUser(userId) {
  return manageUser('reactivate', userId)
}

/**
 * Permanent. Removes the account's own data: listings, wishlist, cart,
 * addresses, and their own orders and payment records.
 *
 * Other people's records survive. order_items.seller_id and .listing_id are
 * ON DELETE SET NULL as of migration 20260808000300, and each line snapshots
 * the title, brand, image and price paid, so a buyer keeps their history even
 * once the seller and the listing are gone.
 */
export function deleteUser(userId) {
  return manageUser('delete', userId)
}

function formatUserForAdmin(user) {
  return {
    id: user.id,
    username: user.username,
    fullName: personName(user),
    avatar: user.avatar_url,
    email: user.email,
    location: [user.city, user.state, user.country].filter(Boolean).join(', '),
    isTrustedSeller: user.is_trusted_seller,
    createdAt: user.created_at,
  }
}

// =============================================================================
// ORDERS MANAGEMENT
// =============================================================================

const ORDER_FIELDS = `
  id, order_number, buyer_id, subtotal, shipping_fee, service_fee,
  discount, total, status, payment_status, placed_at,
  buyer:profiles!orders_buyer_id_fkey(id, username, full_name, avatar_url),
  items:order_items(
    id, seller_id, title_snapshot, brand_snapshot, image_snapshot,
    price_paid, platform_fee, seller_payout, status
  )
`

/**
 * Fetches orders with pagination.
 */
export async function getAdminOrders({ page = 1, perPage = 20 } = {}) {
  let query = supabase.from('orders').select(ORDER_FIELDS, { count: 'exact' })

  query = query.order('placed_at', { ascending: false })

  const from = (page - 1) * perPage
  const { data, error, count } = await query.range(from, from + perPage - 1)

  if (error) throw error

  return {
    orders: (data ?? []).map(formatOrderForAdmin),
    total: count ?? 0,
  }
}

/**
 * Fetches a single order with full details.
 */
export async function getAdminOrder(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_FIELDS)
    .eq('id', orderId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return formatOrderForAdmin(data)
}

/**
 * Cancels every line on an order.
 *
 * Cancellation is the only fulfilment change staff make. Shipped and delivered
 * belong to the seller, who is the one who actually posts the parcel and is the
 * only person who can honestly assert either.
 *
 * Writes to order_items, not to orders. Fulfilment is tracked per line — that
 * is the level a seller ships at, and what the buyer's Orders tab displays —
 * and orders.status follows via the order_items_sync_order_status trigger,
 * which also stamps cancelled_at.
 *
 * This used to write orders.status directly, which is why a staff change never
 * reached the buyer: the buyer was reading a column nobody had touched.
 */
export async function cancelOrderAsAdmin(orderId) {
  const { error } = await supabase
    .from('order_items')
    .update({ status: 'cancelled' })
    .eq('order_id', orderId)
    .neq('status', 'cancelled')

  if (error) throw error
}

function formatOrderForAdmin(order) {
  return {
    id: order.id,
    orderNumber: order.order_number,
    buyer: {
      id: order.buyer_id,
      username: order.buyer.username,
      fullName: order.buyer.full_name,
      avatar: order.buyer.avatar_url,
    },
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shipping_fee),
    serviceFee: Number(order.service_fee),
    discount: Number(order.discount),
    total: Number(order.total),
    // Derived from the lines, exactly as the buyer's Orders tab does it, so
    // staff and buyer never read different fulfilment states for one order.
    status: deriveOrderStatus((order.items ?? []).map((i) => i.status), order.status),
    paymentStatus: order.payment_status,
    placedAt: order.placed_at,
    items: (order.items ?? []).map((item) => ({
      id: item.id,
      sellerId: item.seller_id,
      title: item.title_snapshot,
      brand: item.brand_snapshot,
      image: item.image_snapshot || '/demo/bag1.png',
      pricePaid: Number(item.price_paid),
      platformFee: Number(item.platform_fee),
      sellerPayout: Number(item.seller_payout),
      status: item.status,
    })),
  }
}

// =============================================================================
// REPORTS MANAGEMENT
// =============================================================================

const REPORT_FIELDS = `
  id, reporter_id, reported_listing_id, reported_user_id, reason, description,
  status, admin_notes, handled_by_id, created_at, updated_at,
  reporter:profiles!reports_reporter_id_fkey(id, username, full_name, avatar_url),
  listing:listings(id, title, brand, images),
  reported_user:profiles!reports_reported_user_id_fkey(id, username, full_name, avatar_url)
`

/**
 * Fetches reports with optional filters.
 */
export async function getReports({ status = null, page = 1, perPage = 20 } = {}) {
  let query = supabase.from('reports').select(REPORT_FIELDS, { count: 'exact' })

  if (status) query = query.eq('status', status)

  query = query.order('created_at', { ascending: false })

  const from = (page - 1) * perPage
  const { data, error, count } = await query.range(from, from + perPage - 1)

  if (error) throw error

  return {
    reports: (data ?? []).map(formatReportForAdmin),
    total: count ?? 0,
  }
}

/**
 * Fetches a single report.
 */
export async function getReport(reportId) {
  const { data, error } = await supabase
    .from('reports')
    .select(REPORT_FIELDS)
    .eq('id', reportId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return formatReportForAdmin(data)
}

/**
 * Creates a new report (for users, called from the listing/profile pages).
 */
export async function createReport({ reportedListingId, reportedUserId, reason, description }) {
  const { error } = await supabase.from('reports').insert({
    reported_listing_id: reportedListingId || null,
    reported_user_id: reportedUserId || null,
    reason,
    description,
  })

  if (error) throw error
}

export const MY_REPORT_STATUS = {
  pending: { label: 'Pending review', style: 'background-color: #FEF3EC; color: #92400E;' },
  investigating: { label: 'Investigating', style: 'background-color: #EFF6FF; color: #1D4ED8;' },
  resolved: { label: 'Resolved', style: 'background-color: #E8F5EE; color: #166534;' },
  dismissed: { label: 'Dismissed', style: 'background-color: #F3F4F6; color: #4B5563;' },
}

const REPORT_REASON_LABELS = {
  misleading_info: 'Misleading information',
  policy_violation: 'Policy violation',
  incorrect_product_info: 'Incorrect product info',
  inappropriate_content: 'Inappropriate content',
  seller_misconduct: 'Seller misconduct',
  buyer_misconduct: 'Buyer misconduct',
  other: 'Other',
}

/**
 * The signed-in user's own reports, so they can follow what happened to them.
 *
 * No RLS change is needed: reports_select_own_or_admin already exposes a row to
 * its reporter, admin_notes included — which is the whole point, since the notes
 * are the moderator's reply.
 */
export async function fetchMyReports() {
  const { data, error } = await supabase
    .from('reports')
    .select(
      `id, reason, description, status, admin_notes, created_at, updated_at,
       listing:listings!reports_reported_listing_id_fkey(id, title, brand, images),
       user:profiles!reports_reported_user_id_fkey(username, full_name)`,
    )
    .eq('reporter_id', userId.value)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    reason: row.reason,
    reasonLabel: REPORT_REASON_LABELS[row.reason] ?? row.reason,
    description: row.description,
    status: row.status,
    statusLabel: MY_REPORT_STATUS[row.status]?.label ?? row.status,
    statusStyle: MY_REPORT_STATUS[row.status]?.style ?? MY_REPORT_STATUS.pending.style,
    adminNotes: row.admin_notes,
    // Only shown once a moderator has actually replied.
    hasReply: Boolean(row.admin_notes),
    subject:
      row.listing?.title ??
      (row.user ? `@${row.user.username}` : 'The reported item no longer exists'),
    subjectBrand: row.listing?.brand ?? null,
    subjectImage: row.listing?.images?.[0] ?? null,
    subjectListingId: row.listing?.id ?? null,
    filedOn: new Date(row.created_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  }))
}

/**
 * Updates a report's status and adds admin notes.
 */
export async function updateReportStatus(reportId, status, adminNotes = null) {
  const { error } = await supabase
    .from('reports')
    .update({
      status,
      admin_notes: adminNotes,
      handled_by_id: userId.value,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reportId)

  if (error) throw error
}

function formatReportForAdmin(report) {
  return {
    id: report.id,
    reporter: {
      id: report.reporter_id,
      username: report.reporter.username,
      fullName: report.reporter.full_name,
      avatar: report.reporter.avatar_url,
    },
    reportedListing: report.listing
      ? {
          id: report.listing.id,
          title: report.listing.title,
          brand: report.listing.brand,
          image: report.listing.images?.[0] || '/demo/bag1.png',
        }
      : null,
    reportedUser: report.reported_user
      ? {
          id: report.reported_user.id,
          username: report.reported_user.username,
          fullName: report.reported_user.full_name,
          avatar: report.reported_user.avatar_url,
        }
      : null,
    reason: report.reason,
    description: report.description,
    status: report.status,
    adminNotes: report.admin_notes,
    handledById: report.handled_by_id,
    createdAt: report.created_at,
    updatedAt: report.updated_at,
  }
}

// =============================================================================
// TRUSTCHECK MANAGEMENT
// =============================================================================

const TRUSTCHECK_FIELDS = `
  listing_id, evidence_score, status, has_front, has_back, has_interior,
  has_receipt, has_serial, has_certificate, ocr_origin_match,
  reference_slug, brand, model, reference_country,
  listing:listings(
    id, title, brand, images, seller_id,
    verification:listing_verification(ocr_text, receipt_path, certificate_path, serial_image_path)
  )
`

/**
 * Fetches TrustCheck assessments for review.
 */
export async function getTrustCheckAssessments({ status = null, page = 1, perPage = 20 } = {}) {
  let query = supabase.from('trustcheck_assessments').select(TRUSTCHECK_FIELDS, { count: 'exact' })

  if (status) query = query.eq('status', status)

  query = query.order('listing_id', { ascending: false })

  const from = (page - 1) * perPage
  const { data, error, count } = await query.range(from, from + perPage - 1)

  if (error) throw error

  return {
    assessments: (data ?? []).map(formatTrustCheckForAdmin),
    total: count ?? 0,
  }
}

/**
 * Fetches a single TrustCheck assessment.
 */
export async function getTrustCheckAssessment(listingId) {
  const { data, error } = await supabase
    .from('trustcheck_assessments')
    .select(TRUSTCHECK_FIELDS)
    .eq('listing_id', listingId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return formatTrustCheckForAdmin(data)
}

function formatTrustCheckForAdmin(assessment) {
  return {
    listingId: assessment.listing_id,
    listing: assessment.listing
      ? {
          id: assessment.listing.id,
          title: assessment.listing.title,
          brand: assessment.listing.brand,
          image: assessment.listing.images?.[0] || '/demo/bag1.png',
          sellerId: assessment.listing.seller_id,
        }
      : null,
    score: assessment.evidence_score,
    status: assessment.status,
    evidence: {
      hasFront: assessment.has_front,
      hasBack: assessment.has_back,
      hasInterior: assessment.has_interior,
      hasReceipt: assessment.has_receipt,
      hasSerial: assessment.has_serial,
      hasCertificate: assessment.has_certificate,
      ocrOriginMatch: assessment.ocr_origin_match,
    },
    reference: {
      slug: assessment.reference_slug,
      brand: assessment.brand,
      model: assessment.model,
      country: assessment.reference_country,
    },
    // listing_verification has no FK to trustcheck_assessments — both point at
    // listings — so PostgREST can only reach it nested under the listing.
    verification: {
      ocrText: assessment.listing?.verification?.ocr_text,
      receiptPath: assessment.listing?.verification?.receipt_path,
      certificatePath: assessment.listing?.verification?.certificate_path,
      serialImagePath: assessment.listing?.verification?.serial_image_path,
    },
  }
}

// =============================================================================
// BRANDS MANAGEMENT
// =============================================================================

/**
 * Fetches all brands.
 */
export async function getAdminBrands({ search = '', page = 1, perPage = 20 } = {}) {
  let query = supabase.from('brands').select('*', { count: 'exact' })

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  query = query.order('name', { ascending: true })

  const from = (page - 1) * perPage
  const { data, error, count } = await query.range(from, from + perPage - 1)

  if (error) throw error

  return {
    brands: data ?? [],
    total: count ?? 0,
  }
}

/**
 * Creates a new brand.
 */
export async function createBrand(name, slug, logoUrl = null) {
  const { error } = await supabase.from('brands').insert({
    name,
    slug,
    logo_url: logoUrl,
    is_active: true,
  })

  if (error) throw error
}

/**
 * Updates a brand.
 */
export async function updateBrand(brandId, updates) {
  const { error } = await supabase.from('brands').update(updates).eq('id', brandId)

  if (error) throw error
}

// Featured-listing curation was removed: the homepage and product pages both
// show "New In" (newest active listings) instead, so an approved listing reaches
// buyers without an admin curating it.

// =============================================================================
// PROMO CODES MANAGEMENT
// =============================================================================

/**
 * Fetches promo codes.
 */
export async function getPromoCodes({ page = 1, perPage = 20 } = {}) {
  let query = supabase.from('promo_codes').select('*', { count: 'exact' })

  query = query.order('created_at', { ascending: false })

  const from = (page - 1) * perPage
  const { data, error, count } = await query.range(from, from + perPage - 1)

  if (error) throw error

  return {
    codes: (data ?? []).map(formatPromoCode),
    total: count ?? 0,
  }
}

/**
 * Creates a promo code.
 */
export async function createPromoCode(promoData) {
  const { error } = await supabase.from('promo_codes').insert(promoData)

  if (error) throw error
}

/**
 * Updates a promo code.
 */
export async function updatePromoCode(code, updates) {
  const { error } = await supabase.from('promo_codes').update(updates).eq('code', code)

  if (error) throw error
}

function formatPromoCode(promo) {
  return {
    code: promo.code,
    description: promo.description,
    discountType: promo.discount_type,
    discountValue: Number(promo.discount_value),
    minSubtotal: Number(promo.min_subtotal),
    maxDiscount: promo.max_discount === null ? null : Number(promo.max_discount),
    validFrom: promo.valid_from,
    validUntil: promo.valid_until,
    usageLimit: promo.usage_limit,
    timesUsed: promo.times_used,
    isActive: promo.is_active,
    createdAt: promo.created_at,
  }
}

// =============================================================================
// CONTACT MESSAGES MANAGEMENT
// =============================================================================

/**
 * Fetches contact messages.
 */
export async function getContactMessages({ page = 1, perPage = 20 } = {}) {
  let query = supabase
    .from('contact_messages')
    .select(
      'id, name, email, subject, message, created_at, is_read',
      { count: 'exact' },
    )

  query = query.order('created_at', { ascending: false })

  const from = (page - 1) * perPage
  const { data, error, count } = await query.range(from, from + perPage - 1)

  if (error) throw error

  return {
    messages: data ?? [],
    total: count ?? 0,
  }
}

/**
 * Fetches a single contact message.
 */
export async function getContactMessage(messageId) {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .eq('id', messageId)
    .maybeSingle()

  if (error) throw error
  return data
}

/**
 * Marks a contact message as read.
 */
export async function markMessageAsRead(messageId) {
  const { error } = await supabase
    .from('contact_messages')
    .update({ is_read: true, handled_by_id: userId.value })
    .eq('id', messageId)

  if (error) throw error
}

// =============================================================================
// STAFF
// =============================================================================

/**
 * Lists everyone holding an admin or moderator role.
 * user_roles_select_own lets is_admin() read the whole table.
 */
export async function getStaffMembers() {
  const { data, error } = await supabase
    .from('user_roles')
    .select('user_id, role, created_at, profile:profiles(username, full_name, avatar_url)')
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data ?? []).map((row) => ({
    userId: row.user_id,
    role: row.role,
    username: row.profile?.username ?? null,
    fullName: row.profile?.full_name ?? null,
    avatar: row.profile?.avatar_url ?? null,
    createdAt: row.created_at,
  }))
}

/**
 * Monthly order count and platform fee for the dashboard chart.
 *
 * Two queries rather than one join: the order count comes from `orders`, while
 * the fee lives per line on `order_items`, and an order with three items would
 * otherwise be counted three times.
 *
 * Months with no activity are returned as zeros rather than omitted — a gap in
 * the series would let the chart draw a straight line across a dead month and
 * imply trade that never happened.
 */
export async function getMonthlyPerformance(months = 6) {
  const since = new Date()
  since.setMonth(since.getMonth() - (months - 1))
  since.setDate(1)
  since.setHours(0, 0, 0, 0)

  const [ordersResult, itemsResult] = await Promise.all([
    supabase.from('orders').select('created_at').gte('created_at', since.toISOString()),
    supabase
      .from('order_items')
      .select('created_at, platform_fee')
      .gte('created_at', since.toISOString()),
  ])

  if (ordersResult.error) console.error('Monthly orders failed:', ordersResult.error.message)
  if (itemsResult.error) console.error('Monthly fees failed:', itemsResult.error.message)

  const buckets = new Map()
  for (let i = 0; i < months; i++) {
    const d = new Date(since)
    d.setMonth(since.getMonth() + i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    buckets.set(key, {
      key,
      label: d.toLocaleDateString('en-GB', { month: 'short' }),
      orders: 0,
      profit: 0,
    })
  }

  const keyOf = (iso) => {
    const d = new Date(iso)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  for (const row of ordersResult.data ?? []) {
    const bucket = buckets.get(keyOf(row.created_at))
    if (bucket) bucket.orders += 1
  }

  for (const row of itemsResult.data ?? []) {
    const bucket = buckets.get(keyOf(row.created_at))
    if (bucket) bucket.profit += Number(row.platform_fee) || 0
  }

  return [...buckets.values()]
}
