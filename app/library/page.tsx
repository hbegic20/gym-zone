import Link from 'next/link'
import {
  EQUIPMENT,
  MUSCLE_GROUPS,
  type Equipment,
  type ExerciseFilters,
  type MuscleGroup,
} from '@/lib/types/exercise'
import { getExercises } from '@/lib/supabase/queries/getExercises'
import { createClient } from '@/lib/supabase/server'
import ExerciseCard from '@/components/ExerciseCard'
import ExerciseFilterControls from '@/components/ExerciseFilters'

function parseFilter<T extends string>(
  raw: string | string[] | undefined,
  allowed: readonly T[],
): T | null {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (value === undefined) return null
  return (allowed as readonly string[]).includes(value) ? (value as T) : null
}

export default async function LibraryPage({ searchParams }: PageProps<'/library'>) {
  const params = await searchParams

  const filters: ExerciseFilters = {
    muscleGroup: parseFilter<MuscleGroup>(params.muscle, MUSCLE_GROUPS),
    equipment: parseFilter<Equipment>(params.equipment, EQUIPMENT),
  }

  const supabase = await createClient()
  const exercises = await getExercises(supabase, filters)
  const hasActiveFilter = filters.muscleGroup !== null || filters.equipment !== null

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Exercise library</h1>

      <p className="mt-1 text-sm opacity-60">
        {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'}
      </p>

      <div className="mt-5">
        <ExerciseFilterControls />
      </div>

      <div className="mt-6">
        {exercises.length > 0 ? (
          <ul className="space-y-2">
            {exercises.map((exercise) => (
              <li key={exercise.id}>
                <ExerciseCard exercise={exercise} />
              </li>
            ))}
          </ul>
        ) : hasActiveFilter ? (
          <div className="space-y-3 rounded-lg border border-dashed border-black/15 p-6 text-center dark:border-white/20">
            <p className="text-sm opacity-70">
              No exercises match{' '}
              <span className="font-medium capitalize">
                {[filters.muscleGroup, filters.equipment].filter(Boolean).join(' + ')}
              </span>
              .
            </p>
            <Link href="/library" className="inline-block text-sm font-medium underline">
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-black/15 p-6 text-center dark:border-white/20">
            <p className="text-sm opacity-70">No exercises in the library yet.</p>
          </div>
        )}
      </div>
    </main>
  )
}
