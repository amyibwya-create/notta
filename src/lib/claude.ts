import Anthropic from '@anthropic-ai/sdk'
import { extractJSON } from './utils'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Default to Claude 3.5 models (widely available).
// Override via CLAUDE_FAST_MODEL / CLAUDE_SMART_MODEL env vars if you have access to newer tiers.
export const FAST_MODEL = process.env.CLAUDE_FAST_MODEL ?? 'claude-3-5-haiku-20241022'
export const SMART_MODEL = process.env.CLAUDE_SMART_MODEL ?? 'claude-3-5-sonnet-20241022'

export type ClaudeModel = string

export interface ClaudeCallParams {
  model: ClaudeModel
  systemPrompt: string
  userMessage: string
  maxTokens: number
  temperature?: number
}

export async function callClaude(params: ClaudeCallParams): Promise<string> {
  const { model, systemPrompt, userMessage, maxTokens, temperature = 0.3 } = params

  const attempt = async (): Promise<string> => {
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })
    const block = response.content[0]
    if (block.type !== 'text') throw new Error('Non-text response from Claude')
    return block.text
  }

  let raw: string
  try {
    raw = await attempt()
  } catch (err) {
    // single retry on network-level failures
    await new Promise(r => setTimeout(r, 1000))
    raw = await attempt()
  }

  return raw
}

export async function callClaudeJSON<T>(
  params: ClaudeCallParams,
  parse: (raw: string) => T
): Promise<T> {
  const raw = await callClaude(params)
  const json = extractJSON(raw)

  try {
    return parse(json)
  } catch {
    // retry with explicit correction prompt
    const corrected = await callClaude({
      ...params,
      userMessage:
        params.userMessage +
        '\n\nYour previous response was not valid JSON. Return ONLY valid JSON with no prose, no markdown fences.',
    })
    return parse(extractJSON(corrected))
  }
}
