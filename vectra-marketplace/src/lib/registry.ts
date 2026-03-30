/**
 * registry.ts — Marketplace forwarder
 * ─────────────────────────────────────────────────────────────────────────────
 * Forwards all data requests to vectra-server /api/marketplace/*.
 * Marketplace no longer holds a Supabase service key at runtime.
 *
 * Security flow:
 *   Marketplace Next.js → vectra-server (x-vectra-server-secret) → Supabase
 *
 * Exception: seed.ts is a one-time dev bootstrap that posts through the server's
 * publish endpoint. It never imports this file.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type {
  ComponentRegistryEntry,
  GetComponentsQuery,
  GetComponentsResponse,
  PublishComponentPayload,
  StudioComponentEntry,
} from '../types';

const SERVER_URL    = process.env.VECTRA_SERVER_URL    ?? 'http://localhost:3002';
const SERVER_SECRET = process.env.VECTRA_SERVER_SECRET ?? '';

function headers(): HeadersInit {
  return {
    'Content-Type':           'application/json',
    'x-vectra-server-secret': SERVER_SECRET,
  };
}

async function serverFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${SERVER_URL}/api/marketplace${path}`, {
    ...init,
    headers: { ...headers(), ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error((err as { error?: string })?.error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Public API — identical signatures to old registry.ts ────────────────────

export async function getComponents(
  query: GetComponentsQuery = {}
): Promise<GetComponentsResponse> {
  const p = new URLSearchParams();
  if (query.search)       p.set('search',   query.search);
  if (query.category)     p.set('category', query.category);
  if (query.sort)         p.set('sort',     query.sort);
  if (query.page)         p.set('page',     String(query.page));
  if (query.limit)        p.set('limit',    String(query.limit));
  if (query.officialOnly) p.set('official', '1');
  if (query.tags?.length) p.set('tags',     query.tags.join(','));
  const qs = p.toString();
  return serverFetch<GetComponentsResponse>(`/components${qs ? `?${qs}` : ''}`);
}

export async function getStudioComponents(): Promise<StudioComponentEntry[]> {
  return serverFetch<StudioComponentEntry[]>('/components?studio=1');
}

export async function getComponentBySlug(slug: string): Promise<ComponentRegistryEntry | null> {
  try { return await serverFetch<ComponentRegistryEntry>(`/components/${slug}`); }
  catch { return null; }
}

export async function getComponentById(id: string): Promise<ComponentRegistryEntry | null> {
  try { return await serverFetch<ComponentRegistryEntry>(`/components/${id}`); }
  catch { return null; }
}

export async function publishComponent(payload: PublishComponentPayload): Promise<ComponentRegistryEntry> {
  const r = await serverFetch<{ success: boolean; component?: ComponentRegistryEntry; error?: string }>(
    '/publish',
    { method: 'POST', body: JSON.stringify(payload) }
  );
  if (!r.success || !r.component) throw new Error(r.error ?? 'Publish failed');
  return r.component;
}

// No-op — download tracking is handled server-side on GET /components/:slug
export async function incrementDownloads(_id: string): Promise<void> {}
