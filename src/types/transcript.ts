export interface TranscriptSegment {
  id: string
  rawText: string
  speakerLabel?: string
  characterStart: number
  characterEnd: number
  relevanceScore: number
  relevanceReason: string
  isActionable: boolean
  topicTags: string[]
}

export interface AnalysisResult {
  segments: TranscriptSegment[]
  suggestedActionabilityPct: number
  userActionabilityPct: number | null
  effectiveActionabilityPct: number
  actionableSegmentIds: string[]
  totalCharCount: number
}
