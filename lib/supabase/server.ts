import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './env'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },

      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Components cannot set cookies — rendering has already begun
          // by the time this runs, so the headers are gone. Only Server Actions
          // and Route Handlers can write them.
          //
          // Safe to swallow ONLY because a refresh that fails here will be
          // retried. Once auth exists, middleware should refresh the session
          // before rendering, which is where the write actually lands.
          // Until then there are no sessions to refresh, so this never fires.
        }
      },
    },
  })
}
