'use client'

import { useAppStore } from '@/store/useAppStore'

const SAMPLE_TRANSCRIPT = `Weekly Management Meeting — March 25, 2026

Marketing Lead: So we checked the numbers again this week. Our acquisition cost from Google is still too high. But here's the thing — in the 78704 zip code, nobody else is offering same-day delivery. Customers keep mentioning it in the reviews. They're surprised we actually show up the same day.

CEO: That's a real advantage. I keep seeing people on the local Facebook groups asking if anyone does same-day in South Austin. We should be louder about that.

Operations: We're also getting 60% repeat orders now. That's up from 40% last quarter. People are coming back because of the reliability.

Marketing Lead: I want to try a spring campaign — something around "finally, a local brand that actually delivers." Keep it simple. We're targeting first-time buyers in Austin who've been burned by slow national brands.

Product: We're also launching the new artisan collection next week. Limited run, premium pricing. Good hook for scarcity messaging.

CEO: Let's make sure the ads feel local. Not corporate. We want people to feel like their neighbor is running this store.`

const MAX_CHARS = 50_000

export function TranscriptInput() {
  const { transcript, setTranscript, isProcessing } = useAppStore()

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Meeting Transcript</label>
        <div className="flex items-center gap-3">
          {!transcript && (
            <button
              onClick={() => setTranscript(SAMPLE_TRANSCRIPT)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Use sample transcript
            </button>
          )}
          <span className={`text-xs ${transcript.length > MAX_CHARS * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
            {transcript.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
          </span>
        </div>
      </div>
      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value.slice(0, MAX_CHARS))}
        disabled={isProcessing}
        placeholder="Paste your weekly management meeting transcript here…"
        className="w-full h-52 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 placeholder:text-gray-300 font-mono leading-relaxed"
      />
      {transcript.length > 100 && (
        <p className="text-xs text-gray-400">
          ~{Math.round(transcript.split(/\s+/).length / 130)} min read &middot; ready for extraction
        </p>
      )}
    </div>
  )
}
