import { ExportBundle } from '@/types/export'

export function buildExportBundle(
  run: import('@/types/pipeline').PipelineRun,
  context: import('@/types/campaign').CampaignContext
): ExportBundle {
  const meta = run.analysisResult
  return {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    campaignContext: context,
    transcriptMeta: {
      charCount: meta?.totalCharCount ?? 0,
      suggestedActionabilityPct: meta?.suggestedActionabilityPct ?? 0,
      effectiveActionabilityPct: meta?.effectiveActionabilityPct ?? 0,
      segmentCount: meta?.segments.length ?? 0,
      actionableSegmentCount: meta?.actionableSegmentIds.length ?? 0,
    },
    clips: run.clips,
    missedOpportunities: run.missedOpportunities,
  }
}

export function downloadJSON(bundle: ExportBundle): void {
  const json = JSON.stringify(bundle, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `notta-ad-clips-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function buildAllClipsText(bundle: ExportBundle): string {
  return bundle.clips
    .map((clip) => {
      const best = clip.variations.find((v) => v.id === clip.recommendation.bestVariationId)
      return `[${clip.type.toUpperCase()}] ${best?.text ?? clip.rawExtraction}`
    })
    .join('\n')
}
