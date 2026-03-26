import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars) + '…'
}

/** Strip markdown code fences that Claude sometimes wraps JSON in */
export function extractJSON(raw: string): string {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) return fenceMatch[1].trim()
  const firstBrace = raw.indexOf('{')
  const firstBracket = raw.indexOf('[')
  if (firstBrace === -1 && firstBracket === -1) return raw
  const start = firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)
    ? firstBrace
    : firstBracket
  return raw.slice(start)
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function scoreToPercent(score: number): number {
  return Math.round(score * 100)
}
