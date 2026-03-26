import { CampaignContext } from './campaign'

export type ClipType =
  | 'hook'
  | 'value_proposition'
  | 'cta'
  | 'audience_insight'
  | 'channel_strategy'
  | 'missed_opportunity'

export const CLIP_TYPE_LABELS: Record<ClipType, string> = {
  hook: 'Hook',
  value_proposition: 'Value Prop',
  cta: 'CTA',
  audience_insight: 'Audience Insight',
  channel_strategy: 'Channel Strategy',
  missed_opportunity: 'Missed Opportunity',
}

export const CLIP_TYPE_COLORS: Record<ClipType, string> = {
  hook: 'bg-rose-100 text-rose-700 border-rose-200',
  value_proposition: 'bg-blue-100 text-blue-700 border-blue-200',
  cta: 'bg-green-100 text-green-700 border-green-200',
  audience_insight: 'bg-purple-100 text-purple-700 border-purple-200',
  channel_strategy: 'bg-orange-100 text-orange-700 border-orange-200',
  missed_opportunity: 'bg-yellow-100 text-yellow-700 border-yellow-200',
}

export interface QualityDimensions {
  nativeUSLanguage: number
  audienceClarity: number
  directness: number
  memorability: number
}

export interface ClipVariation {
  id: string
  text: string
  tone: string
  characterCount: number
  wordCount: number
  qualityScore: number
  qualityDimensions: QualityDimensions
}

export interface ClipRecommendation {
  bestVariationId: string
  reasoning: string
  alternativeVariationId?: string
  alternativeReason?: string
}

export interface AdClip {
  id: string
  type: ClipType
  sourceSegmentId: string
  sourceText: string
  rawExtraction: string
  variations: ClipVariation[]
  recommendation: ClipRecommendation
  campaignContext: CampaignContext
  extractedAt: string
  confidenceScore: number
  usageHint: string
}

export interface MissedOpportunity {
  id: string
  angle: string
  observation: string
  suggestedClipDirection: string
  relatedSegmentIds: string[]
}
