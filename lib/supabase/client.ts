import { createBrowserClient } from '@supabase/ssr'
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './env'

/**
 * Supabase client for Client Components (browser).
 *
 * A factory, not an instance: importing this module constructs nothing.
 * createBrowserClient reuses the underlying client across calls, so calling
 * this wherever you need it is cheap.
 *
 * Safe as a shared instance in principle — a browser only ever has one user —
 * but written as a factory anyway so both clients have the same call shape.
 */
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
}
