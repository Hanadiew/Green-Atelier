import { supabase } from '../supabase.js'

const SELLER_FIELDS =
  'id, username, first_name, last_name, full_name, avatar_url, is_trusted_seller, city, state'

const CARD_FIELDS =
  'id, title, brand, category, condition, listing_price, original_price, images, status, created_at, seller_id'

// Only a seller's own view needs the rejection note, so it stays out of
// CARD_FIELDS — the catalogue has no business selecting it.
const OWNER_CARD_FIELDS = `${CARD_FIELDS}, rejection_reason`

/** Maps a listings row onto the shape the catalogue components render. */
export function toCard(row) {
  return {
    id: row.id,
    name: row.title,
    brand: row.brand,
    category: row.category,
    condition: row.condition,
    price: Number(row.listing_price),
    originalPrice: row.original_price ? Number(row.original_price) : null,
    image: row.images?.[0] || '/demo/bag1.png',
    sold: row.status === 'sold',
    status: row.status,
    rejectionReason: row.rejection_reason ?? null,
    sellerId: row.seller_id,
  }
}

// Postgres full-text with a `:*` suffix so the Shop search box matches as the
// user types ("kiss" finds "Kisslock"). Terms are stripped to alphanumerics so
// nothing a user types can be read as tsquery syntax.
function toPrefixQuery(search) {
  const terms = String(search)
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ''))
    .filter(Boolean)
  return terms.length ? terms.map((t) => `${t}:*`).join(' & ') : null
}

/**
 * Catalogue query. Returns `{ items, total }` where total is the row count
 * before pagination, so the pager can size itself.
 */
export async function fetchListings({
  search = '',
  categories = [],
  conditions = [],
  maxPrice = null,
  minPrice = null,
  sort = 'latest',
  page = 1,
  perPage = 9,
  status = 'active',
} = {}) {
  let query = supabase
    .from('listings')
    .select(CARD_FIELDS, { count: 'exact' })
    .eq('status', status)

  if (categories.length) query = query.in('category', categories)
  if (conditions.length) query = query.in('condition', conditions)
  if (minPrice != null) query = query.gte('listing_price', minPrice)
  if (maxPrice != null) query = query.lte('listing_price', maxPrice)

  const tsQuery = toPrefixQuery(search)
  if (tsQuery) {
    query = query.textSearch('search_vector', tsQuery, { config: 'simple' })
  }

  if (sort === 'price_asc') query = query.order('listing_price', { ascending: true })
  else if (sort === 'price_desc') query = query.order('listing_price', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const from = (page - 1) * perPage
  query = query.range(from, from + perPage - 1)

  const { data, error, count } = await query
  if (error) throw error
  return { items: (data ?? []).map(toCard), total: count ?? 0 }
}

/** Single listing plus its seller, for the product detail page. */
export async function fetchListing(id) {
  const { data, error } = await supabase
    .from('listings')
    .select(`*, seller:profiles!listings_seller_id_fkey(${SELLER_FIELDS})`)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    id: data.id,
    name: data.title,
    brand: data.brand,
    category: data.category,
    itemType: data.item_type,
    price: Number(data.listing_price),
    originalPrice: data.original_price ? Number(data.original_price) : null,
    color: data.color,
    condition: data.condition,
    material: data.material,
    size: data.size,
    isVintage: data.is_vintage,
    description: data.description,
    yearPurchased: data.year_purchased,
    origin: data.origin,
    packaging: data.packaging ?? [],
    images: data.images?.length ? data.images : ['/demo/bag1.png'],
    acceptOffers: data.accept_offers,
    status: data.status,
    co2SavedKg: data.co2_saved_kg ? Number(data.co2_saved_kg) : null,
    viewCount: data.view_count,
    createdAt: data.created_at,
    sellerId: data.seller_id,
    seller: data.seller,
  }
}

// fetchFeaturedListings() is gone with the admin curation feature. The homepage
// and product pages both show "New In" via fetchNewestListings() instead, so an
// approved listing surfaces without anyone curating it.

export async function fetchNewestListings(limit = 8) {
  const { data, error } = await supabase
    .from('listings')
    .select(CARD_FIELDS)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []).map(toCard)
}

/** A seller's own listings. Includes drafts and pending items for the owner. */
export async function fetchSellerListings(sellerId, { includeSold = true } = {}) {
  let query = supabase
    .from('listings')
    .select(OWNER_CARD_FIELDS)
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false })

  if (!includeSold) query = query.neq('status', 'sold')

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(toCard)
}

export async function incrementViews(id) {
  // Best-effort: a failed view count must never break the page.
  const { error } = await supabase.rpc('increment_listing_views', { p_listing_id: id })
  if (error) console.warn('View count not recorded:', error.message)
}

/**
 * Platform-wide sustainability totals for the Sustainable page.
 *
 * Deliberately reads nothing but `listings`, and only the two statuses the
 * catalogue already shows the world (`listings_select_active` permits `active`
 * and `sold` to everyone). No order, buyer or payout data is touched, so this
 * works signed out and leaks nothing RLS was protecting.
 *
 * `co2_saved_kg` is the generated per-category figure on the listing itself, so
 * this is a sum of the platform's own numbers rather than a new calculation.
 * The sum is done here rather than in SQL because PostgREST aggregates are not
 * enabled on this project, and the row count is small.
 */
export async function fetchPlatformImpact() {
  const [{ count: activeCount, error: activeError }, { data: soldRows, error: soldError }] =
    await Promise.all([
      supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase.from('listings').select('co2_saved_kg').eq('status', 'sold'),
    ])

  if (activeError) throw activeError
  if (soldError) throw soldError

  return {
    activeListings: activeCount ?? 0,
    itemsRehomed: soldRows?.length ?? 0,
    co2SavedKg: (soldRows ?? []).reduce((total, row) => total + Number(row.co2_saved_kg || 0), 0),
  }
}

// --- Uploads ----------------------------------------------------------------
// Every object is keyed under the uploader's user id because the Storage
// policies check that the first path segment equals auth.uid().

function safeFileName(name) {
  const dot = name.lastIndexOf('.')
  const ext = dot > -1 ? name.slice(dot).toLowerCase() : ''
  return `${crypto.randomUUID()}${ext}`
}

export async function uploadListingImages(files, ownerId) {
  const urls = []
  for (const file of files) {
    const path = `${ownerId}/${safeFileName(file.name)}`
    const { error } = await supabase.storage
      .from('listing-images')
      .upload(path, file, { cacheControl: '3600', upsert: false })
    if (error) throw new Error(`Could not upload ${file.name}: ${error.message}`)

    const { data } = supabase.storage.from('listing-images').getPublicUrl(path)
    urls.push(data.publicUrl)
  }
  return urls
}

/**
 * Authenticity documents go to a private bucket, so this returns the storage
 * path rather than a URL. Read it back with a signed URL.
 */
export async function uploadAuthenticityDoc(file, ownerId) {
  const path = `${ownerId}/${safeFileName(file.name)}`
  const { error } = await supabase.storage
    .from('authenticity-docs')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw new Error(`Could not upload ${file.name}: ${error.message}`)
  return path
}

export async function getAuthenticityDocUrl(path, expiresInSeconds = 300) {
  const { data, error } = await supabase.storage
    .from('authenticity-docs')
    .createSignedUrl(path, expiresInSeconds)
  if (error) throw error
  return data.signedUrl
}

/**
 * Creates a listing from the Sell wizard.
 *
 * Uploads run first so a failed upload leaves no half-built row behind. The
 * serial number and authenticity document are written to listing_verification,
 * which buyers cannot read — the wizard promises they stay private.
 */
export async function createListing({
  sellerId,
  title,
  brand,
  category,
  itemType,
  condition,
  color,
  material,
  size,
  isVintage,
  description,
  yearPurchased,
  origin,
  packaging,
  listingPrice,
  originalPrice,
  acceptOffers,
  shippingAddressId,
  imageFiles = [],
  authDocFile = null,
  serialNumber = '',
}) {
  if (!sellerId) throw new Error('You must be signed in to create a listing.')

  const imageUrls = imageFiles.length ? await uploadListingImages(imageFiles, sellerId) : []
  const docPath = authDocFile ? await uploadAuthenticityDoc(authDocFile, sellerId) : null

  const { data: brandRow } = await supabase
    .from('brands')
    .select('id')
    .ilike('name', brand.trim())
    .maybeSingle()

  const { data, error } = await supabase
    .from('listings')
    .insert({
      seller_id: sellerId,
      title: title.trim(),
      brand: brand.trim(),
      brand_id: brandRow?.id ?? null,
      category,
      item_type: itemType || null,
      condition,
      color: color || null,
      material: material || null,
      size: size || null,
      is_vintage: Boolean(isVintage),
      description: description || null,
      year_purchased: yearPurchased ? Number(yearPurchased) : null,
      origin: origin || null,
      packaging: packaging ?? [],
      images: imageUrls,
      listing_price: Number(listingPrice),
      original_price: originalPrice ? Number(originalPrice) : null,
      accept_offers: Boolean(acceptOffers),
      shipping_address_id: shippingAddressId ?? null,
      status: 'pending_review',
    })
    .select('id, status')
    .single()

  if (error) throw error

  // Reported back to the caller rather than only logged. Losing this quietly is
  // the worst case for a review queue: the seller believes they submitted their
  // serial number and paperwork, and the moderator sees a listing with no
  // evidence and rejects it.
  let verificationSaved = true

  if (serialNumber?.trim() || docPath) {
    const { error: verificationError } = await supabase.from('listing_verification').insert({
      listing_id: data.id,
      serial_number: serialNumber?.trim() || null,
      authenticity_document_url: docPath,
    })
    // The listing itself is saved; surface this without discarding it.
    if (verificationError) {
      console.error('Verification details not saved:', verificationError.message)
      verificationSaved = false
    }
  }

  return { ...data, verificationSaved }
}

export async function deleteListing(id) {
  const { error } = await supabase.from('listings').delete().eq('id', id)
  if (error) throw error
}

// Fields a seller is allowed to change on an edit. seller_id and created_at
// are deliberately excluded — updated_at is handled by the DB trigger already.
const EDITABLE_FIELDS = [
  'title', 'brand', 'brand_id', 'category', 'item_type', 'condition', 'color',
  'material', 'size', 'is_vintage', 'description', 'year_purchased', 'origin',
  'packaging', 'images', 'listing_price', 'original_price', 'accept_offers',
]

export async function updateListing(id, fields) {
  const payload = {}
  for (const key of EDITABLE_FIELDS) {
    if (key in fields) payload[key] = fields[key]
  }
  const { data, error } = await supabase
    .from('listings')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data
}

// Archiving used to stand in for deleting an active listing. It is gone on
// purpose: a seller's only controls are edit and remove, and deleteListing()
// now covers every status except 'sold'.