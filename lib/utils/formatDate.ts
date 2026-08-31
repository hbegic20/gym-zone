/**
 * Formats an ISO date (YYYY-MM-DD) as e.g. "Tuesday, 31 August".
 *
 * Call this on the SERVER only, and pass the resulting string down as a prop.
 *
 * Why: `toLocaleDateString` depends on the machine's locale and timezone.
 * Next.js renders Client Components once on the server and again in the
 * browser to hydrate them — if those two machines disagree about locale, the
 * two renders produce different text and React reports a hydration mismatch.
 * Formatting once on the server sidesteps the whole class of bug.
 */
export function formatWorkoutDate(isoDate: string): string {
  // Append T00:00:00 so the string is parsed as local time rather than UTC,
  // which otherwise shifts the date backwards for anyone west of Greenwich.
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}
