/**
 * gemini-client.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Gemini API client for Vectra server.
 *
 * Supported models (prefix: 'gemini:')
 *   gemini:gemini-3.1-flash-preview          → Fast, best quality
 *   gemini:gemini-3.1-flash-lite-preview     → Fastest, lowest cost
 *   gemini:gemini-3.1-flash-live-preview     → Streaming-optimised
 *
 * Requires env var:
 *   GEMINI_API_KEY  — Google AI Studio key (https://aistudio.google.com/apikey)
 *
 * Routes via the OpenAI-compatible Gemini endpoint so we don't need
 * the @google/generative-ai SDK (keeps the server dependency-light).
 * ─────────────────────────────────────────────────────────────────────────────
 */

const GEMINI_BASE     = 'https://generativelanguage.googleapis.com/v1beta/openai';
const GEMINI_API_KEY  = process.env.GEMINI_API_KEY ?? '';

// Map our internal prefixed IDs → actual Gemini REST model names
// The real API IDs match the model names directly (confirmed from Google AI Studio)
const GEMINI_MODEL_MAP: Record<string, string> = {
  'gemini-3.1-flash-lite-preview': 'gemini-3.1-flash-lite-preview',  // Fastest & cheapest
  'gemini-3-flash-preview':        'gemini-3-flash-preview',          // Gemini 3 Flash (stable)
};

function resolveModel(modelWithPrefix: string): string {
  const stripped = modelWithPrefix.replace(/^gemini:/, '');
  return GEMINI_MODEL_MAP[stripped] ?? stripped;
}

// ─── NON-STREAMING ────────────────────────────────────────────────────────────

export async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  modelWithPrefix: string,
  temperature = 0.65
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('[vectra-server/gemini] GEMINI_API_KEY is not set. Add it to your .env file.');
  }

  const model = resolveModel(modelWithPrefix);
  console.log(`[vectra-server/gemini] Calling ${model} (non-streaming)`);

  const res = await fetch(`${GEMINI_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GEMINI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ],
      temperature,
      max_tokens: 16000,
    }),
    signal: AbortSignal.timeout(120_000), // 2 min — Gemini is fast
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Gemini API error ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json() as any;
  return data?.choices?.[0]?.message?.content ?? '';
}

// ─── STREAMING ────────────────────────────────────────────────────────────────

export async function callGeminiStreaming(
  systemPrompt: string,
  userPrompt: string,
  modelWithPrefix: string,
  temperature = 0.65
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('[vectra-server/gemini] GEMINI_API_KEY is not set. Add it to your .env file.');
  }

  const model = resolveModel(modelWithPrefix);
  console.log(`[vectra-server/gemini] Calling ${model} (streaming)`);

  const res = await fetch(`${GEMINI_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GEMINI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ],
      temperature,
      max_tokens: 16000,
      stream: true,
    }),
    signal: AbortSignal.timeout(180_000),
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(`Gemini streaming error ${res.status}: ${text.slice(0, 300)}`);
  }

  // OpenAI-compatible SSE: data: {"choices":[{"delta":{"content":"..."}}]}
  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (!trimmed.startsWith('data: ')) continue;
      try {
        const chunk = JSON.parse(trimmed.slice(6)) as any;
        const delta = chunk?.choices?.[0]?.delta?.content;
        if (delta) accumulated += delta;
      } catch {
        // malformed SSE chunk — skip
      }
    }
  }

  return accumulated;
}
