'use client'

import { HistorySidebar } from './HistorySidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <HistorySidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
