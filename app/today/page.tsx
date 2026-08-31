import Link from 'next/link'
import type { TodaysPlan } from '@/lib/types/workout'
import { getTodaysPlan } from '@/lib/supabase/queries/getTodaysPlan'
import { formatWorkoutDate } from '@/lib/utils/formatDate'
import TodaysWorkout from '@/components/TodaysWorkout'
import WorkoutNotes from '@/components/WorkoutNotes'

/**
 * Today's workout — /today
 *
 * A Server Component (the App Router default: note the absence of
 * 'use client'). Nothing in this file ships to the browser, which is why it
 * can call getTodaysPlan() directly. In Phase 2 that becomes a real Supabase
 * query and this file does not change shape at all.
 */
export default async function TodayPage() {
  const plan = await getTodaysPlan()

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        {plan.kind === 'no-plan' ? 'Today' : formatWorkoutDate(plan.date)}
      </h1>
      {renderPlan(plan)}
    </main>
  )
}

/**
 * Switching on the discriminant rather than testing `exercises.length`.
 *
 * The `default` branch is the interesting part: assigning `plan` to a
 * `never` only type-checks if every variant has already been handled above.
 * Add a fourth state to TodaysPlan later — say 'deload-week' — and this line
 * becomes a compile error pointing straight at the code that forgot about it.
 * That turns "we forgot an empty state" from a bug users find into a build
 * failure we find.
 */
function renderPlan(plan: TodaysPlan) {
  switch (plan.kind) {
    case 'workout':
      return <TodaysWorkout plan={plan} />

    case 'rest':
      return (
        <div className="space-y-6">
          <p className="rounded-lg border border-black/10 p-4 text-sm opacity-70 dark:border-white/15">
            Rest day — nothing scheduled. Recovery is part of the plan.
          </p>
          {/* Notes stay available: how a rest day felt is worth recording. */}
          <WorkoutNotes />
        </div>
      )

    case 'no-plan':
      return (
        <div className="space-y-4 rounded-lg border border-dashed border-black/15 p-6 text-center dark:border-white/20">
          <p className="text-sm opacity-70">
            You don&apos;t have a workout plan yet.
          </p>
          {/* This route does not exist yet — the CTA is here because the
              state is meaningless without a way out of it. */}
          <Link
            href="/plan/new"
            className="inline-block rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Create a plan
          </Link>
        </div>
      )

    default: {
      const _exhaustive: never = plan
      return _exhaustive
    }
  }
}
