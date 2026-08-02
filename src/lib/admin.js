import { supabase } from '../supabase.js'
import { userId } from './auth.js'

function normalizeAdminEmails() {
  return (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * Gets the current user's staff role from the database.
 * Returns 'admin', 'moderator', or null if the user has no admin role.
 */
export async function getCurrentStaffRole() {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    const activeUserId = userData?.user?.id ?? userId.value
    const activeEmail = userData?.user?.email?.toLowerCase() ?? ''

    if (userError) {
      console.warn('Failed to read auth user for admin check:', userError.message)
    }

    if (!activeUserId) return null

    const adminEmails = normalizeAdminEmails()
    if (activeEmail && adminEmails.includes(activeEmail)) {
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

const LISTING_FIELDS = `
  id, title, brand, category, condition, listing_price, original_price,
  images, status, created_at, updated_at, seller_id,
  seller:profiles(id, username, full_name, first_name, last_name, avatar_url),
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
  const { data, error } = await supabase
    .from('listings')
    .select(
      `${LISTING_FIELDS},
       listing_verification(ocr_text, receipt_path, certificate_path, serial_image_path)`,
    )
    .eq('id', listingId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    ...formatListingForAdmin(data),
    verification: data.listing_verification || {},
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
      fullName: listing.seller.full_name || `${listing.seller.first_name} ${listing.seller.last_name}`.trim(),
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
    .update({ status: 'rejected' })
    .eq('id', listingId)

  if (error) throw error
}

// =============================================================================
// USERS MANAGEMENT
// =============================================================================

const USER_FIELDS = `
  id, username, full_name, first_name, last_name, avatar_url,
  email, city, state, country, created_at, is_trusted_seller
`

/**
 * Fetches users with pagination and search.
 */
export async function getAdminUsers({ search = '', page = 1, perPage = 20 } = {}) {
  let query = supabase.from('profiles').select(USER_FIELDS, { count: 'exact' })

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
    .from('profiles')
    .select(USER_FIELDS)
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  // Fetch user stats from profile_stats view
  const { data: statsData } = await supabase
    .from('profile_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  return {
    ...formatUserForAdmin(data),
    stats: statsData
      ? {
          listingCount: statsData.listing_count ?? 0,
          salesCount: statsData.sales_count ?? 0,
          purchaseCount: statsData.purchase_count ?? 0,
        }
      : { listingCount: 0, salesCount: 0, purchaseCount: 0 },
  }
}

function formatUserForAdmin(user) {
  return {
    id: user.id,
    username: user.username,
    fullName: user.full_name || `${user.first_name} ${user.last_name}`.trim(),
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
  buyer:profiles(id, username, full_name, avatar_url),
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
    status: order.status,
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
  reporter:profiles(id, username, full_name, avatar_url),
  listing:listings(id, title, brand, images),
  reported_user:profiles(id, username, full_name, avatar_url)
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
  listing:listings(id, title, brand, images, seller_id),
  verification:listing_verification(ocr_text, receipt_path, certificate_path, serial_image_path)
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
    verification: {
      ocrText: assessment.verification?.ocr_text,
      receiptPath: assessment.verification?.receipt_path,
      certificatePath: assessment.verification?.certificate_path,
      serialImagePath: assessment.verification?.serial_image_path,
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

// =============================================================================
// FEATURED LISTINGS MANAGEMENT
// =============================================================================

const FEATURED_FIELDS = `
  id, listing_id, position, created_at,
  listing:listings(id, title, brand, images, listing_price, seller_id)
`

/**
 * Fetches featured listings in order.
 */
export async function getFeaturedListings() {
  const { data, error } = await supabase
    .from('featured_listings')
    .select(FEATURED_FIELDS)
    .order('position', { ascending: true })

  if (error) throw error

  return (data ?? []).map((item) => ({
    id: item.id,
    listingId: item.listing_id,
    position: item.position,
    listing: {
      id: item.listing.id,
      title: item.listing.title,
      brand: item.listing.brand,
      image: item.listing.images?.[0] || '/demo/bag1.png',
      price: Number(item.listing.listing_price),
      sellerId: item.listing.seller_id,
    },
  }))
}

/**
 * Adds a listing to featured.
 */
export async function addFeaturedListing(listingId, position = 0) {
  const { error } = await supabase.from('featured_listings').insert({
    listing_id: listingId,
    position,
    added_by_id: userId.value,
  })

  if (error) throw error
}

/**
 * Removes a listing from featured.
 */
export async function removeFeaturedListing(listingId) {
  const { error } = await supabase
    .from('featured_listings')
    .delete()
    .eq('listing_id', listingId)

  if (error) throw error
}

/**
 * Reorders featured listings.
 */
export async function updateFeaturedListingsOrder(updates) {
  // updates is an array of { id, position }
  const { error } = await Promise.all(
    updates.map((u) => supabase.from('featured_listings').update({ position: u.position }).eq('id', u.id)),
  )

  if (error) throw error
}

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
    discountType: promo.discount_type,
    discountAmount: Number(promo.discount_amount),
    minSpend: Number(promo.minimum_spend),
    expiresAt: promo.expires_at,
    usageLimit: promo.usage_limit,
    usageCount: promo.usage_count,
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
    .update({ is_read: true })
    .eq('id', messageId)

  if (error) throw error
}
