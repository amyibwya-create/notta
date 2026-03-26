import { CampaignContext } from '@/types/campaign'
import { TranscriptSegment } from '@/types/transcript'
import { ClipType, MissedOpportunity } from '@/types/clip'
import { callClaudeJSON } from '@/lib/claude'
import { MISSED_SYSTEM_PROMPT, buildMissedUserMessage } from '@/lib/prompts/missed.prompt'
import { MissedResponseSchema } from '@/lib/validators'

export async function runMissedStage(
  allSegments: TranscriptSegment[],
  coveredTypes: ClipType[],
  context: CampaignContext
): Promise<MissedOpportunity[]> {
  const response = await callClaudeJSON(
    {
      model: 'claude-sonnet-4-6',
      systemPrompt: MISSED_SYSTEM_PROMPT,
      userMessage: buildMissedUserMessage(allSegments, coveredTypes, context),
      maxTokens: 2048,
      temperature: 0.5,
    },
    (raw) => MissedResponseSchema.parse(JSON.parse(raw))
  )

  return response.missedOpportunities
}
