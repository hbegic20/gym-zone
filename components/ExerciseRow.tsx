import type { PlannedExercise } from '@/lib/types/workout'

/**
 * One row in the workout checklist.
 *
 * Note there is NO 'use client' at the top of this file, even though it
 * renders a checkbox with an onChange handler. It does not need one: it is
 * only ever imported by <TodaysWorkout>, which is already a Client Component,
 * and the boundary is inherited by everything below it. Adding a redundant
 * 'use client' here would not break anything, but it would suggest this file
 * is a boundary in its own right, which it is not.
 *
 * This component holds no state. It is told whether it is completed and is
 * handed a callback — which keeps it trivial to reason about and to test.
 */

type ExerciseRowProps = {
  exercise: PlannedExercise
  completed: boolean
  onToggle: (id: string) => void
}

export default function ExerciseRow({ exercise, completed, onToggle }: ExerciseRowProps) {
  const target = [
    `${exercise.targetSets} × ${exercise.targetReps}`,
    exercise.targetWeightKg === null ? 'bodyweight' : `${exercise.targetWeightKg} kg`,
  ].join(' · ')

  return (
    // <label> wraps the whole row so tapping anywhere on it toggles the
    // checkbox. On a phone, at the gym, a 16px checkbox is a poor target.
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
        completed
          ? 'border-black/5 bg-black/[0.03] dark:border-white/5 dark:bg-white/[0.04]'
          : 'border-black/10 hover:bg-black/[0.02] dark:border-white/15 dark:hover:bg-white/[0.03]'
      }`}
    >
      <input
        type="checkbox"
        checked={completed}
        onChange={() => onToggle(exercise.id)}
        className="size-5 shrink-0 accent-current"
      />

      <span className="min-w-0 flex-1">
        <span className={`block truncate font-medium ${completed ? 'line-through opacity-50' : ''}`}>
          {exercise.name}
        </span>
        <span className="block text-sm opacity-60">
          {exercise.muscleGroup} · {target}
        </span>
      </span>
    </label>
  )
}
