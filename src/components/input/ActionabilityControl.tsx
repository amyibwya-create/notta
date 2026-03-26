'use client'

import { useAppStore } from '@/store/useAppStore'

export function ActionabilityControl() {
  const { userActionabilityPct, setUserActionabilityPct, pipelineRun, isProcessing } = useAppStore()
  const suggestedPct = pipelineRun?.analysisResult?.suggestedActionabilityPct ?? null

  const displayPct = userActionabilityPct ?? suggestedPct ?? 0.4
  const sliderValue = Math.round(displayPct * 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Actionability Filter</label>
        <span className="text-sm font-semibold text-blue-600">{sliderValue}%</span>
      </div>

      <input
        type="range"
        min={10}
        max={100}
        step={5}
        value={sliderValue}
        onChange={(e) => setUserActionabilityPct(Number(e.target.value) / 100)}
        disabled={isProcessing}
        className="w-full accent-blue-600 disabled:opacity-50"
      />

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>10% (most selective)</span>
        <span>100% (use everything)</span>
      </div>

      {suggestedPct !== null && userActionabilityPct === null && (
        <p className="text-xs text-blue-500">
          AI suggests {Math.round(suggestedPct * 100)}% — adjust to override
        </p>
      )}

      {suggestedPct !== null && userActionabilityPct !== null && (
        <button
          onClick={() => setUserActionabilityPct(null)}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          Reset to AI suggestion ({Math.round(suggestedPct * 100)}%)
        </button>
      )}

      {suggestedPct === null && (
        <p className="text-xs text-gray-400">
          AI will suggest a percentage after analyzing your transcript
        </p>
      )}
    </div>
  )
}
