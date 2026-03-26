# Notta Ad Clips Extractor

**Extract advertising-ready language from your weekly management meetings.**

Turn raw meeting transcripts from SMB ecommerce teams into structured, US-native ad wording clips — hooks, value propositions, CTAs, and more — ready for downstream creative workflows like image generation tools.

---

## Product Design Philosophy

**English:** This product is purpose-built for Product Growth Leaders at SMB ecommerce companies expanding into the US local market. Unlike generic AI meeting summarizers, it is a specialized advertising signal extractor. Every output is an atomic, intent-aware, metadata-tagged clip that can be directly fed into downstream AI creative tools. The system doesn't just find what was said — it finds what *should be said in your next ad*.

**中文产品设计理念：**

Notta 广告素材提取器是专为正在进入美国本地市场的中小型跨境电商品牌设计的增长工具，核心用户是市场增长负责人。与通用 AI 会议摘要工具不同，本产品是一个专业的广告信号提取系统——它不总结会议内容，而是识别哪些内容可以直接转化为广告语，并将其重写为地道的美式广告文案。每一条输出素材都是原子化的、带有意图标签和结构化元数据的语言单元，可以直接用于下游 AI 创意生成工具（如图像生成工具 Nano Banana）。该产品的价值不仅在于"找到说过什么"，更在于"挖掘下周广告应该说什么"。

---

## Why This Tool Was Built This Way

**Why ChatGPT for brainstorming:**
The product concept, schema design, and pipeline architecture were brainstormed with ChatGPT. ChatGPT excels at open-ended, multi-turn product thinking — it reasons deeply across ambiguous problem spaces, challenges assumptions, and iterates on abstract frameworks before any code is written. It's the right tool for *thinking through the problem in depth*.

**Why Claude Code for implementation:**
Claude Code handles the implementation. It understands complex codebases, produces clean TypeScript with proper typing, follows architectural conventions consistently across dozens of files, and catches edge cases early. It's the right tool for *building the solution with precision*.

---

## Features

| Feature | Description |
|---|---|
| **Transcript Segmentation** | Splits transcripts into logical 2–5 sentence segments with relevance scoring |
| **Actionability Filtering** | AI suggests what % of the transcript is ad-usable; user can override with slider |
| **Clip Extraction** | Extracts atomic, intent-aware clips from actionable segments |
| **6 Clip Types** | Hook, Value Proposition, CTA, Audience Insight, Channel Strategy, Missed Opportunity |
| **5 Variations** | Each clip is rewritten in 5 tones: urgent, friendly, authoritative, witty, emotional |
| **Quality Scoring** | 4-dimension scoring: US Language, Audience Clarity, Directness, Memorability |
| **Recommended Version** | Best variation selected with 2–3 sentence reasoning per clip |
| **Missed Opportunities** | Surfaces overlooked ad angles from low-relevance segments |
| **JSON Export** | Full structured export bundle for downstream AI tools |
| **Copy to Clipboard** | One-click copy per variation or all best clips at once |
| **Live Pipeline Progress** | SSE streaming shows each of the 5 stages completing in real-time |
| **Session Recovery** | Browser localStorage preserves work across page refreshes |

---

## Pipeline Overview

```
Transcript Input
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 1: ANALYZE  (claude-haiku-4-5)                        │
│  • Segment transcript into 2–5 sentence chunks               │
│  • Score each segment 0.0–1.0 for advertising relevance      │
│  • Tag with topic labels                                      │
│  • Suggest actionability percentage                           │
└───────────────────────────┬─────────────────────────────────┘
                            │ Top N% segments by relevance score
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 2: EXTRACT  (claude-sonnet-4-6)                       │
│  • Pull atomic ad-usable clips from actionable segments      │
│  • Classify into 6 clip types                                │
│  • Assign confidence scores and usage hints                  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 3: REWRITE  (claude-sonnet-4-6)                       │
│  • Generate 5 US-native ad language variations per clip      │
│  • Each variation uses a distinct tone                       │
│  • Batched in groups of 5 clips per API call                 │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 4: SCORE  (claude-haiku-4-5)                          │
│  • Score 4 quality dimensions per variation                  │
│  • Compute weighted quality score server-side                │
│  • Recommend best variation with reasoning                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 5: MISSED ANGLES  (claude-sonnet-4-6)                 │
│  • Scan ALL segments (including low-relevance ones)          │
│  • Surface overlooked advertising opportunities              │
│  • Suggest clip directions for each missed angle             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
               Structured Ad Clips + Export Bundle
```

### Quality Score Formula

```
qualityScore = nativeUSLanguage × 0.30
             + audienceClarity  × 0.30
             + directness       × 0.25
             + memorability     × 0.15
```

Weights are applied server-side after the AI returns raw dimension scores — the AI never sees the weighting logic.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Radix UI primitives |
| State | Zustand + localStorage persist |
| AI | Anthropic Claude API |
| Validation | Zod |
| AI Streaming | Server-Sent Events (SSE) |

---

## File Structure

```
src/
├── types/               # TypeScript interfaces for all domain objects
│   ├── campaign.ts      # CampaignContext, ChannelType, AdFormat, Objective
│   ├── transcript.ts    # TranscriptSegment, AnalysisResult
│   ├── clip.ts          # AdClip, ClipVariation, ClipRecommendation, MissedOpportunity
│   ├── pipeline.ts      # PipelineRun, PipelineStage, StageName
│   └── export.ts        # ExportBundle
│
├── lib/
│   ├── claude.ts        # Anthropic SDK wrapper with retry + JSON extraction
│   ├── validators.ts    # Zod schemas for all 5 AI response types
│   ├── export.ts        # JSON download + clipboard helpers
│   ├── utils.ts         # cn(), generateId(), extractJSON(), formatDuration()
│   ├── prompts/         # Prompt templates for each pipeline stage
│   │   ├── analyze.prompt.ts   # Segment transcript, score relevance, suggest actionability %
│   │   ├── extract.prompt.ts   # Pull atomic clips, classify type, assign confidence
│   │   ├── rewrite.prompt.ts   # Generate 5 US-native variations in distinct tones
│   │   ├── score.prompt.ts     # Score 4 quality dimensions, recommend best variation
│   │   └── missed.prompt.ts    # Surface overlooked angles from all segments
│   └── pipeline/        # Pipeline stage implementations + orchestrator
│       ├── orchestrator.ts     # Sequences 5 stages, emits SSE events to client
│       ├── stage-analyze.ts    # Transcript segmentation + relevance scoring
│       ├── stage-extract.ts    # Atomic clip extraction from actionable segments
│       ├── stage-rewrite.ts    # US-native variation generation (batched in 5s)
│       ├── stage-score.ts      # Quality scoring + weighted recommendation
│       └── stage-missed.ts     # Missed opportunity detection across all segments
│
├── store/
│   └── useAppStore.ts   # Zustand store: input, pipeline state, UI state, SSE consumer
│
└── components/
    ├── layout/
    │   └── AppShell.tsx            # Top nav with session reset + "Powered by Claude" label
    ├── input/
    │   ├── TranscriptInput.tsx     # Textarea with char count, sample transcript button
    │   ├── CampaignContextForm.tsx # Channel / format / objective selectors
    │   └── ActionabilityControl.tsx # Slider for actionability % with AI suggestion display
    ├── processing/
    │   └── PipelineProgress.tsx    # 5-stage live progress strip with timing and summaries
    └── results/
        ├── ResultsDashboard.tsx    # Main results container with filter + export controls
        ├── ClipCard.tsx            # Clip with type badge, source quote, variations list
        ├── VariationList.tsx       # 5 variations: recommended pinned, others collapsible
        ├── ClipTypeFilter.tsx      # Tab-style filter by clip type with counts
        ├── MissedOpportunities.tsx # Overlooked angles section at bottom of results
        └── ExportPanel.tsx         # JSON export + copy all clips buttons

app/
├── layout.tsx           # Root layout: metadata, fonts, AppShell wrapper
├── page.tsx             # Redirects root to /extract
└── extract/page.tsx     # Main 2-panel workflow: inputs (left) + results (right)

app/api/pipeline/route.ts  # SSE streaming POST endpoint, Node.js runtime, 120s timeout
```

---

## Local Run

**Prerequisites:** Node.js 18+, Anthropic API key

```bash
# 1. Clone the repository
git clone <repo-url>
cd notta

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Open .env.local and add: ANTHROPIC_API_KEY=sk-ant-...

# 4. Start the development server
npm run dev

# 5. Open in browser
open http://localhost:3000
```

**Additional commands:**

```bash
# Type-check without building
npm run type-check   # or: npx tsc --noEmit

# Production build
npm run build
npm start

# Lint
npm run lint
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | **Yes** | API key from console.anthropic.com |

---

## Sample Output (JSON Export)

```json
{
  "exportedAt": "2026-03-26T10:22:00Z",
  "version": "1.0",
  "campaignContext": {
    "channel": "google",
    "format": "image",
    "objective": "top_of_funnel",
    "market": "local United States"
  },
  "transcriptMeta": {
    "charCount": 4821,
    "suggestedActionabilityPct": 0.38,
    "effectiveActionabilityPct": 0.40,
    "segmentCount": 22,
    "actionableSegmentCount": 9
  },
  "clips": [
    {
      "id": "clip_001",
      "type": "hook",
      "sourceText": "We keep seeing customers leave because nobody ships same-day in this zip code.",
      "confidenceScore": 0.91,
      "usageHint": "Lead with this as a pain-agitate hook in Google responsive ads",
      "variations": [
        {
          "id": "clip_001_a",
          "text": "Same-day shipping? In YOUR zip code? Yes, finally.",
          "tone": "witty",
          "qualityScore": 0.91,
          "qualityDimensions": {
            "nativeUSLanguage": 0.95,
            "audienceClarity": 0.88,
            "directness": 0.93,
            "memorability": 0.90
          }
        }
      ],
      "recommendation": {
        "bestVariationId": "clip_001_a",
        "reasoning": "The witty question format stops the scroll with local specificity ('your zip code') while remaining punchy enough for a Google image ad headline. Implicit social proof via 'yes, finally' signals category gap."
      }
    }
  ],
  "missedOpportunities": [
    {
      "id": "missed_001",
      "angle": "Repeat-purchase loyalty signal",
      "observation": "The 60% repeat order rate was discussed as a cost metric, but it is strong social proof material for a value proposition clip.",
      "suggestedClipDirection": "Create a trust/social-proof value prop clip about customer return rate",
      "relatedSegmentIds": ["seg_011"]
    }
  ]
}
```

---

## MVP vs. Future Configurable

| Setting | MVP | Future |
|---|---|---|
| Clip types | 6 fixed types | Custom taxonomy per account |
| Variations per clip | Always 5 | User-adjustable 3–7 |
| Quality score weights | Fixed (30/30/25/15) | Custom scoring rubric |
| Channels | 6 options | Full channel catalog |
| Transcript limit | 50,000 chars | Configurable |
| Persistence | localStorage only | Cloud sessions with auth |
| Export formats | JSON + clipboard | PDF, Notion, Google Docs |
| AI models | Hardcoded per stage | User model selector |
| Creativity (temperature) | Fixed per stage | Slider in UI |

---

## License

MIT
