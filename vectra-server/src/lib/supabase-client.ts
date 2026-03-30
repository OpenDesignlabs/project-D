/**
 * supabase-client.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * The ONLY place the Supabase service role key lives in the entire system.
 *
 * Data flow:
 *   Studio     → vectra-server (x-vectra-server-secret) → Supabase
 *   Marketplace → vectra-server (x-vectra-server-secret) → Supabase
 *
 * Neither Studio nor Marketplace hold this key at runtime.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn(
    '[vectra-server/supabase] ⚠️  SUPABASE_URL or SUPABASE_SERVICE_KEY not set — ' +
    'marketplace routes will fail. Add both to .env.local'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});
