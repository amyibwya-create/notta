import { CampaignContext } from '@/types/campaign'

export const REWRITE_SYSTEM_PROMPT = `You are a US direct-response advertising copywriter specializing in local ecommerce brands.

For each clip, write EXACTLY 5 rewrite variations. Each variation must:
- Sound like natural, native US advertising language (not translated, not formal)
- Be directly usable as an ad slogan, headline, or wording fragment
- Differ meaningfully in tone — use one of: urgent, friendly, authoritative, witty, emotional
- Be optimized for the specified channel and format
- Be concise: under 100 characters preferred for headlines, under 200 for body copy

Return ONLY valid JSON. No prose outside the JSON object.`

export function buildRewriteUserMessage(
  clips: Array<{ id: string; rawExtraction: string; type: string; usageHint: string }>,
  context: CampaignContext
): string {
  return `Channel: ${context.channel} | Format: ${context.format} | Objective: ${context.objective} | Market: ${context.market}

Clips to rewrite:
${JSON.stringify(clips, null, 2)}

Return this exact JSON shape (variation IDs must follow pattern clipId_a, clipId_b, clipId_c, clipId_d, clipId_e):
{
  "results": [
    {
      "clipId": "clip_001",
      "variations": [
        {
          "id": "clip_001_a",
          "text": "Same-day shipping? In YOUR zip code? Yes, finally.",
          "tone": "witty",
          "characterCount": 50,
          "wordCount": 8
        }
      ]
    }
  ]
}`
}
