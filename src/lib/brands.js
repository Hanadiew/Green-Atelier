import { supabase } from '../supabase.js'

export async function fetchBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('id, name, slug, logo_url')
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data ?? []
}
