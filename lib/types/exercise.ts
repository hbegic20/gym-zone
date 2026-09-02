export const MUSCLE_GROUPS = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core'] as const
export const EQUIPMENT = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight'] as const

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number]
export type Equipment = (typeof EQUIPMENT)[number]

export type Exercise = {
  id: string
  name: string
  muscleGroup: MuscleGroup
  equipment: Equipment
  videoUrl: string | null
}

export type ExerciseFilters = {
  muscleGroup: MuscleGroup | null
  equipment: Equipment | null
}
