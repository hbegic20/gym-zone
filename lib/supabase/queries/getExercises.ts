import type { Exercise, ExerciseFilters } from '@/lib/types/exercise'

const MOCK_EXERCISES: Exercise[] = [
  { id: 'ex-01', name: 'Barbell Bench Press',        muscleGroup: 'chest',     equipment: 'barbell',    videoUrl: '/videos/bench-press.mp4' },
  { id: 'ex-02', name: 'Incline Dumbbell Press',     muscleGroup: 'chest',     equipment: 'dumbbell',   videoUrl: null },
  { id: 'ex-03', name: 'Cable Chest Fly',            muscleGroup: 'chest',     equipment: 'cable',      videoUrl: null },
  { id: 'ex-04', name: 'Push-Up',                    muscleGroup: 'chest',     equipment: 'bodyweight', videoUrl: '/videos/push-up.mp4' },
  { id: 'ex-05', name: 'Barbell Deadlift',           muscleGroup: 'back',      equipment: 'barbell',    videoUrl: null },
  { id: 'ex-06', name: 'Lat Pulldown',               muscleGroup: 'back',      equipment: 'machine',    videoUrl: null },
  { id: 'ex-07', name: 'Seated Cable Row',           muscleGroup: 'back',      equipment: 'cable',      videoUrl: null },
  { id: 'ex-08', name: 'Pull-Up',                    muscleGroup: 'back',      equipment: 'bodyweight', videoUrl: null },
  { id: 'ex-09', name: 'Overhead Press',             muscleGroup: 'shoulders', equipment: 'barbell',    videoUrl: null },
  { id: 'ex-10', name: 'Dumbbell Lateral Raise',     muscleGroup: 'shoulders', equipment: 'dumbbell',   videoUrl: null },
  { id: 'ex-11', name: 'Reverse Pec Deck Fly',       muscleGroup: 'shoulders', equipment: 'machine',    videoUrl: null },
  { id: 'ex-12', name: 'Dumbbell Biceps Curl',       muscleGroup: 'arms',      equipment: 'dumbbell',   videoUrl: null },
  { id: 'ex-13', name: 'Cable Triceps Pushdown',     muscleGroup: 'arms',      equipment: 'cable',      videoUrl: null },
  { id: 'ex-14', name: 'Barbell Back Squat',         muscleGroup: 'legs',      equipment: 'barbell',    videoUrl: null },
  { id: 'ex-15', name: 'Leg Press',                  muscleGroup: 'legs',      equipment: 'machine',    videoUrl: null },
  { id: 'ex-16', name: 'Bulgarian Split Squat With Rear Foot Elevated on Bench', muscleGroup: 'legs', equipment: 'bodyweight', videoUrl: null },
  { id: 'ex-17', name: 'Plank',                      muscleGroup: 'core',      equipment: 'bodyweight', videoUrl: null },
  { id: 'ex-18', name: 'Hanging Leg Raise',          muscleGroup: 'core',      equipment: 'bodyweight', videoUrl: null },
  { id: 'ex-19', name: 'Cable Woodchopper',          muscleGroup: 'core',      equipment: 'cable',      videoUrl: null },
]

export async function getExercises(filters: ExerciseFilters): Promise<Exercise[]> {
  return MOCK_EXERCISES.filter((exercise) => {
    if (filters.muscleGroup && exercise.muscleGroup !== filters.muscleGroup) return false
    if (filters.equipment && exercise.equipment !== filters.equipment) return false
    return true
  })
}
