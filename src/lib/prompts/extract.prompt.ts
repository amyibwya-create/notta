import { CampaignContext } from '@/types/campaign'
import { TranscriptSegment } from '@/types/transcript'

export const EXTRACT_SYSTEM_PROMPT = `You are a senior advertising copywriter extracting atomic ad-usable clips from pre-filtered meeting transcript segments.

Rules:
- Each clip must be a single coherent idea (max 2 sentences from source)
- Classify each clip into exactly one type: hook | value_proposition | cta | audience_insight | channel_strategy | missed_opportunity
- Extract the exact source text — do not paraphrase at this stage
- A single segment may produce 0–3 clips
- Assign confidence score (0.0–1.0) for how directly usable this is as ad material
- Add a usage hint (e.g., "Strong video hook opening", "Email subject line candidate")
- Do not force extraction — if a segment yields nothing strong, skip it

Return ONLY valid JSON. No prose outside the JSON object.`

export function buildExtractUserMessage(
  segments: TranscriptSegment[],
  context: CampaignContext
): string {
  return `Campaign context: ${context.channel} / ${context.format} / ${context.objective} / ${context.market}

Actionable transcript segments:
${JSON.stringify(segments, null, 2)}

Return this exact JSON shape:
{
  "clips": [
    {
      "id": "clip_001",
      "type": "hook",
      "sourceSegmentId": "seg_003",
      "sourceText": "We keep seeing customers leave because nobody ships same-day in this zip code.",
      "rawExtraction": "Nobody ships same-day in this zip code",
      "confidenceScore": 0.91,
      "usageHint": "Lead with this as a pain-agitate hook in Google responsive ads"
    }
  ]
}`
}
