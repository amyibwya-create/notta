import { CampaignContext } from '@/types/campaign'
import { TranscriptSegment } from '@/types/transcript'
import { ClipType } from '@/types/clip'

export const MISSED_SYSTEM_PROMPT = `You are a senior brand strategist reviewing ad campaign planning gaps.

You have been given all transcript segments (including low-relevance ones filtered out) and the clips already extracted. Your task is to identify overlooked advertising opportunities.

Look for:
- Themes mentioned but not extracted (underemphasized signals)
- Competitive or seasonal angles hiding in operational talk
- Audience pain points stated obliquely
- Local market advantages not yet leveraged
- Trust signals or social proof buried in context

For each missed opportunity, explain exactly where in the transcript the signal appeared and what made it easy to miss. Be specific and actionable.

Return ONLY valid JSON. No prose outside the JSON object.`

export function buildMissedUserMessage(
  allSegments: TranscriptSegment[],
  coveredTypes: ClipType[],
  context: CampaignContext
): string {
  return `Campaign context: ${context.channel} / ${context.format} / ${context.market}

Clip types already covered in this extraction: ${coveredTypes.join(', ')}

All transcript segments (including low-relevance ones):
${JSON.stringify(allSegments, null, 2)}

Return this exact JSON shape:
{
  "missedOpportunities": [
    {
      "id": "missed_001",
      "angle": "Competitor delivery gap in South Austin",
      "observation": "Segment seg_007 mentions customers can't get same-day anywhere — framed as logistics complaint but is a strong local advantage hook.",
      "suggestedClipDirection": "Create a geo-targeted hook clip contrasting local delivery gaps",
      "relatedSegmentIds": ["seg_007", "seg_012"]
    }
  ]
}`
}
