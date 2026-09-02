import type { TodaysPlan } from '@/lib/types/workout'

const MOCK_WORKOUT_DAY: TodaysPlan = {
  kind: 'workout',
  date: '2026-08-31',
  title: 'Push Day',
  exercises: [
    { id: 'ex-1', name: 'Barbell Bench Press', muscleGroup: 'Chest', targetSets: 4, targetReps: 8, targetWeightKg: 60 },
    { id: 'ex-2', name: 'Overhead Press', muscleGroup: 'Shoulders', targetSets: 3, targetReps: 10, targetWeightKg: 35 },
    { id: 'ex-3', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', targetSets: 3, targetReps: 12, targetWeightKg: 22.5 },
    { id: 'ex-4', name: 'Cable Triceps Pushdown', muscleGroup: 'Triceps', targetSets: 3, targetReps: 15, targetWeightKg: 25 },
    { id: 'ex-5', name: 'Dips', muscleGroup: 'Triceps', targetSets: 3, targetReps: 10, targetWeightKg: null },
  ],
}

const MOCK_REST_DAY: TodaysPlan = { kind: 'rest', date: '2026-08-31' }

const MOCK_NO_PLAN: TodaysPlan = { kind: 'no-plan' }

export const MOCK_STATES = { MOCK_WORKOUT_DAY, MOCK_REST_DAY, MOCK_NO_PLAN }

export async function getTodaysPlan(): Promise<TodaysPlan> {
  return MOCK_WORKOUT_DAY
}
