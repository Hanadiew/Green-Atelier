import { supabase } from '../supabase.js'

/** Formats an address row for the summary cards used across the app. */
export function toDisplay(row) {
  if (!row) return null
  return {
    id: row.id,
    name: [row.first_name, row.surname].filter(Boolean).join(' '),
    street: [row.street_address, row.apartment].filter(Boolean).join(', '),
    city: row.city,
    state: row.state,
    postcode: row.postcode,
    country: row.country,
    phone: [row.phone_code, row.phone].filter(Boolean).join(' '),
    isDefault: row.is_default,
  }
}

export async function fetchAddresses(userId) {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function fetchDefaultAddress(userId) {
  const rows = await fetchAddresses(userId)
  return rows.find((r) => r.is_default) ?? rows[0] ?? null
}

export async function createAddress(userId, fields) {
  const { data, error } = await supabase
    .from('addresses')
    .insert({
      user_id: userId,
      address_type: fields.addressType ?? 'both',
      first_name: fields.firstName?.trim(),
      surname: fields.surname?.trim() || null,
      company: fields.company?.trim() || null,
      phone_code: fields.phoneCode || null,
      phone: fields.phone?.trim() || null,
      street_address: fields.street?.trim(),
      apartment: fields.apartment?.trim() || null,
      city: fields.city?.trim(),
      state: fields.state || null,
      postcode: fields.postcode?.trim(),
      country: fields.country || 'Malaysia',
      is_default: fields.isDefault ?? false,
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateAddress(id, fields) {
  const payload = {}
  const map = {
    firstName: 'first_name',
    surname: 'surname',
    company: 'company',
    phoneCode: 'phone_code',
    phone: 'phone',
    street: 'street_address',
    apartment: 'apartment',
    city: 'city',
    state: 'state',
    postcode: 'postcode',
    country: 'country',
    isDefault: 'is_default',
    addressType: 'address_type',
  }
  for (const [from, to] of Object.entries(map)) {
    if (from in fields) payload[to] = fields[from] === '' ? null : fields[from]
  }

  const { data, error } = await supabase
    .from('addresses')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function deleteAddress(id) {
  const { error } = await supabase.from('addresses').delete().eq('id', id)
  if (error) throw error
}

export async function setDefaultAddress(id) {
  // A trigger clears whichever address was previously the default.
  const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', id)
  if (error) throw error
}
