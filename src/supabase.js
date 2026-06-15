import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nrpdpoigajouxtncveva.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ycGRwb2lnYWpvdXh0bmN2ZXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MDE3MjksImV4cCI6MjA5NzA3NzcyOX0.UBzz33fj0IKHnECukcrhflhFPkWWoCtptfbqrnFTABAre'

export const supabase = createClient(supabaseUrl, supabaseKey)
