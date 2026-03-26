'use client'

import { useAppStore } from '@/store/useAppStore'
import { SessionSummary } from '@/types/session'

function dateBucket(isoDate: string): string {
  const now = new Date()
  const date = new Date(isoDate)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return 'This Week'
  return 'Earlier'
}

function groupSessions(sessions: SessionSummary[]): { label: string; items: SessionSummary[] }[] {
  const order = ['Today', 'Yesterday', 'This Week', 'Earlier']
  const map = new Map<string, SessionSummary[]>()
  for (const s of sessions) {
    const bucket = dateBucket(s.createdAt)
    if (!map.has(bucket)) map.set(bucket, [])
    map.get(bucket)!.push(s)
  }
  return order.filter((l) => map.has(l)).map((label) => ({ label, items: map.get(label)! }))
}

export function HistorySidebar() {
  const { sessions, activeSessionId, sidebarOpen, newSession, loadSession, removeSession, toggleSidebar, isProcessing } =
    useAppStore()

  const groups = groupSessions(sessions)

  if (!sidebarOpen) {
    return (
      <aside className="w-12 flex-shrink-0 bg-gray-900 flex flex-col items-center py-3 gap-3 border-r border-gray-700">
        <span className="text-white font-bold text-sm">N</span>
        <button
          onClick={toggleSidebar}
          className="text-gray-400 hover:text-white text-xs mt-auto mb-2"
          title="Expand sidebar"
        >
          »
        </button>
      </aside>
    )
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-gray-900 flex flex-col border-r border-gray-700">
      {/* Header */}
      <div className="px-3 pt-4 pb-2">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-white font-bold text-sm tracking-tight">Notta</span>
          <span className="text-xs px-1.5 py-0.5 bg-blue-600 text-white rounded font-medium leading-none">
            Ad Clips
          </span>
        </div>
        <button
          onClick={newSession}
          disabled={isProcessing}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm transition-colors disabled:opacity-50"
        >
          <span className="text-base leading-none">+</span>
          New Session
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {groups.length === 0 ? (
          <p className="text-gray-500 text-xs px-2 py-4 text-center">No sessions yet</p>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="mb-3">
              <p className="text-xs text-gray-500 px-2 py-1 font-medium uppercase tracking-wider">
                {group.label}
              </p>
              {group.items.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  isActive={session.id === activeSessionId}
                  onLoad={() => loadSession(session.id)}
                  onDelete={() => removeSession(session.id)}
                />
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-700 flex items-center justify-between">
        <span className="text-xs text-gray-500">Powered by Claude</span>
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-gray-300 text-xs"
          title="Collapse sidebar"
        >
          «
        </button>
      </div>
    </aside>
  )
}

function SessionRow({
  session,
  isActive,
  onLoad,
  onDelete,
}: {
  session: SessionSummary
  isActive: boolean
  onLoad: () => void
  onDelete: () => void
}) {
  const title = session.title.length > 30 ? session.title.slice(0, 30) + '…' : session.title

  return (
    <div
      className={`group flex items-center gap-1 rounded-md px-2 py-1.5 cursor-pointer transition-colors ${
        isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800'
      }`}
      onClick={onLoad}
    >
      <span className="flex-1 text-xs truncate" title={session.title}>
        {title}
      </span>
      <span className="text-xs text-gray-500 flex-shrink-0">{session.clipCount}</span>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="hidden group-hover:flex items-center justify-center w-4 h-4 text-gray-500 hover:text-red-400 flex-shrink-0 text-xs"
        title="Delete"
      >
        ×
      </button>
    </div>
  )
}
