import { supabase } from '../supabase.js'

export async function fetchProfile(id) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function fetchProfileByUsername(username) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .maybeSingle()
  if (error) throw error
  return data
}

/** Listing, sale and follower counts from the profile_stats view. */
export async function fetchProfileStats(id) {
  const { data, error } = await supabase
    .from('profile_stats')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return {
    itemsForSale: data?.items_for_sale ?? 0,
    sold: data?.sold_count ?? 0,
    followers: data?.followers_count ?? 0,
    following: data?.following_count ?? 0,
    co2SavedKg: data?.co2_saved_kg ? Number(data.co2_saved_kg) : 0,
  }
}

/**
 * Updates the caller's own profile. `is_trusted_seller` is deliberately not
 * accepted here — a database trigger would reject it anyway.
 */
export async function updateProfile(id, fields) {
  const allowed = ['first_name', 'last_name', 'username', 'bio', 'avatar_url', 'phone', 'city', 'state', 'country']
  const payload = {}
  for (const key of allowed) {
    if (key in fields) payload[key] = fields[key] === '' ? null : fields[key]
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    // 23505 is a unique violation, which here can only be the username index.
    if (error.code === '23505') throw new Error('That username is already taken.')
    if (error.code === '23514') {
      throw new Error('Usernames must be 3-30 characters, using lowercase letters, numbers, dots or underscores.')
    }
    throw error
  }
  return data
}

export async function uploadAvatar(file, ownerId) {
  const dot = file.name.lastIndexOf('.')
  const ext = dot > -1 ? file.name.slice(dot).toLowerCase() : '.png'
  const path = `${ownerId}/avatar${ext}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, cacheControl: '3600' })
  if (error) throw error

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  // Cache-bust so a replaced avatar shows immediately.
  const url = `${data.publicUrl}?v=${Date.now()}`
  await updateProfile(ownerId, { avatar_url: url })
  return url
}

// --- Notification settings --------------------------------------------------

export async function fetchSettings(userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function updateSettings(userId, fields) {
  const { error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, ...fields }, { onConflict: 'user_id' })
  if (error) throw error
}

// --- Follows ----------------------------------------------------------------

export async function isFollowing(followerId, followingId) {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
  if (error) throw error
  return (count ?? 0) > 0
}

export async function followUser(followerId, followingId) {
  const { error } = await supabase.from('follows').insert({
    follower_id: followerId,
    following_id: followingId,
  })
  if (error && error.code !== '23505') throw error
}

export async function unfollowUser(followerId, followingId) {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
  if (error) throw error
}
