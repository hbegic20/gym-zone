'use client'

import { useState } from 'react'

/**
 * Free-text notes for the day — one per day, not one per exercise.
 *
 * WHY THE STATE LIVES HERE, not in <TodaysWorkout>:
 *
 * The instinct is to lift all state to the nearest common parent. But every
 * keystroke updates this value, and if the parent owned it, every keystroke
 * would re-render the parent — and therefore every ExerciseRow beneath it.
 * Five rows today is harmless; it is the habit that matters.
 *
 * The rule this illustrates: lift state up when something else needs to read
 * it, and no sooner. Nothing outside this box reads the notes text, so it
 * stays here.
 *
 * (In Phase 2 this becomes a debounced write to `daily_checkins`. That still
 * does not require lifting the text itself — only the save call.)
 */

export default function WorkoutNotes() {
  const [notes, setNotes] = useState('')

  return (
    <section className="space-y-2">
      <label htmlFor="workout-notes" className="block text-sm font-medium opacity-70">
        Notes
      </label>
      <textarea
        id="workout-notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder="How did it feel? Anything to change next time?"
        className="w-full resize-y rounded-lg border border-black/10 bg-transparent p-3 text-sm outline-none placeholder:opacity-40 focus:border-black/30 dark:border-white/15 dark:focus:border-white/40"
      />
      {/* Deliberately no Save button yet — there is nowhere to save to until
          Phase 2. Better an obviously-missing feature than a button that lies. */}
    </section>
  )
}
