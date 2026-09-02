import type { Exercise } from '@/lib/types/exercise'

export default function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <article className="rounded-lg border border-black/10 p-3 dark:border-white/15">
      <h2 className="font-medium">{exercise.name}</h2>
      <p className="mt-0.5 text-sm capitalize opacity-60">
        {exercise.muscleGroup} · {exercise.equipment}
      </p>
    </article>
  )
}
