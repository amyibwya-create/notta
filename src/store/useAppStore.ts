'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CampaignContext, DEFAULT_CAMPAIGN_CONTEXT } from '@/types/campaign'
import { ClipType } from '@/types/clip'
import { PipelineRun, StageName } from '@/types/pipeline'
import { SSEEvent } from '@/lib/pipeline/orchestrator'
import { buildExportBundle, downloadJSON, buildAllClipsText, copyToClipboard } from '@/lib/export'

interface AppState {
  // Inputs
  transcript: string
  campaignContext: CampaignContext
  userActionabilityPct: number | null

  // Pipeline state
  pipelineRun: PipelineRun | null
  isProcessing: boolean
  processingError: string | null

  // Results UI
  activeClipTypeFilter: ClipType | 'all'
  selectedClipId: string | null

  // Actions
  setTranscript: (t: string) => void
  setCampaignContext: (c: Partial<CampaignContext>) => void
  setUserActionabilityPct: (pct: number | null) => void
  setActiveFilter: (f: ClipType | 'all') => void
  setSelectedClip: (id: string | null) => void
  startPipeline: () => Promise<void>
  resetPipeline: () => void
  exportAsJSON: () => void
  copyAllClips: () => Promise<void>
}

function createInitialRun(): PipelineRun {
  return {
    id: '',
    createdAt: '',
    stages: [
      { name: 'analyze', status: 'idle' },
      { name: 'extract', status: 'idle' },
      { name: 'rewrite', status: 'idle' },
      { name: 'score', status: 'idle' },
      { name: 'missed', status: 'idle' },
    ],
    clips: [],
    missedOpportunities: [],
    status: 'idle',
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      transcript: '',
      campaignContext: DEFAULT_CAMPAIGN_CONTEXT,
      userActionabilityPct: null,
      pipelineRun: null,
      isProcessing: false,
      processingError: null,
      activeClipTypeFilter: 'all',
      selectedClipId: null,

      setTranscript: (t) => set({ transcript: t }),
      setCampaignContext: (c) =>
        set((s) => ({ campaignContext: { ...s.campaignContext, ...c } })),
      setUserActionabilityPct: (pct) => set({ userActionabilityPct: pct }),
      setActiveFilter: (f) => set({ activeClipTypeFilter: f }),
      setSelectedClip: (id) => set({ selectedClipId: id }),

      resetPipeline: () =>
        set({
          pipelineRun: null,
          isProcessing: false,
          processingError: null,
          activeClipTypeFilter: 'all',
          selectedClipId: null,
        }),

      startPipeline: async () => {
        const { transcript, campaignContext, userActionabilityPct } = get()
        set({
          isProcessing: true,
          processingError: null,
          pipelineRun: createInitialRun(),
        })

        try {
          const res = await fetch('/api/pipeline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript, campaignContext, userActionabilityPct }),
          })

          if (!res.ok || !res.body) {
            const text = await res.text().catch(() => 'Unknown error')
            throw new Error(`Pipeline request failed: ${text}`)
          }

          const reader = res.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ''

          while (true) {
            const { value, done } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })

            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const raw = line.slice(6).trim()
              if (!raw) continue
              try {
                const event: SSEEvent = JSON.parse(raw)
                applySSEEvent(event, set, get)
              } catch {
                // ignore malformed SSE
              }
            }
          }
        } catch (err) {
          set({
            isProcessing: false,
            processingError: err instanceof Error ? err.message : String(err),
          })
        }
      },

      exportAsJSON: () => {
        const { pipelineRun, campaignContext } = get()
        if (!pipelineRun) return
        const bundle = buildExportBundle(pipelineRun, campaignContext)
        downloadJSON(bundle)
      },

      copyAllClips: async () => {
        const { pipelineRun, campaignContext } = get()
        if (!pipelineRun) return
        const bundle = buildExportBundle(pipelineRun, campaignContext)
        await copyToClipboard(buildAllClipsText(bundle))
      },
    }),
    {
      name: 'notta-session',
      partialize: (s) => ({
        transcript: s.transcript,
        campaignContext: s.campaignContext,
        userActionabilityPct: s.userActionabilityPct,
        pipelineRun: s.pipelineRun,
      }),
    }
  )
)

function applySSEEvent(
  event: SSEEvent,
  set: (partial: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => void,
  get: () => AppState
) {
  const run = get().pipelineRun
  if (!run) return

  switch (event.event) {
    case 'stage_start': {
      set((s) => ({
        pipelineRun: s.pipelineRun
          ? {
              ...s.pipelineRun,
              stages: s.pipelineRun.stages.map((st) =>
                st.name === event.stage
                  ? { ...st, status: 'running', startedAt: new Date().toISOString() }
                  : st
              ),
            }
          : null,
      }))
      break
    }
    case 'stage_done': {
      set((s) => ({
        pipelineRun: s.pipelineRun
          ? {
              ...s.pipelineRun,
              stages: s.pipelineRun.stages.map((st) =>
                st.name === event.stage
                  ? {
                      ...st,
                      status: 'done',
                      completedAt: new Date().toISOString(),
                      durationMs: event.durationMs,
                      outputSummary: event.summary,
                    }
                  : st
              ),
            }
          : null,
      }))
      break
    }
    case 'stage_error': {
      set((s) => ({
        pipelineRun: s.pipelineRun
          ? {
              ...s.pipelineRun,
              stages: s.pipelineRun.stages.map((st) =>
                st.name === event.stage
                  ? { ...st, status: 'error', errorMessage: event.message }
                  : st
              ),
            }
          : null,
        processingError: event.message,
      }))
      break
    }
    case 'clips_batch': {
      set((s) => ({
        pipelineRun: s.pipelineRun
          ? { ...s.pipelineRun, clips: event.clips }
          : null,
      }))
      break
    }
    case 'pipeline_complete': {
      set({
        pipelineRun: event.run,
        isProcessing: false,
      })
      break
    }
  }
}
