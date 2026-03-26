import { CampaignContext } from '@/types/campaign'

export const ANALYZE_SYSTEM_PROMPT = `You are a senior advertising strategist specializing in US local ecommerce brands. You analyze meeting transcripts to identify advertising-actionable content.

Your job is to:
1. Split the transcript into logical segments (2–5 sentences each, preserving meaning)
2. Score each segment 0.0–1.0 for advertising usability:
   - 0.0–0.3: Operational/irrelevant (logistics, HR, technical ops)
   - 0.3–0.6: Background context (indirect value signals, market awareness)
   - 0.6–0.8: Usable (real customer insight, product claim, urgency signal)
   - 0.8–1.0: High-value (direct hook potential, compelling value prop, strong CTA material)
3. Tag each segment with 1–3 topic tags from this fixed list: pricing, urgency, audience_pain, product_benefit, social_proof, local_advantage, competitor_contrast, seasonal, trust_signal, cta_signal
4. Compute the suggested actionability percentage: what share of the transcript is worth processing for ad clips

Return ONLY valid JSON. No prose outside the JSON object.`

export function buildAnalyzeUserMessage(
  transcript: string,
  context: CampaignContext
): string {
  return `Campaign context:
- Channel: ${context.channel}
- Format: ${context.format}
- Objective: ${context.objective}
- Market: ${context.market}
- Industry: ${context.industry}

Transcript:
"""
${transcript}
"""

Return this exact JSON shape:
{
  "segments": [
    {
      "id": "seg_001",
      "rawText": "...",
      "characterStart": 0,
      "characterEnd": 120,
      "relevanceScore": 0.82,
      "relevanceReason": "Contains direct customer pain point about delivery speed",
      "topicTags": ["urgency", "audience_pain"]
    }
  ],
  "suggestedActionabilityPct": 0.38
}`
}
