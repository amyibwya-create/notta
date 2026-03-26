'use client'

import { useState } from 'react'
import { AdClip, ClipVariation } from '@/types/clip'
import { copyToClipboard } from '@/lib/export'
import { scoreToPercent } from '@/lib/utils'

function QualityBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500">
      <span className="w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full bg-blue-400"
          style={{ width: `${scoreToPercent(value)}%` }}
        />
      </div>
      <span className="w-6 text-right">{scoreToPercent(value)}</span>
    </div>
  )
}

function VariationRow({
  variation,
  isRecommended,
  recommendation,
}: {
  variation: ClipVariation
  isRecommended: boolean
  recommendation?: AdClip['recommendation']
}) {
  const [copied, setCopied] = useState(false)
  const [showDims, setShowDims] = useState(false)

  const handleCopy = async () => {
    const ok = await copyToClipboard(variation.text)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      className={`rounded-lg border p-3 space-y-2 ${
        isRecommended ? 'border-amber-300 bg-amber-50' : 'border-gray-100 bg-white'
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1">
          {isRecommended && (
            <div className="flex items-center gap-1 mb-1">
              <span className="text-amber-500 text-xs">★</span>
              <span className="text-xs font-semibold text-amber-600">Recommended</span>
            </div>
          )}
          <p className="text-sm text-gray-800 leading-relaxed">{variation.text}</p>
        </div>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 text-xs px-2 py-1 rounded border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-colors"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="px-1.5 py-0.5 bg-gray-100 rounded capitalize">{variation.tone}</span>
        <span>{variation.characterCount} chars</span>
        <span>{variation.wordCount} words</span>
        {variation.qualityScore > 0 && (
          <>
            <span className="ml-auto font-medium text-gray-600">
              Quality: {scoreToPercent(variation.qualityScore)}%
            </span>
            <button
              onClick={() => setShowDims(!showDims)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showDims ? '▲' : '▼'}
            </button>
          </>
        )}
      </div>

      {showDims && variation.qualityScore > 0 && (
        <div className="space-y-1 pt-1 border-t border-gray-100">
          <QualityBar label="US Language" value={variation.qualityDimensions.nativeUSLanguage} />
          <QualityBar label="Clarity" value={variation.qualityDimensions.audienceClarity} />
          <QualityBar label="Directness" value={variation.qualityDimensions.directness} />
          <QualityBar label="Memorability" value={variation.qualityDimensions.memorability} />
        </div>
      )}

      {isRecommended && recommendation?.reasoning && (
        <p className="text-xs text-amber-700 italic border-t border-amber-200 pt-2">
          {recommendation.reasoning}
        </p>
      )}
    </div>
  )
}

export function VariationList({ clip }: { clip: AdClip }) {
  const [expanded, setExpanded] = useState(false)
  const bestId = clip.recommendation.bestVariationId
  const best = clip.variations.find((v) => v.id === bestId)
  const others = clip.variations.filter((v) => v.id !== bestId)

  return (
    <div className="space-y-2">
      {best && (
        <VariationRow
          variation={best}
          isRecommended
          recommendation={clip.recommendation}
        />
      )}
      {!expanded && others.length > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 border border-dashed border-gray-200 rounded-lg"
        >
          Show {others.length} more variation{others.length !== 1 ? 's' : ''}
        </button>
      )}
      {expanded &&
        others.map((v) => (
          <VariationRow key={v.id} variation={v} isRecommended={false} />
        ))}
      {expanded && (
        <button
          onClick={() => setExpanded(false)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Collapse
        </button>
      )}
    </div>
  )
}
