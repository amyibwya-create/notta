'use client'

import { useAppStore } from '@/store/useAppStore'
import { TranscriptInput } from '@/components/input/TranscriptInput'
import { CampaignContextForm } from '@/components/input/CampaignContextForm'
import { ActionabilityControl } from '@/components/input/ActionabilityControl'
import { PipelineProgress } from '@/components/processing/PipelineProgress'
import { ResultsDashboard } from '@/components/results/ResultsDashboard'

export default function ExtractPage() {
  const { transcript, isProcessing, startPipeline, processingError } = useAppStore()

  const canRun = transcript.trim().length >= 50 && !isProcessing

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
      {/* Left panel — Inputs */}
      <aside className="space-y-5 lg:sticky lg:top-[72px]">
        <TranscriptInput />
        <CampaignContextForm />
        <ActionabilityControl />

        {processingError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
            {processingError}
          </div>
        )}

        <button
          onClick={startPipeline}
          disabled={!canRun}
          className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Extracting…
            </span>
          ) : (
            'Extract Ad Clips'
          )}
        </button>

        <PipelineProgress />
      </aside>

      {/* Right panel — Results */}
      <section className="min-h-[60vh]">
        <ResultsDashboard />
      </section>
    </div>
  )
}
