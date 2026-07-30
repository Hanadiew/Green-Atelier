import { supabase } from '../supabase.js'

/** Works for signed-out visitors too — `user_id` is simply left null. */
export async function submitContactMessage({ name, email, subject, message }, userId = null) {
  const { error } = await supabase.from('contact_messages').insert({
    user_id: userId,
    name: name.trim(),
    email: email.trim(),
    subject: subject?.trim() || null,
    message: message.trim(),
  })
  if (error) throw error
}
