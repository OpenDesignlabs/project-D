# Vectra Server

The backend layer for Vectra Studio. Proxies all AI calls server-side so HuggingFace API keys never touch the browser.

## Architecture

```
Studio (browser)                  Server (Node.js)             HuggingFace Router
────────────────                  ────────────────             ──────────────────
Tier 1: Local heuristics ──────► (skipped, instant)
Tier 2: Cloud LLM       ──────► POST /api/ai/generate ──────► GLM-5 / DeepSeek
SRE Agent fix           ──────► POST /api/ai/fix       ──────► DeepSeek-R1
                                 (API keys server-only)
```

**What moves to the server:**
- HuggingFace API keys (`AI_PRIMARY_KEY`, `AI_DEBUGGER_KEY`)  
- Full system prompts (section-first architecture prompt, SRE debugger prompt)
- JSON parsing of AI output (extractSections, repairJSON)
- Retry logic on 503/504

**What stays in the browser:**
- Tier 1 local heuristics (instant, zero-cost, no network)
- `buildCanvasContext` (canvas tree serialization)
- `processTemplates` (Tier 3 fallback)
- All stage event dispatching (`vectra:ai-stage`, `vectra:ai-stream-chunk`)
- All permanent Studio constraints (PERF-3, MOBILE-ARCH-1, STRICT-MODE-DOUBLE-INVOKE)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
```

Fill in:
```env
AI_PRIMARY_KEY=hf_your_primary_key_here
AI_DEBUGGER_KEY=hf_your_debugger_key_here
VECTRA_SERVER_SECRET=your_random_32char_secret
STUDIO_ORIGIN=http://localhost:5173
```

### 3. Update Studio .env

**Remove** from Studio `.env`:
```
VITE_AI_PRIMARY_KEY=...
VITE_AI_DEBUGGER_KEY=...
VITE_AI_HF_TOKEN=...
```

**Add** to Studio `.env`:
```
VITE_SERVER_URL=http://localhost:3002
VITE_SERVER_SECRET=your_random_32char_secret  ← same value as server
```

### 4. Apply Studio aiAgent.ts patch

Follow instructions in `STUDIO_AIAGENT_PATCH.ts` — 7 surgical changes.

### 5. Run

```bash
# Terminal 1 — Marketplace
cd vectra-marketplace && npm run dev   # → localhost:3001

# Terminal 2 — Server
cd vectra-server && npm run dev        # → localhost:3002

# Terminal 3 — Studio
cd vectra-studio && npm run dev        # → localhost:5173
```

### 6. Verify
```bash
curl http://localhost:3002/api/health
# → {"ok":true,"version":"0.1.0","models":{...}}
```

## API Reference

### `POST /api/ai/generate`

Studio → Server. Runs full section-first generation.

**Headers:** `x-vectra-server-secret: <secret>`

**Body:**
```json
{
  "prompt": "Build a SaaS landing page",
  "canvasContext": "Page: Home\n  webpage\n    container (PageWrapper)..."
}
```

**Response:** `GenerateResponse` — same shape as Studio's `AIResponse`:
```json
{
  "action": "create",
  "elements": { "wp1": {...}, "sn1": {...} },
  "rootId": "wp1",
  "message": "Generated 5 sections ✨",
  "aiMeta": { "prompt": "...", "model": "..." }
}
```

### `POST /api/ai/fix`

Studio SRE agent → Server. Fixes a broken component.

**Body:**
```json
{
  "brokenCode": "export default function Hero(props) { ... }",
  "errorMessage": "Lucide[x] is not a component"
}
```

**Response:**
```json
{ "fixedCode": "export default function Hero(props) { ... }" }
```

### `GET /api/health`

```json
{ "ok": true, "version": "0.1.0", "models": { "primary": "...", "debugger": "..." } }
```

## File Structure

```
vectra-server/
├── .env.local.example
├── next.config.mjs
├── package.json
├── tsconfig.json
├── STUDIO_AIAGENT_PATCH.ts     ← Apply this to Studio's aiAgent.ts
└── src/
    ├── app/
    │   └── api/
    │       ├── health/
    │       │   └── route.ts    ← GET /api/health
    │       └── ai/
    │           ├── generate/
    │           │   └── route.ts ← POST /api/ai/generate
    │           └── fix/
    │               └── route.ts ← POST /api/ai/fix
    ├── lib/
    │   └── hf-client.ts        ← Server-side HF API client (keys read from env)
    └── types/
        └── index.ts            ← Request/response contracts
```

## Deploy

Deploy to any Node.js host (Railway, Fly.io, Render, Vercel):

```bash
npm run build
npm run start
```

Set the same env vars in the hosting dashboard.  
Update Studio's `VITE_SERVER_URL` to the production URL.
