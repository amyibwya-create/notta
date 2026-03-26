'use client'

import { useAppStore } from '@/store/useAppStore'
import { ClipTypeFilter } from './ClipTypeFilter'
import { ClipCard } from './ClipCard'
import { MissedOpportunities } from './MissedOpportunities'
import { ExportPanel } from './ExportPanel'

export function ResultsDashboard() {
  const { pipelineRun, activeClipTypeFilter, isProcessing } = useAppStore()

  if (!pipelineRun && !isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-24 text-gray-300">
        <div className="text-6xl mb-4">✦</div>
        <p className="text-lg font-medium text-gray-400">Your ad clips will appear here</p>
        <p className="text-sm text-gray-300 mt-1">
          Paste a transcript and configure your campaign context to get started
        </p>
      </div>
    )
  }

  const clips = pipelineRun?.clips ?? []
  const filtered =
    activeClipTypeFilter === 'all'
      ? clips
      : clips.filter((c) => c.type === activeClipTypeFilter)

  return (
    <div className="space-y-4">
      {clips.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <ClipTypeFilter />
          <ExportPanel />
        </div>
      )}

      {filtered.length === 0 && clips.length > 0 && (
        <p className="text-sm text-gray-400 text-center py-8">
          No clips in this category
        </p>
      )}

      <div className="space-y-4">
        {filtered.map((clip) => (
          <ClipCard key={clip.id} clip={clip} />
        ))}
      </div>

      {pipelineRun?.status === 'complete' && <MissedOpportunities />}
    </div>
  )
}
