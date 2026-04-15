// Load .env.local before anything else.
// --env-file flag in package.json scripts handles Node 20.6+.
// This import is the fallback for older Node versions or direct `tsx src/index.ts` calls.
import { config } from 'dotenv';
config({ path: '.env.local' });

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { generateRoute }    from './routes/generate';
import { fixRoute }         from './routes/fix';
import { healthRoute }      from './routes/health';
import { stitchRoute }      from './routes/stitch';
import { marketplaceRoute } from './routes/marketplace';

const app = new Hono();

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use('*', cors({
  origin: (origin) => origin || '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'x-vectra-server-secret'],
}));

// ─── Auth middleware (all /api/* routes) ──────────────────────────────────────
const SERVER_SECRET = process.env.VECTRA_SERVER_SECRET ?? '';

app.use('/api/*', async (c, next) => {
  if (SERVER_SECRET) {
    const secret = c.req.header('x-vectra-server-secret');
    if (secret !== SERVER_SECRET) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
  }
  await next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.route('/api/ai/generate',  generateRoute);
app.route('/api/ai/fix',       fixRoute);
app.route('/api/ai/stitch',    stitchRoute);
app.route('/api/health',       healthRoute);
// Marketplace sub-server — all /api/marketplace/* requests land here
// Studio and Marketplace Next.js both call this; Supabase key stays server-side
app.route('/api/marketplace',  marketplaceRoute);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3002', 10) || 3002;

const server = serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`\n🚀 Vectra Server running on http://localhost:${PORT}`);
  console.log(`   AI primary:     ${process.env.AI_PRIMARY_MODEL  ?? 'zai-org/GLM-5:zai-org'}`);
  console.log(`   AI debugger:    ${process.env.AI_DEBUGGER_MODEL ?? 'deepseek-ai/DeepSeek-R1-0528:together'}`);
  console.log(`   Studio origin:  ${process.env.STUDIO_ORIGIN     ?? 'http://localhost:5173'}`);
  console.log(`   Supabase:       ${process.env.SUPABASE_URL ? '✅ configured' : '⚠️  SUPABASE_URL not set'}`);
  console.log(`   Auth:           ${SERVER_SECRET ? '✅ secret set' : '⚠️  open (no secret)'}\n`);
});

(server as any).timeout = 600_000;

export default app;
