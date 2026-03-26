'use client'

import { AdClip, CLIP_TYPE_LABELS, CLIP_TYPE_COLORS } from '@/types/clip'
import { VariationList } from './VariationList'
import { scoreToPercent } from '@/lib/utils'

export function ClipCard({ clip }: { clip: AdClip }) {
  const typeColor = CLIP_TYPE_COLORS[clip.type]

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-100">
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${typeColor}`}>
          {CLIP_TYPE_LABELS[clip.type]}
        </span>
        <div className="flex-1 min-w-0" />
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs text-gray-400">Confidence</span>
          <span className="text-xs font-semibold text-gray-700">
            {scoreToPercent(clip.confidenceScore)}%
          </span>
        </div>
      </div>

      {/* Source quote */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Source</p>
        <blockquote className="text-sm text-gray-600 italic leading-relaxed border-l-2 border-gray-200 pl-3">
          {clip.sourceText}
        </blockquote>
        {clip.usageHint && (
          <p className="text-xs text-blue-500 mt-1.5">{clip.usageHint}</p>
        )}
      </div>

      {/* Variations */}
      <div className="px-4 py-3">
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
          {clip.variations.length} Variation{clip.variations.length !== 1 ? 's' : ''}
        </p>
        <VariationList clip={clip} />
      </div>
    </div>
  )
}
