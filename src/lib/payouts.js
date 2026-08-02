import { supabase } from '../supabase.js'
import { fetchOrders, fetchSales } from './orders.js'

// --- Payout account ----------------------------------------------------------

/** Masks all but the last 4 digits, e.g. "1234567890" -> "•••• 7890". */
export function maskAccountNumber(accountNumber) {
  if (!accountNumber) return ''
  const digits = String(accountNumber).replace(/\D/g, '')
  if (digits.length <= 4) return `•••• ${digits}`
  return `•••• ${digits.slice(-4)}`
}

function toAccountDisplay(row) {
  if (!row) return null
  return {
    id: row.id,
    bankName: row.bank_name,
    accountHolderName: row.account_holder_name,
    accountNumberMasked: maskAccountNumber(row.account_number),
    isDefault: row.is_default,
  }
}

function isMissingDatabaseObjectError(error) {
  if (!error) return false
  const message = String(error.message || '').toLowerCase()
  return (
    error.status === 404 ||
    error.code === '42P01' ||
    message.includes('could not find the table') ||
    message.includes('could not find the view') ||
    (message.includes('relation') && message.includes('does not exist'))
  )
}

/** The seller's default payout account, or null if none is configured. */
export async function fetchPayoutAccount(userId) {
  if (!userId) return null
  const { data, error } = await supabase
    .from('seller_payout_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .maybeSingle()
  if (error) {
    if (isMissingDatabaseObjectError(error)) return null
    throw error
  }
  return toAccountDisplay(data)
}

/**
 * True/false only — used by the Sell wizard's publish-gate, which does not
 * need the account details, just whether one exists.
 */
export async function hasPayoutAccount(userId) {
  if (!userId) return false
  const { count, error } = await supabase
    .from('seller_payout_accounts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
  if (error) {
    if (isMissingDatabaseObjectError(error)) return false
    throw error
  }
  return (count ?? 0) > 0
}

/**
 * Creates or updates the seller's default payout account. FYP scope keeps
 * this to a single account per seller, so this always targets the existing
 * default row if one exists.
 */
export async function savePayoutAccount(userId, fields) {
  if (!userId) throw new Error('You must be signed in to add a payout account.')

  const bankName = fields.bankName?.trim()
  const accountHolderName = fields.accountHolderName?.trim()
  const accountNumber = fields.accountNumber?.trim()

  if (!bankName || !accountHolderName || !accountNumber) {
    throw new Error('Bank name, account holder name and account number are required.')
  }

  const { data: existing, error: findError } = await supabase
    .from('seller_payout_accounts')
    .select('id')
    .eq('user_id', userId)
    .eq('is_default', true)
    .maybeSingle()
  if (findError) throw findError

  const payload = {
    user_id: userId,
    bank_name: bankName,
    account_holder_name: accountHolderName,
    account_number: accountNumber,
    is_default: true,
  }

  const query = existing
    ? supabase.from('seller_payout_accounts').update(payload).eq('id', existing.id)
    : supabase.from('seller_payout_accounts').insert(payload)

  const { data, error } = await query.select('*').single()
  if (error) throw error
  return toAccountDisplay(data)
}

// --- Earnings -----------------------------------------------------------------

const EMPTY_EARNINGS = { totalEarnings: 0, paidOut: 0, pendingEarnings: 0, itemsSold: 0 }

/** Total/paid/pending earnings for the Profile "Seller Overview" panel and Wallet. */
export async function fetchSellerEarnings(userId) {
  if (!userId) return EMPTY_EARNINGS
  const { data, error } = await supabase
    .from('seller_earnings_stats')
    .select('*')
    .eq('seller_id', userId)
    .maybeSingle()
  if (error) {
    if (isMissingDatabaseObjectError(error)) return EMPTY_EARNINGS
    throw error
  }
  if (!data) return EMPTY_EARNINGS
  return {
    totalEarnings: Number(data.total_earnings),
    paidOut: Number(data.paid_out),
    pendingEarnings: Number(data.pending_earnings),
    itemsSold: data.items_sold,
  }
}

// --- Transaction history -------------------------------------------------------
// Reuses fetchOrders (purchases) and fetchSales (sales) from orders.js rather
// than re-querying orders/order_items here, so there is one source of truth
// for how those rows are shaped.

/**
 * Combined purchase + sale history, newest first, for the Wallet's
 * Transaction History section.
 */
export async function fetchTransactionHistory(userId) {
  if (!userId) return []

  const [orders, sales] = await Promise.all([fetchOrders(userId), fetchSales(userId)])

  const purchases = orders.flatMap((o) =>
    o.items.map((item) => ({
      id: `purchase-${item.id}`,
      type: 'purchase',
      date: o.date,
      name: item.name,
      brand: item.brand,
      amount: -item.price,
      status: item.status,
      orderNumber: o.orderId,
    })),
  )

  const salesRows = sales.map((s) => ({
    id: `sale-${s.id}`,
    type: 'sale',
    date: null,
    name: s.name,
    brand: s.brand,
    amount: s.price,
    status: s.status,
    orderNumber: s.orderNumber,
  }))

  return [...purchases, ...salesRows]
}

// --- Payout history -------------------------------------------------------------

const PAYOUT_STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  paid: 'Paid',
  failed: 'Failed',
}

export function payoutStatusLabel(status) {
  return PAYOUT_STATUS_LABELS[status] ?? status
}

const PAYOUT_FIELDS = `
  id, amount, status, created_at, paid_at,
  order_item:order_items ( title_snapshot, brand_snapshot, image_snapshot ),
  payout_account:seller_payout_accounts ( bank_name, account_number )
`

/** Payout records for the Wallet's Payout History section, newest first. */
export async function fetchPayoutHistory(userId) {
  if (!userId) return []
  const { data, error } = await supabase
    .from('payouts')
    .select(PAYOUT_FIELDS)
    .eq('seller_id', userId)
    .order('created_at', { ascending: false })
  if (error) {
    if (isMissingDatabaseObjectError(error)) return []
    throw error
  }

  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.order_item?.title_snapshot ?? 'Item',
    brand: p.order_item?.brand_snapshot ?? null,
    image: p.order_item?.image_snapshot || '/demo/bag1.png',
    amount: Number(p.amount),
    status: p.status,
    statusLabel: payoutStatusLabel(p.status),
    bankName: p.payout_account?.bank_name ?? null,
    accountMasked: p.payout_account ? maskAccountNumber(p.payout_account.account_number) : null,
    date: new Date(p.created_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    paidAt: p.paid_at,
  }))
}

// --- Payout provider abstraction -------------------------------------------------
// Deliberately unimplemented. A real payout provider integration lands here
// later; until then a payout stays 'pending' rather than being faked as paid.
// This function exists so the rest of the app (and this file's callers) has a
// single seam to call once a provider is wired up.

export async function processSellerPayout(_payoutId) {
  throw new Error(
    'No payout provider is connected yet. Payouts remain pending until one is configured.',
  )
}