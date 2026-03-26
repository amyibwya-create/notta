import { CampaignContext } from './campaign'
import { AdClip, MissedOpportunity } from './clip'

export interface ExportBundle {
  exportedAt: string
  version: '1.0'
  campaignContext: CampaignContext
  transcriptMeta: {
    charCount: number
    suggestedActionabilityPct: number
    effectiveActionabilityPct: number
    segmentCount: number
    actionableSegmentCount: number
  }
  clips: AdClip[]
  missedOpportunities: MissedOpportunity[]
}
