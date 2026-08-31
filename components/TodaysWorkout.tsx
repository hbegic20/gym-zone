'use client'

import { useState } from 'react'
import type { TodaysPlan } from '@/lib/types/workout'
import ExerciseRow from './ExerciseRow'
import WorkoutNotes from './WorkoutNotes'

/**
 * The interactive part of the Today screen.
 *
 * This is where 'use client' goes — as far DOWN the tree as it will go. The
 * page above stays a Server Component, which is what lets it talk to the
 * database directly in Phase 2. If we had marked the page itself as a client
 * component, the data fetch could not live there and we would be restructuring
 * the screen to add a backend.
 */

// Extract narrows the union to just the workout variant, so this component
// never has to consider the rest/no-plan cases — the page already did.
// Writing the props type by hand would duplicate the shape and let the two
// drift apart.
type WorkoutDay = Extract<TodaysPlan, { kind: 'workout' }>

export default function TodaysWorkout({ plan }: { plan: WorkoutDay }) {
  // A Set rather than an array: membership tests are what we actually do
  // here, and `.has()` says what we mean more clearly than `.includes()`.
  const [completedIds, setCompletedIds] = useState<ReadonlySet<string>>(new Set())

  // Stored, NOT derived from `completedIds.size === exercises.length`.
  //
  // "I finished my workout" and "I ticked every box" are different facts.
  // You skip the last exercise because the rack is busy and you are still
  // done for the day. Deriving it would make that unsayable — and this flag
  // is what will eventually be persisted to `daily_checkins`.
  const [sessionDone, setSessionDone] = useState(false)

  function toggleExercise(id: string) {
    // Functional update: React may batch state updates, so deriving the next
    // value from the `completedIds` captured in this closure can read a stale
    // Set. `prev` is always current.
    setCompletedIds((prev) => {
      // Sets are mutable, and mutating in place would keep the same reference —
      // React compares by identity, so the re-render would never happen.
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const completedCount = completedIds.size
  const total = plan.exercises.length

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">{plan.title}</h2>
        <p className="text-sm opacity-60" aria-live="polite">
          {completedCount} of {total} done
        </p>
      </header>

      <ul className="space-y-2">
        {plan.exercises.map((exercise) => (
          // Keyed by the exercise's own id, never by array index — index keys
          // make React reuse the wrong row's DOM if the list is ever
          // reordered or filtered, which quietly moves checkbox state onto a
          // different exercise.
          <li key={exercise.id}>
            <ExerciseRow
              exercise={exercise}
              completed={completedIds.has(exercise.id)}
              onToggle={toggleExercise}
            />
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setSessionDone((done) => !done)}
        aria-pressed={sessionDone}
        className={`w-full rounded-lg border p-3 text-sm font-medium transition-colors ${
          sessionDone
            ? 'border-transparent bg-foreground text-background'
            : 'border-black/15 hover:bg-black/[0.03] dark:border-white/20 dark:hover:bg-white/[0.05]'
        }`}
      >
        {sessionDone ? '✓ Session complete' : 'Mark session complete'}
      </button>

      <WorkoutNotes />
    </div>
  )
}
