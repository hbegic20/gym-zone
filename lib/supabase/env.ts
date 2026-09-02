/**
 * Supabase connection values, read and validated once.
 *
 * Shared by client.ts and server.ts so the two can't drift apart — one place
 * that decides what a valid configuration looks like.
 *
 * These MUST be literal `process.env.NEXT_PUBLIC_X` property accesses. Next.js
 * inlines them into the browser bundle by textual substitution at build time;
 * a dynamic lookup like `process.env[name]` is never substituted and arrives
 * as undefined in the browser.
 */
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const rawPublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!rawUrl || !rawPublishableKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. ' +
      'Check .env.local — the filename must have no leading space.',
  )
}

// Narrowed copies: TypeScript re-widens these to `string | undefined` inside a
// function body, since a closure could run at any time. Capturing them here,
// where the guard above still applies, is what lets the clients typecheck
// without a cast.
export const SUPABASE_URL: string = rawUrl
export const SUPABASE_PUBLISHABLE_KEY: string = rawPublishableKey
