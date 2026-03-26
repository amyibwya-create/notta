'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'

export function ExportPanel() {
  const { pipelineRun, exportAsJSON, copyAllClips } = useAppStore()
  const [copiedAll, setCopiedAll] = useState(false)

  if (!pipelineRun?.clips.length) return null

  const handleCopyAll = async () => {
    await copyAllClips()
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2500)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportAsJSON}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
      >
        <span>↓</span> Export JSON
      </button>
      <button
        onClick={handleCopyAll}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
      >
        {copiedAll ? '✓ Copied' : '⎘ Copy All Clips'}
      </button>
    </div>
  )
}
