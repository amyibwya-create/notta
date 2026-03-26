'use client'

import { useAppStore } from '@/store/useAppStore'
import { StageName, STAGE_LABELS, STAGE_DESCRIPTIONS } from '@/types/pipeline'
import { formatDuration } from '@/lib/utils'

const STAGE_ORDER: StageName[] = ['analyze', 'extract', 'rewrite', 'score', 'missed']

function StageStep({ name, index }: { name: StageName; index: number }) {
  const { pipelineRun } = useAppStore()
  const stage = pipelineRun?.stages.find((s) => s.name === name)
  const status = stage?.status ?? 'idle'

  const colors = {
    idle: 'bg-gray-100 text-gray-400 border-gray-200',
    running: 'bg-blue-100 text-blue-600 border-blue-300 animate-pulse',
    done: 'bg-green-100 text-green-700 border-green-300',
    error: 'bg-red-100 text-red-600 border-red-300',
  }

  const dotColors = {
    idle: 'bg-gray-300',
    running: 'bg-blue-500 animate-ping',
    done: 'bg-green-500',
    error: 'bg-red-500',
  }

  return (
    <div className="flex-1 min-w-0">
      <div className={`rounded-lg border px-2 py-2 ${colors[status]}`}>
        <div className="flex items-center gap-1.5 mb-0.5">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColors[status]}`} />
          <span className="text-xs font-semibold truncate">{STAGE_LABELS[name]}</span>
          {status === 'done' && stage?.durationMs && (
            <span className="text-xs opacity-60 ml-auto flex-shrink-0">
              {formatDuration(stage.durationMs)}
            </span>
          )}
        </div>
        {status === 'running' && (
          <p className="text-xs opacity-70 truncate">{STAGE_DESCRIPTIONS[name]}</p>
        )}
        {status === 'done' && stage?.outputSummary && (
          <p className="text-xs opacity-70 truncate">{stage.outputSummary}</p>
        )}
        {status === 'error' && stage?.errorMessage && (
          <p className="text-xs opacity-70 truncate">{stage.errorMessage}</p>
        )}
      </div>
    </div>
  )
}

export function PipelineProgress() {
  const { pipelineRun, isProcessing } = useAppStore()
  if (!pipelineRun && !isProcessing) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pipeline</p>
      <div className="flex gap-1.5">
        {STAGE_ORDER.map((name, i) => (
          <StageStep key={name} name={name} index={i} />
        ))}
      </div>
      {pipelineRun?.status === 'complete' && (
        <p className="text-xs text-green-600 font-medium">
          Done in {formatDuration(pipelineRun.totalDurationMs ?? 0)} &middot; {pipelineRun.clips.length} clips extracted
        </p>
      )}
      {pipelineRun?.status === 'error' && (
        <p className="text-xs text-red-500">Pipeline encountered an error. Please try again.</p>
      )}
    </div>
  )
}
