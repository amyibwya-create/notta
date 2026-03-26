import { CampaignContext } from '@/types/campaign'
import { ClipVariation } from '@/types/clip'
import { callClaudeJSON, SMART_MODEL } from '@/lib/claude'
import { REWRITE_SYSTEM_PROMPT, buildRewriteUserMessage } from '@/lib/prompts/rewrite.prompt'
import { RewriteResponseSchema } from '@/lib/validators'

const BATCH_SIZE = 5

type RawClip = {
  id: string
  rawExtraction: string
  type: string
  usageHint: string
}

export async function runRewriteStage(
  clips: RawClip[],
  context: CampaignContext
): Promise<Map<string, ClipVariation[]>> {
  const variationMap = new Map<string, ClipVariation[]>()

  // Process in batches of BATCH_SIZE
  for (let i = 0; i < clips.length; i += BATCH_SIZE) {
    const batch = clips.slice(i, i + BATCH_SIZE)
    const response = await callClaudeJSON(
      {
        model: SMART_MODEL,
        systemPrompt: REWRITE_SYSTEM_PROMPT,
        userMessage: buildRewriteUserMessage(batch, context),
        maxTokens: 4096,
        temperature: 0.7,
      },
      (raw) => RewriteResponseSchema.parse(JSON.parse(raw))
    )

    for (const result of response.results) {
      const variations: ClipVariation[] = result.variations.map((v) => ({
        id: v.id,
        text: v.text,
        tone: v.tone,
        characterCount: v.characterCount || v.text.length,
        wordCount: v.wordCount || v.text.split(/\s+/).length,
        qualityScore: 0,
        qualityDimensions: {
          nativeUSLanguage: 0,
          audienceClarity: 0,
          directness: 0,
          memorability: 0,
        },
      }))
      variationMap.set(result.clipId, variations)
    }
  }

  return variationMap
}
