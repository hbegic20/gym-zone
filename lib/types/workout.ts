export type PlannedExercise = {
  id: string
  name: string
  muscleGroup: string
  targetSets: number
  targetReps: number
  targetWeightKg: number | null
}

export type TodaysPlan =
  | { kind: 'no-plan' }
  | { kind: 'rest'; date: string }
  | {
      kind: 'workout'
      date: string
      title: string
      exercises: PlannedExercise[]
    }
