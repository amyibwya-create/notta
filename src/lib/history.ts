import { SessionSummary } from '@/types/session'
import { CampaignContext } from '@/types/campaign'

const HISTORY_KEY = 'notta-history'
const MAX_SESSIONS = 50

export function loadHistory(): SessionSummary[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as SessionSummary[]) : []
  } catch {
    return []
  }
}

export function saveSession(session: SessionSummary): void {
  if (typeof window === 'undefined') return
  const history = loadHistory().filter((s) => s.id !== session.id)
  history.unshift(session)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_SESSIONS)))
}

export function deleteSession(id: string): void {
  if (typeof window === 'undefined') return
  const history = loadHistory().filter((s) => s.id !== id)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function generateTitle(transcript: string, context: CampaignContext): string {
  const snippet = transcript.replace(/\s+/g, ' ').trim().slice(0, 60)
  const channel = context.channel.charAt(0).toUpperCase() + context.channel.slice(1)
  return snippet ? `${snippet}… · ${channel}` : `Untitled · ${channel}`
}
