import { Hono } from 'hono';
import { callHF, SERVER_AI_CONFIG } from '../lib/hf-client';

export const stitchRoute = new Hono();

stitchRoute.post('/', async (c) => {
  let body: { prompt: string; systemPrompt: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid request body' }, 400);
  }

  const { prompt, systemPrompt } = body;
  if (!prompt || !systemPrompt) {
    return c.json({ error: 'prompt and systemPrompt are required' }, 400);
  }

  const activeKey = SERVER_AI_CONFIG.primaryApiKey;
  if (!activeKey) {
    return c.json(
      { error: '🔑 No AI primary key on server. Add AI_PRIMARY_KEY to vectra-server .env' },
      500
    );
  }

  try {
    console.log('[vectra-server/stitch] Stitch agent generating component...');
    const content = await callHF(systemPrompt, prompt, SERVER_AI_CONFIG.primaryModel, activeKey, 0.7);

    if (!content) throw new Error('Stitch agent returned empty response');

    console.log('[vectra-server/stitch] ✓ Component generated');
    return c.json({ text: content });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Stitch generation failed';
    console.error('[vectra-server/stitch] Failed:', msg);
    return c.json({ error: msg }, 502);
  }
});
