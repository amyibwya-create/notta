import { CampaignContext } from '@/types/campaign'
import { AnalysisResult, TranscriptSegment } from '@/types/transcript'
import { callClaudeJSON } from '@/lib/claude'
import { ANALYZE_SYSTEM_PROMPT, buildAnalyzeUserMessage } from '@/lib/prompts/analyze.prompt'
import { AnalysisResponseSchema } from '@/lib/validators'

const MAX_TRANSCRIPT_CHARS = 50_000

export async function runAnalyzeStage(
  transcript: string,
  context: CampaignContext,
  userActionabilityPct: number | null
): Promise<AnalysisResult> {
  const truncated = transcript.slice(0, MAX_TRANSCRIPT_CHARS)

  const response = await callClaudeJSON(
    {
      model: 'claude-haiku-4-5-20251001',
      systemPrompt: ANALYZE_SYSTEM_PROMPT,
      userMessage: buildAnalyzeUserMessage(truncated, context),
      maxTokens: 4096,
      temperature: 0.3,
    },
    (raw) => AnalysisResponseSchema.parse(JSON.parse(raw))
  )

  const suggestedPct = response.suggestedActionabilityPct
  const effectivePct = userActionabilityPct ?? suggestedPct

  // Rank-based threshold: take top N% of segments by relevance score
  const sorted = [...response.segments].sort((a, b) => b.relevanceScore - a.relevanceScore)
  const threshold = Math.max(1, Math.floor(sorted.length * effectivePct))
  const actionableIds = new Set<string>(sorted.slice(0, threshold).map((s) => s.id))

  const segments: TranscriptSegment[] = response.segments.map((s) => ({
    ...s,
    speakerLabel: undefined,
    isActionable: actionableIds.has(s.id),
  }))

  return {
    segments,
    suggestedActionabilityPct: suggestedPct,
    userActionabilityPct,
    effectiveActionabilityPct: effectivePct,
    actionableSegmentIds: Array.from(actionableIds),
    totalCharCount: truncated.length,
  }
}
