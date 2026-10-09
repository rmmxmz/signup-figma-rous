import { createClient } from '@supabase/supabase-js'
 
// Vite reads these from .env.local when the dev server starts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
 
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase settings. Check .env.local, then restart npm run dev.')
}
 
// One shared client for the whole app. Other files import this.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
 
// ----- TEMPORARY CONNECTION TEST (delete after Step 2.10) -----
fetch(`${supabaseUrl}/auth/v1/health`, {
  headers: { apikey: supabaseAnonKey },
})
  .then((res) => res.json())
  .then((data) => console.log('Supabase is connected:', data))
  .catch((err) => console.error('Cannot reach Supabase:', err))
