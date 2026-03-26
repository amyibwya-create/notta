import { CampaignContext } from '@/types/campaign'

export const SCORE_SYSTEM_PROMPT = `You are an advertising quality evaluator for US local ecommerce campaigns.

Score each variation on 4 dimensions (0.0–1.0 each):
- nativeUSLanguage: Does it sound like natural American advertising copy?
- audienceClarity: Is the target audience and their benefit crystal clear?
- directness: Is it usable as-is without editing?
- memorability: Would it stick in someone's mind after one reading?

Then recommend the single best variation per clip with 2–3 sentence reasoning.

Return ONLY valid JSON. No prose outside the JSON object.`

export function buildScoreUserMessage(
  clips: Array<{
    id: string
    type: string
    variations: Array<{ id: string; text: string; tone: string }>
  }>,
  context: CampaignContext
): string {
  return `Channel: ${context.channel} | Format: ${context.format} | Objective: ${context.objective}

Clips with variations to score:
${JSON.stringify(clips, null, 2)}

Return this exact JSON shape:
{
  "scoredClips": [
    {
      "clipId": "clip_001",
      "variations": [
        {
          "id": "clip_001_a",
          "qualityScore": 0.88,
          "qualityDimensions": {
            "nativeUSLanguage": 0.95,
            "audienceClarity": 0.82,
            "directness": 0.90,
            "memorability": 0.88
          }
        }
      ],
      "recommendation": {
        "bestVariationId": "clip_001_a",
        "reasoning": "The witty tone matches top-of-funnel conventions. Local specificity creates immediate relevance.",
        "alternativeVariationId": "clip_001_c",
        "alternativeReason": "Better fit if running emotional video format"
      }
    }
  ]
}`
}
