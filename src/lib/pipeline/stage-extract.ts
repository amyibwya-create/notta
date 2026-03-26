import { CampaignContext } from '@/types/campaign'
import { TranscriptSegment } from '@/types/transcript'
import { AdClip } from '@/types/clip'
import { callClaudeJSON, SMART_MODEL } from '@/lib/claude'
import { EXTRACT_SYSTEM_PROMPT, buildExtractUserMessage } from '@/lib/prompts/extract.prompt'
import { ExtractResponseSchema } from '@/lib/validators'

export async function runExtractStage(
  actionableSegments: TranscriptSegment[],
  context: CampaignContext
): Promise<Omit<AdClip, 'variations' | 'recommendation' | 'campaignContext' | 'extractedAt'>[]> {
  if (actionableSegments.length === 0) return []

  const response = await callClaudeJSON(
    {
      model: SMART_MODEL,
      systemPrompt: EXTRACT_SYSTEM_PROMPT,
      userMessage: buildExtractUserMessage(actionableSegments, context),
      maxTokens: 2048,
      temperature: 0.4,
    },
    (raw) => ExtractResponseSchema.parse(JSON.parse(raw))
  )

  return response.clips
}
