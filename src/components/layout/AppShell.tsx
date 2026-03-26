'use client'

import { useAppStore } from '@/store/useAppStore'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { pipelineRun, resetPipeline, isProcessing } = useAppStore()
  const hasResults = (pipelineRun?.clips.length ?? 0) > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-gray-900">Notta</span>
          <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded font-medium">
            Ad Clips
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {hasResults && !isProcessing && (
            <button
              onClick={resetPipeline}
              className="text-gray-500 hover:text-gray-800 border border-gray-200 px-2.5 py-1 rounded hover:border-gray-300 transition-colors"
            >
              New Session
            </button>
          )}
          <span>Powered by Claude</span>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
