import { computed, ref } from 'vue'
import { supabase } from '../supabase.js'

export const session = ref(null)
export const profile = ref(null)
export const authReady = ref(false)

export const user = computed(() => session.value?.user ?? null)
export const userId = computed(() => session.value?.user?.id ?? null)
export const userEmail = computed(() => session.value?.user?.email ?? null)
export const isAuthenticated = computed(() => Boolean(session.value))

export const displayName = computed(() => {
  const p = profile.value
  if (!p) return ''
  return p.full_name || [p.first_name, p.last_name].filter(Boolean).join(' ') || p.username || ''
})

export async function loadProfile() {
  if (!userId.value) {
    profile.value = null
    return null
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId.value)
    .maybeSingle()

  if (error) {
    console.error('Failed to load profile:', error.message)
    return null
  }
  profile.value = data
  return data
}

let initPromise = null

/**
 * Restores any persisted session and starts listening for auth changes.
 * Safe to call more than once — later calls await the first.
 */
export function initAuth() {
  if (initPromise) return initPromise

  initPromise = (async () => {
    const { data } = await supabase.auth.getSession()
    session.value = data.session
    if (session.value) await loadProfile()
    authReady.value = true

    supabase.auth.onAuthStateChange((event, next) => {
      session.value = next
      // supabase-js warns against calling other client methods synchronously
      // inside this callback, so the profile fetch is deferred a tick.
      setTimeout(() => {
        if (next) loadProfile()
        else profile.value = null
      }, 0)
    })
  })()

  return initPromise
}

// --- Sign up ----------------------------------------------------------------

/**
 * Creates an account from an email and password.
 *
 * Returns `{ signedIn }`. When "Confirm email" is disabled in the Supabase
 * dashboard, Supabase issues a session straight away and `signedIn` is true —
 * the user goes right into the app with no email involved. If confirmation is
 * enabled, no session comes back and the caller should ask the user to check
 * their inbox instead.
 */
export async function signUpWithPassword(email, password) {
  const trimmed = email.trim()
  const { data, error } = await supabase.auth.signUp({ email: trimmed, password })

  if (error) {
    if (/already registered|already been registered/i.test(error.message)) {
      throw new Error('An account with that email already exists. Try logging in instead.')
    }
    throw error
  }

  // With confirmation enabled, Supabase deliberately returns a placeholder user
  // for an address that is already taken rather than revealing it exists.
  if (!data.session && data.user && data.user.identities?.length === 0) {
    throw new Error('An account with that email already exists. Try logging in instead.')
  }

  if (data.session) {
    session.value = data.session
    await loadProfile()
    return { signedIn: true }
  }

  return { signedIn: false }
}

export async function setPassword(password) {
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw error
}

export async function updateNames(firstName, lastName) {
  if (!userId.value) return
  const { error } = await supabase
    .from('profiles')
    .update({ first_name: firstName || null, last_name: lastName || null })
    .eq('id', userId.value)
  if (error) throw error
  await loadProfile()
}

// --- Sign in / out ----------------------------------------------------------

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })
  if (error) throw error
  session.value = data.session
  await loadProfile()
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  session.value = null
  profile.value = null
}

export async function changeEmail(email) {
  const { error } = await supabase.auth.updateUser({ email: email.trim() })
  if (error) throw error
}

export async function sendPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/login`,
  })
  if (error) throw error
}
