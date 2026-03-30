/**
 * seed.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Bootstraps the Supabase components table via vectra-server.
 * No Supabase credentials needed here — the server holds them.
 *
 * Run: npm run seed
 * Requires vectra-server running at VECTRA_SERVER_URL.
 *
 * .env.local needs:
 *   VECTRA_SERVER_URL=http://localhost:3002
 *   VECTRA_SERVER_SECRET=same_as_server
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { config } from 'dotenv';
import { SEED_COMPONENTS } from '../data/seed-data';

config({ path: '.env.local' });

const SERVER_URL    = process.env.VECTRA_SERVER_URL    ?? 'http://localhost:3002';
const SERVER_SECRET = process.env.VECTRA_SERVER_SECRET ?? '';

if (!SERVER_SECRET) {
  console.error('❌  VECTRA_SERVER_SECRET not set in .env.local');
  process.exit(1);
}

async function seed() {
  console.log(`\n🌱  Seeding ${SEED_COMPONENTS.length} components → ${SERVER_URL}\n`);

  let inserted = 0, skipped = 0, failed = 0;

  for (const component of SEED_COMPONENTS) {
    try {
      const res = await fetch(`${SERVER_URL}/api/marketplace/publish`, {
        method: 'POST',
        headers: {
          'Content-Type':           'application/json',
          'x-vectra-server-secret': SERVER_SECRET,
        },
        body: JSON.stringify(component),
      });

      const data: { success: boolean; error?: string } = await res.json();

      if (res.status === 409) {
        console.log(`  ⏭  Skipped  ${component.label}`);
        skipped++;
      } else if (!res.ok || !data.success) {
        console.error(`  ❌  Failed   ${component.label}: ${data.error ?? `HTTP ${res.status}`}`);
        failed++;
      } else {
        console.log(`  ✅  Inserted ${component.label}`);
        inserted++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌  Network  ${component.label}: ${msg}`);
      failed++;
    }
  }

  console.log(`
────────────────────────────
  ✅  Inserted : ${inserted}
  ⏭  Skipped  : ${skipped}
  ❌  Failed   : ${failed}
────────────────────────────`);

  if (failed > 0) process.exit(1);
}

seed().catch(err => { console.error('Seed crashed:', err); process.exit(1); });
