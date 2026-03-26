import { CampaignContext } from '@/types/campaign'
import { AdClip, ClipRecommendation, ClipVariation } from '@/types/clip'
import { callClaudeJSON, FAST_MODEL } from '@/lib/claude'
import { SCORE_SYSTEM_PROMPT, buildScoreUserMessage } from '@/lib/prompts/score.prompt'
import { ScoreResponseSchema } from '@/lib/validators'

// Quality score weights (server-side computation, not exposed to AI)
const WEIGHTS = {
  nativeUSLanguage: 0.3,
  audienceClarity: 0.3,
  directness: 0.25,
  memorability: 0.15,
}

const BATCH_SIZE = 8

export function computeWeightedScore(dims: {
  nativeUSLanguage: number
  audienceClarity: number
  directness: number
  memorability: number
}): number {
  return (
    dims.nativeUSLanguage * WEIGHTS.nativeUSLanguage +
    dims.audienceClarity * WEIGHTS.audienceClarity +
    dims.directness * WEIGHTS.directness +
    dims.memorability * WEIGHTS.memorability
  )
}

export async function runScoreStage(
  clips: Array<{ id: string; type: string; variations: ClipVariation[] }>,
  context: CampaignContext
): Promise<Map<string, { variations: ClipVariation[]; recommendation: ClipRecommendation }>> {
  const resultMap = new Map<string, { variations: ClipVariation[]; recommendation: ClipRecommendation }>()

  for (let i = 0; i < clips.length; i += BATCH_SIZE) {
    const batch = clips.slice(i, i + BATCH_SIZE).map((c) => ({
      id: c.id,
      type: c.type,
      variations: c.variations.map((v) => ({ id: v.id, text: v.text, tone: v.tone })),
    }))

    const response = await callClaudeJSON(
      {
        model: FAST_MODEL,
        systemPrompt: SCORE_SYSTEM_PROMPT,
        userMessage: buildScoreUserMessage(batch, context),
        maxTokens: 8192,
        temperature: 0.3,
      },
      (raw) => ScoreResponseSchema.parse(JSON.parse(raw))
    )

    for (const scored of response.scoredClips) {
      const originalClip = clips.find((c) => c.id === scored.clipId)
      if (!originalClip) continue

      const mergedVariations: ClipVariation[] = originalClip.variations.map((v) => {
        const scoreData = scored.variations.find((sv) => sv.id === v.id)
        if (!scoreData) return v
        const weightedScore = computeWeightedScore(scoreData.qualityDimensions)
        return {
          ...v,
          qualityScore: weightedScore,
          qualityDimensions: scoreData.qualityDimensions,
        }
      })

      resultMap.set(scored.clipId, {
        variations: mergedVariations,
        recommendation: scored.recommendation,
      })
    }
  }

  return resultMap
}
