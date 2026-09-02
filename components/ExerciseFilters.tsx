'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { EQUIPMENT, MUSCLE_GROUPS } from '@/lib/types/exercise'

const SELECT_CLASS =
  'rounded-lg border border-black/10 bg-transparent px-3 py-1.5 text-sm capitalize dark:border-white/15'

export default function ExerciseFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const muscleGroup = searchParams.get('muscle') ?? ''
  const equipment = searchParams.get('equipment') ?? ''
  const hasActiveFilter = muscleGroup !== '' || equipment !== ''

  function updateFilter(key: 'muscle' | 'equipment', value: string) {
    const params = new URLSearchParams(searchParams)

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    const query = params.toString()

    router.push(query ? `/library?${query}` : '/library')
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="Filter by muscle group"
        className={SELECT_CLASS}
        value={muscleGroup}
        onChange={(e) => updateFilter('muscle', e.target.value)}
      >
        <option value="">All muscles</option>
        {MUSCLE_GROUPS.map((group) => (
          <option key={group} value={group}>
            {group}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by equipment"
        className={SELECT_CLASS}
        value={equipment}
        onChange={(e) => updateFilter('equipment', e.target.value)}
      >
        <option value="">All equipment</option>
        {EQUIPMENT.map((eq) => (
          <option key={eq} value={eq}>
            {eq}
          </option>
        ))}
      </select>

      {hasActiveFilter && (
        <button
          type="button"
          onClick={() => router.push('/library')}
          className="text-sm underline opacity-70 hover:opacity-100"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
