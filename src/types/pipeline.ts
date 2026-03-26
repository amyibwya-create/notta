import { AnalysisResult } from './transcript'
import { AdClip, MissedOpportunity } from './clip'

export type StageStatus = 'idle' | 'running' | 'done' | 'error'
export type StageName = 'analyze' | 'extract' | 'rewrite' | 'score' | 'missed'

export interface PipelineStage {
  name: StageName
  status: StageStatus
  startedAt?: string
  completedAt?: string
  durationMs?: number
  errorMessage?: string
  outputSummary?: string
}

export interface PipelineRun {
  id: string
  createdAt: string
  stages: PipelineStage[]
  analysisResult?: AnalysisResult
  clips: AdClip[]
  missedOpportunities: MissedOpportunity[]
  totalDurationMs?: number
  status: 'idle' | 'running' | 'complete' | 'error'
}

export const STAGE_LABELS: Record<StageName, string> = {
  analyze: 'Analyze',
  extract: 'Extract',
  rewrite: 'Rewrite',
  score: 'Score',
  missed: 'Missed Angles',
}

export const STAGE_DESCRIPTIONS: Record<StageName, string> = {
  analyze: 'Segmenting transcript and scoring ad relevance',
  extract: 'Pulling atomic ad-usable clips',
  rewrite: 'Generating 5 US-native variations per clip',
  score: 'Scoring quality and recommending best version',
  missed: 'Surfacing overlooked campaign opportunities',
}
