import { ref } from 'vue'
import { supabase } from '../supabase.js'
import { userId } from './auth.js'

/**
 * Promo code discovery for shoppers.
 *
 * Buyers previously had no way to learn a code existed — they had to be told one.
 * These helpers read the live codes so the storefront can advertise them and apply
 * them automatically.
 *
 * Reading them is safe: promo_codes_select_active exposes only `is_active` rows to
 * a normal user, and the amounts are recomputed by validate_promo_code() inside
 * Postgres, which create_pending_order() calls again before charging anything.
 * Nothing here decides a discount.
 */

export const livePromos = ref([])

function toPromo(row) {
  const isPercent = row.discount_type === 'percent'
  return {
    code: row.code,
    description: row.description,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    minSubtotal: Number(row.min_subtotal),
    maxDiscount: row.max_discount === null ? null : Number(row.max_discount),
    validUntil: row.valid_until,
    usageLimit: row.usage_limit,
    timesUsed: row.times_used,
    // "15% off" / "RM 50 off"
    headline: isPercent ? `${Number(row.discount_value)}% off` : `RM ${Number(row.discount_value)} off`,
    condition:
      Number(row.min_subtotal) > 0
        ? `on orders over RM ${Number(row.min_subtotal).toLocaleString()}`
        : 'on any order',
  }
}

/** Every currently-usable code, cheapest condition first. */
export async function fetchLivePromos() {
  const nowIso = new Date().toISOString()
  const { data, error } = await supabase
    .from('promo_codes')
    .select(
      'code, description, discount_type, discount_value, min_subtotal, max_discount, valid_until, usage_limit, times_used',
    )
    .eq('is_active', true)
    .or(`valid_until.is.null,valid_until.gt.${nowIso}`)
    .order('min_subtotal', { ascending: true })

  if (error) throw error

  // A code that has burnt through its usage limit is live in the table but not
  // usable, so it must not be advertised.
  const usable = (data ?? []).filter(
    (row) => row.usage_limit === null || Number(row.times_used) < Number(row.usage_limit),
  )

  livePromos.value = usable.map(toPromo)
  return livePromos.value
}

/**
 * What a code is worth on a given subtotal, according to the database.
 *
 * Always ask Postgres rather than recomputing here: validate_promo_code() also
 * enforces the date window, the usage limit and max_discount, and it is the same
 * function that runs when the order is actually priced.
 */
export async function validatePromo(code, subtotal) {
  const { data, error } = await supabase.rpc('validate_promo_code', {
    p_code: code,
    p_subtotal: subtotal,
  })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  return {
    valid: Boolean(row?.valid),
    discount: Number(row?.discount ?? 0),
    reason: row?.reason ?? null,
  }
}

/**
 * The code that saves this buyer the most on `subtotal`, or null.
 *
 * Each candidate is validated server-side, so an expired or exhausted code can
 * never be auto-applied just because it looked eligible client-side.
 */
export async function bestPromoFor(subtotal) {
  if (!subtotal || subtotal <= 0) return null

  const promos = livePromos.value.length ? livePromos.value : await fetchLivePromos()
  const eligible = promos.filter((p) => subtotal >= p.minSubtotal)
  if (!eligible.length) return null

  const checked = await Promise.all(
    eligible.map(async (promo) => {
      try {
        const result = await validatePromo(promo.code, subtotal)
        return result.valid ? { ...promo, discount: result.discount } : null
      } catch {
        return null
      }
    }),
  )

  return checked
    .filter(Boolean)
    .sort((a, b) => b.discount - a.discount)[0] ?? null
}

/**
 * Whether this is the buyer's first order — what makes a welcome code relevant.
 * Counts every order regardless of payment state: someone mid-checkout is no
 * longer a first-time buyer by the time they come back.
 */
export async function isFirstTimeBuyer() {
  if (!userId.value) return false
  const { count, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('buyer_id', userId.value)

  if (error) {
    console.error('Could not check order history:', error.message)
    return false
  }
  return (count ?? 0) === 0
}

/** The welcome code, if one is live. Matched by name so admin can retire it. */
export function welcomePromo() {
  return livePromos.value.find((p) => p.code.startsWith('WELCOME')) ?? null
}
