import { z } from 'zod'

// Stage 1: Analyze
export const AnalysisResponseSchema = z.object({
  segments: z.array(
    z.object({
      id: z.string(),
      rawText: z.string(),
      characterStart: z.number(),
      characterEnd: z.number(),
      relevanceScore: z.number().min(0).max(1),
      relevanceReason: z.string(),
      topicTags: z.array(z.string()),
    })
  ),
  suggestedActionabilityPct: z.number().min(0).max(1),
})
export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>

// Stage 2: Extract
export const ExtractResponseSchema = z.object({
  clips: z.array(
    z.object({
      id: z.string(),
      type: z.enum([
        'hook',
        'value_proposition',
        'cta',
        'audience_insight',
        'channel_strategy',
        'missed_opportunity',
      ]),
      sourceSegmentId: z.string(),
      sourceText: z.string(),
      rawExtraction: z.string(),
      confidenceScore: z.number().min(0).max(1),
      usageHint: z.string(),
    })
  ),
})
export type ExtractResponse = z.infer<typeof ExtractResponseSchema>

// Stage 3: Rewrite
export const VariationSchema = z.object({
  id: z.string(),
  text: z.string(),
  tone: z.string(),
  characterCount: z.number(),
  wordCount: z.number(),
})

export const RewriteResponseSchema = z.object({
  results: z.array(
    z.object({
      clipId: z.string(),
      variations: z.array(VariationSchema).min(1).max(7),
    })
  ),
})
export type RewriteResponse = z.infer<typeof RewriteResponseSchema>

// Stage 4: Score
export const QualityDimensionsSchema = z.object({
  nativeUSLanguage: z.number().min(0).max(1),
  audienceClarity: z.number().min(0).max(1),
  directness: z.number().min(0).max(1),
  memorability: z.number().min(0).max(1),
})

export const ScoreResponseSchema = z.object({
  scoredClips: z.array(
    z.object({
      clipId: z.string(),
      variations: z.array(
        z.object({
          id: z.string(),
          qualityScore: z.number().min(0).max(1),
          qualityDimensions: QualityDimensionsSchema,
        })
      ),
      recommendation: z.object({
        bestVariationId: z.string(),
        reasoning: z.string(),
        alternativeVariationId: z.string().optional(),
        alternativeReason: z.string().optional(),
      }),
    })
  ),
})
export type ScoreResponse = z.infer<typeof ScoreResponseSchema>

// Stage 5: Missed Opportunities
export const MissedResponseSchema = z.object({
  missedOpportunities: z.array(
    z.object({
      id: z.string(),
      angle: z.string(),
      observation: z.string(),
      suggestedClipDirection: z.string(),
      relatedSegmentIds: z.array(z.string()),
    })
  ),
})
export type MissedResponse = z.infer<typeof MissedResponseSchema>
