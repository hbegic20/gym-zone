/**
 * Domain types for the workout planner.
 *
 * IMPORTANT: this file must stay framework-agnostic — no Next.js, no React,
 * no Supabase imports. It describes *what a workout is*, not how it is
 * fetched or rendered. That is what makes the eventual React Native app a
 * mechanical move rather than a redesign (see CLAUDE.md).
 */

export type PlannedExercise = {
  id: string
  name: string
  muscleGroup: string
  targetSets: number
  targetReps: number
  /** null means bodyweight — deliberately not 0, which would mean "0 kg". */
  targetWeightKg: number | null
}

/**
 * A discriminated union, not an object with optional fields.
 *
 * The naive shape would be `{ exercises: PlannedExercise[] }` and then
 * checking `exercises.length === 0` to decide what to show. That cannot
 * distinguish "this user has no plan at all" from "today is a rest day" —
 * both are empty — even though they need opposite UI. A new user would be
 * told to enjoy their rest day.
 *
 * Encoding the states as separate variants makes the invalid combinations
 * unrepresentable, and lets TypeScript force every consumer to handle each
 * case explicitly.
 */
export type TodaysPlan =
  | { kind: 'no-plan' }
  | { kind: 'rest'; date: string }
  | {
      kind: 'workout'
      date: string
      title: string
      exercises: PlannedExercise[]
    }
