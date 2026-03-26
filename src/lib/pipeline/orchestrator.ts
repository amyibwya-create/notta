import { CampaignContext } from '@/types/campaign'
import { AdClip, ClipType, MissedOpportunity } from '@/types/clip'
import { AnalysisResult } from '@/types/transcript'
import { PipelineRun, PipelineStage, StageName } from '@/types/pipeline'
import { generateId } from '@/lib/utils'
import { runAnalyzeStage } from './stage-analyze'
import { runExtractStage } from './stage-extract'
import { runRewriteStage } from './stage-rewrite'
import { runScoreStage } from './stage-score'
import { runMissedStage } from './stage-missed'

export type SSEEvent =
  | { event: 'stage_start'; stage: StageName }
  | { event: 'stage_done'; stage: StageName; summary: string; durationMs: number }
  | { event: 'stage_error'; stage: StageName; message: string }
  | { event: 'clips_batch'; clips: AdClip[] }
  | { event: 'pipeline_complete'; run: PipelineRun }

export type SSECallback = (event: SSEEvent) => void

function makeStage(name: StageName): PipelineStage {
  return { name, status: 'idle' }
}

export async function runPipeline(
  transcript: string,
  context: CampaignContext,
  userActionabilityPct: number | null,
  emit: SSECallback
): Promise<PipelineRun> {
  const runId = generateId('run')
  const startTime = Date.now()

  const run: PipelineRun = {
    id: runId,
    createdAt: new Date().toISOString(),
    stages: (['analyze', 'extract', 'rewrite', 'score', 'missed'] as StageName[]).map(makeStage),
    clips: [],
    missedOpportunities: [],
    status: 'running',
  }

  const setStageStatus = (name: StageName, update: Partial<PipelineStage>) => {
    const stage = run.stages.find((s) => s.name === name)!
    Object.assign(stage, update)
  }

  const runStage = async <T>(
    name: StageName,
    fn: () => Promise<T>
  ): Promise<T> => {
    setStageStatus(name, { status: 'running', startedAt: new Date().toISOString() })
    emit({ event: 'stage_start', stage: name })
    const t0 = Date.now()
    try {
      const result = await fn()
      const durationMs = Date.now() - t0
      setStageStatus(name, {
        status: 'done',
        completedAt: new Date().toISOString(),
        durationMs,
      })
      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setStageStatus(name, { status: 'error', errorMessage: msg })
      emit({ event: 'stage_error', stage: name, message: msg })
      throw err
    }
  }

  try {
    // Stage 1: Analyze
    let analysisResult: AnalysisResult
    await runStage('analyze', async () => {
      analysisResult = await runAnalyzeStage(transcript, context, userActionabilityPct)
      run.analysisResult = analysisResult
      const summary = `${analysisResult.segments.length} segments, ${analysisResult.actionableSegmentIds.length} actionable (${Math.round(analysisResult.effectiveActionabilityPct * 100)}%)`
      setStageStatus('analyze', { outputSummary: summary })
      emit({ event: 'stage_done', stage: 'analyze', summary, durationMs: run.stages.find(s => s.name === 'analyze')!.durationMs || 0 })
    })

    const actionableSegments = analysisResult!.segments.filter((s) => s.isActionable)

    // Stage 2: Extract
    let rawClips: Awaited<ReturnType<typeof runExtractStage>>
    await runStage('extract', async () => {
      rawClips = await runExtractStage(actionableSegments, context)
      const summary = `${rawClips.length} clips extracted`
      setStageStatus('extract', { outputSummary: summary })
      emit({ event: 'stage_done', stage: 'extract', summary, durationMs: run.stages.find(s => s.name === 'extract')!.durationMs || 0 })
    })

    if (!rawClips!.length) {
      run.status = 'complete'
      run.totalDurationMs = Date.now() - startTime
      emit({ event: 'pipeline_complete', run })
      return run
    }

    // Stage 3: Rewrite
    let variationMap: Awaited<ReturnType<typeof runRewriteStage>>
    await runStage('rewrite', async () => {
      variationMap = await runRewriteStage(rawClips, context)
      const summary = `${variationMap.size} clips rewritten with 5 variations each`
      setStageStatus('rewrite', { outputSummary: summary })
      emit({ event: 'stage_done', stage: 'rewrite', summary, durationMs: run.stages.find(s => s.name === 'rewrite')!.durationMs || 0 })
    })

    // Assemble partial clips for scoring
    const partialClips = rawClips!.map((raw) => ({
      ...raw,
      variations: variationMap!.get(raw.id) || [],
    }))

    // Stage 4: Score
    let scoreMap: Awaited<ReturnType<typeof runScoreStage>>
    await runStage('score', async () => {
      scoreMap = await runScoreStage(partialClips, context)
      const summary = `${scoreMap.size} clips scored and ranked`
      setStageStatus('score', { outputSummary: summary })
      emit({ event: 'stage_done', stage: 'score', summary, durationMs: run.stages.find(s => s.name === 'score')!.durationMs || 0 })
    })

    // Assemble final clips
    const finalClips: AdClip[] = rawClips!.map((raw) => {
      const scored = scoreMap!.get(raw.id)
      const variations = scored?.variations || variationMap!.get(raw.id) || []
      const recommendation = scored?.recommendation || {
        bestVariationId: variations[0]?.id || '',
        reasoning: 'Auto-selected first variation.',
      }
      return {
        ...raw,
        variations,
        recommendation,
        campaignContext: context,
        extractedAt: new Date().toISOString(),
      }
    })

    run.clips = finalClips
    emit({ event: 'clips_batch', clips: finalClips })

    // Stage 5: Missed
    await runStage('missed', async () => {
      const coveredTypes = Array.from(new Set(rawClips!.map((c) => c.type as ClipType)))
      const missed: MissedOpportunity[] = await runMissedStage(
        analysisResult!.segments,
        coveredTypes,
        context
      )
      run.missedOpportunities = missed
      const summary = `${missed.length} overlooked angles found`
      setStageStatus('missed', { outputSummary: summary })
      emit({ event: 'stage_done', stage: 'missed', summary, durationMs: run.stages.find(s => s.name === 'missed')!.durationMs || 0 })
    })

    run.status = 'complete'
    run.totalDurationMs = Date.now() - startTime
    emit({ event: 'pipeline_complete', run })
    return run
  } catch (err) {
    run.status = 'error'
    run.totalDurationMs = Date.now() - startTime
    emit({ event: 'pipeline_complete', run })
    return run
  }
}
