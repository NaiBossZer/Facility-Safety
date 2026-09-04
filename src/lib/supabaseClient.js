import { createClient } from '@supabase/supabase-js'
import { encryptedAuthStorage } from './secureStorage'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Remove legacy plaintext Supabase sessions once. Users sign in again and the
// new session is written through the encrypted adapter below.
try {
  Object.keys(window.localStorage)
    .filter((key) => key.startsWith('sb-') && key.endsWith('-auth-token'))
    .forEach((key) => window.localStorage.removeItem(key));
} catch { /* storage may be disabled */ }

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: encryptedAuthStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export function createBrowserClientIfNeeded() {
  // Return the existing client instance (singleton pattern)
  return supabase
}
