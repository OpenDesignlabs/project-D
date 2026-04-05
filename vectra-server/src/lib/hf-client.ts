/**
 * hf-client.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Server-side HuggingFace Router client.
 * Mirrors the logic from Studio's aiAgent.ts callDirectAPI +
 * callDirectAPIWithStreaming, but with API keys read from server env vars
 * instead of VITE_ browser-exposed vars.
 *
 * API keys NEVER touch the browser after this move.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const HF_ENDPOINT = 'https://router.huggingface.co/v1/chat/completions';

export const SERVER_AI_CONFIG = {
  primaryModel:  process.env.AI_PRIMARY_MODEL  ?? 'zai-org/GLM-5:zai-org',
  debuggerModel: process.env.AI_DEBUGGER_MODEL ?? 'deepseek-ai/DeepSeek-R1-0528:together',
  primaryApiKey:  process.env.AI_PRIMARY_KEY  ?? '',
  debuggerApiKey: process.env.AI_DEBUGGER_KEY ?? '',
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ─── STANDARD (non-streaming) ────────────────────────────────────────────────

export async function callHF(
  systemPrompt: string,
  userPrompt: string,
  model: string,
  apiKey: string,
  temperature = 0.65
): Promise<string> {
  if (!apiKey) {
    throw new Error(
      `[vectra-server] No API key configured for model ${model}. ` +
      `Set AI_PRIMARY_KEY or AI_DEBUGGER_KEY in server .env`
    );
  }

  let retries = MAX_RETRIES;

  while (retries > 0) {
    try {
      const res = await fetch(HF_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: userPrompt },
          ],
          max_tokens: 8000,
          temperature,
          stream: false,
        }),
        // Server-side fetch — no CORS restriction, but set a hard timeout
        signal: AbortSignal.timeout(240_000), // 4 mins (increased from 90s)
      });

      if (res.ok) {
        const data = await res.json() as any;
        return data.choices?.[0]?.message?.content ?? '';
      }

      if (res.status === 503 || res.status === 504) {
        console.warn(`[vectra-server/hf-client] HF Router ${res.status} — retry ${MAX_RETRIES - retries + 1}/${MAX_RETRIES}`);
        await sleep(RETRY_DELAY_MS);
        retries--;
        continue;
      }

      if (res.status === 401) throw new Error('Invalid HF API key (401)');
      if (res.status === 429) throw new Error('HF rate limit (429) — try again later');

      const errText = await res.text().catch(() => '');
      throw new Error(`HF API error ${res.status}: ${errText.slice(0, 200)}`);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('timed out') || msg.includes('fetch')) {
        console.warn(`[vectra-server/hf-client] Network timeout — retry ${MAX_RETRIES - retries + 1}/${MAX_RETRIES}`);
        await sleep(RETRY_DELAY_MS);
        retries--;
        if (retries === 0) throw new Error(`HF request failed after ${MAX_RETRIES} retries: ${msg}`);
        continue;
      }
      throw err;
    }
  }

  throw new Error(`[vectra-server/hf-client] Exhausted ${MAX_RETRIES} retries`);
}

// ─── STREAMING ───────────────────────────────────────────────────────────────
// Returns the full accumulated text (same as callHF) but reads SSE chunks
// from HF Router so the connection stays open for long-running generations.

export async function callHFStreaming(
  systemPrompt: string,
  userPrompt: string,
  model: string,
  apiKey: string,
  temperature = 0.65
): Promise<string> {
  if (!apiKey) throw new Error('[vectra-server] No API key for streaming call');

  let retries = MAX_RETRIES;

  while (retries > 0) {
    try {
      const res = await fetch(HF_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: userPrompt },
          ],
          max_tokens: 8000,
          temperature,
          stream: true,
        }),
        signal: AbortSignal.timeout(600_000), // 10 mins (increased from 2 mins)
      });

      if (!res.ok || !res.body) {
        if (res.status === 503 || res.status === 504) {
          await sleep(RETRY_DELAY_MS);
          retries--;
          continue;
        }
        throw new Error(`HF streaming error ${res.status}`);
      }

      // Accumulate SSE chunks into the full content string
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? ''; // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const chunk = JSON.parse(data) as any;
            const token = chunk.choices?.[0]?.delta?.content ?? '';
            accumulated += token;
          } catch {
            // malformed chunk — skip
          }
        }
      }

      return accumulated;

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('timed out')) {
        retries--;
        if (retries === 0) throw err;
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      throw err;
    }
  }

  throw new Error('[vectra-server/hf-client] Streaming exhausted retries');
}
