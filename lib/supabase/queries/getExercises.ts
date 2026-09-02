import type { SupabaseClient } from '@supabase/supabase-js'
import type { Exercise, ExerciseFilters } from '@/lib/types/exercise'

/**
 * Reads the exercise catalogue.
 *
 * Takes the Supabase client as an argument rather than importing one — see the
 * portability rule in CLAUDE.md. The caller knows whether it is a Server
 * Component or (later) a React Native screen; this function doesn't need to.
 * It also means tests can pass a stub instead of standing up a database.
 */
export async function getExercises(
  supabase: SupabaseClient,
  filters: ExerciseFilters,
): Promise<Exercise[]> {
  // Built up rather than chained in one expression: each filter is applied only
  // when it is set, so a null filter adds no constraint at all.
  let query = supabase
    .from('exercises')
    .select('id, name, muscle_group, equipment, video_url')
    // Postgres gives no ordering guarantee without this. Without it the list
    // could quietly reshuffle between requests.
    .order('name')

  if (filters.muscleGroup) query = query.eq('muscle_group', filters.muscleGroup)
  if (filters.equipment) query = query.eq('equipment', filters.equipment)

  const { data, error } = await query

  // Throw rather than fall back to []. When RLS denies a read, Supabase returns
  // an empty array and no error — so an empty result is already ambiguous.
  // Swallowing a real error here would make a broken query indistinguishable
  // from an empty table, and you would debug the wrong layer for an hour.
  if (error) {
    throw new Error(`Failed to load exercises: ${error.message}`)
  }

  // snake_case columns become camelCase domain objects here, at the boundary.
  // Everything above this function speaks the domain language and never learns
  // what the columns are called.
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    muscleGroup: row.muscle_group,
    equipment: row.equipment,
    videoUrl: row.video_url,
  }))
}
