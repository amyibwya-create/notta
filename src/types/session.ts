import { PipelineRun } from './pipeline'
import { CampaignContext } from './campaign'

export interface SessionSummary {
  id: string
  createdAt: string
  title: string
  clipCount: number
  missedCount: number
  campaignContext: CampaignContext
  transcript: string
  pipelineRun: PipelineRun
}
