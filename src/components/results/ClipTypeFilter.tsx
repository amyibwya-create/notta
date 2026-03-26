'use client'

import { useAppStore } from '@/store/useAppStore'
import { ClipType, CLIP_TYPE_LABELS } from '@/types/clip'

const ALL_TYPES: Array<ClipType | 'all'> = [
  'all',
  'hook',
  'value_proposition',
  'cta',
  'audience_insight',
  'channel_strategy',
  'missed_opportunity',
]

export function ClipTypeFilter() {
  const { pipelineRun, activeClipTypeFilter, setActiveFilter } = useAppStore()
  if (!pipelineRun?.clips.length) return null

  const counts: Record<string, number> = { all: pipelineRun.clips.length }
  for (const clip of pipelineRun.clips) {
    counts[clip.type] = (counts[clip.type] || 0) + 1
  }

  const available = ALL_TYPES.filter((t) => t === 'all' || (counts[t] ?? 0) > 0)

  return (
    <div className="flex flex-wrap gap-1.5">
      {available.map((type) => {
        const isActive = activeClipTypeFilter === type
        const count = counts[type] ?? 0
        const label = type === 'all' ? 'All' : CLIP_TYPE_LABELS[type as ClipType]
        return (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              isActive
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            }`}
          >
            {label}
            <span className={`ml-1 ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
