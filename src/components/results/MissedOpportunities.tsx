'use client'

import { useAppStore } from '@/store/useAppStore'

export function MissedOpportunities() {
  const { pipelineRun } = useAppStore()
  const missed = pipelineRun?.missedOpportunities ?? []
  if (!missed.length) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-700">Overlooked Opportunities</h3>
        <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium border border-yellow-200">
          {missed.length}
        </span>
      </div>
      <div className="space-y-2">
        {missed.map((m) => (
          <div
            key={m.id}
            className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 space-y-1.5"
          >
            <p className="text-sm font-semibold text-yellow-800">{m.angle}</p>
            <p className="text-xs text-yellow-700">{m.observation}</p>
            <div className="pt-1 border-t border-yellow-200">
              <p className="text-xs text-yellow-600 italic">{m.suggestedClipDirection}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
