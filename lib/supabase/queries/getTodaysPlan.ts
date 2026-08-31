import type { TodaysPlan } from '@/lib/types/workout'

/**
 * ⚠️ PHASE 1: returns hardcoded data. There is no Supabase call here yet.
 *
 * This file lives at its *final* address on purpose. When Phase 2 arrives,
 * only the body of `getTodaysPlan` changes — it starts awaiting a real query
 * against `workout_plans` / `plan_exercises`. Every import of it stays
 * identical, so the screen never has to be restructured to gain a backend.
 *
 * That is the whole point of putting a function boundary here instead of
 * inlining the array into the page: the seam is where the change will land,
 * so we put the seam in before we need it.
 */

// --- Mock fixtures -------------------------------------------------------
// Swap which one `getTodaysPlan` returns to preview each state of the screen.
// Building all three now is deliberate: empty states are where UIs usually
// break, and they are much harder to remember once real data exists.

const MOCK_WORKOUT_DAY: TodaysPlan = {
  kind: 'workout',
  date: '2026-08-31',
  title: 'Push Day',
  exercises: [
    { id: 'ex-1', name: 'Barbell Bench Press', muscleGroup: 'Chest', targetSets: 4, targetReps: 8, targetWeightKg: 60 },
    { id: 'ex-2', name: 'Overhead Press', muscleGroup: 'Shoulders', targetSets: 3, targetReps: 10, targetWeightKg: 35 },
    { id: 'ex-3', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', targetSets: 3, targetReps: 12, targetWeightKg: 22.5 },
    { id: 'ex-4', name: 'Cable Triceps Pushdown', muscleGroup: 'Triceps', targetSets: 3, targetReps: 15, targetWeightKg: 25 },
    { id: 'ex-5', name: 'Dips', muscleGroup: 'Triceps', targetSets: 3, targetReps: 10, targetWeightKg: null },
  ],
}

const MOCK_REST_DAY: TodaysPlan = { kind: 'rest', date: '2026-08-31' }

const MOCK_NO_PLAN: TodaysPlan = { kind: 'no-plan' }

// Referenced so the unused fixtures do not trip ESLint while they wait
// their turn. Delete this once the real query lands.
export const MOCK_STATES = { MOCK_WORKOUT_DAY, MOCK_REST_DAY, MOCK_NO_PLAN }

// --- Query ---------------------------------------------------------------

/**
 * `async` even though nothing is awaited yet. The real implementation will be
 * asynchronous, and callers already `await` it — so Phase 2 does not ripple
 * outwards into every call site.
 */
export async function getTodaysPlan(): Promise<TodaysPlan> {
  return MOCK_WORKOUT_DAY
}
