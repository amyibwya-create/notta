import { NextRequest } from 'next/server'
import { runPipeline, SSEEvent } from '@/lib/pipeline/orchestrator'
import { CampaignContext } from '@/types/campaign'

export const runtime = 'nodejs'
export const maxDuration = 120

function encodeSSE(event: SSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}

export async function POST(req: NextRequest) {
  let body: {
    transcript: string
    campaignContext: CampaignContext
    userActionabilityPct?: number | null
  }

  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 })
  }

  const { transcript, campaignContext, userActionabilityPct = null } = body

  if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 50) {
    return new Response(
      JSON.stringify({ error: 'Transcript must be at least 50 characters' }),
      { status: 400 }
    )
  }

  if (!campaignContext) {
    return new Response(JSON.stringify({ error: 'campaignContext is required' }), { status: 400 })
  }

  const encoder = new TextEncoder()
  let controller: ReadableStreamDefaultController<Uint8Array>

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c
    },
  })

  // Run pipeline asynchronously, pushing SSE events into the stream
  runPipeline(transcript, campaignContext, userActionabilityPct, (event) => {
    try {
      controller.enqueue(encoder.encode(encodeSSE(event)))
    } catch {
      // Stream may already be closed
    }
  })
    .catch((err) => {
      try {
        controller.enqueue(
          encoder.encode(
            encodeSSE({ event: 'stage_error', stage: 'analyze', message: String(err) })
          )
        )
      } catch {}
    })
    .finally(() => {
      try {
        controller.close()
      } catch {}
    })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
