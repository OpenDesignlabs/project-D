/**
 * routes/marketplace.ts  — Marketplace sub-server
 * ─────────────────────────────────────────────────────────────────────────────
 * Hono route group mounted at /api/marketplace/* in index.ts.
 * This IS the "sub-server" — same process, isolated route prefix, full auth.
 *
 * Callers:
 *   Studio              → GET  /api/marketplace/components?studio=1
 *   Marketplace Next.js → GET  /api/marketplace/components
 *                         GET  /api/marketplace/components/:slug
 *                         POST /api/marketplace/publish
 *
 * Why Hono route grouping instead of Nginx/Apache:
 *   Nginx/Apache are TCP reverse proxies — they forward HTTP bytes but cannot
 *   add auth headers, run query logic, or call Supabase. You'd still need a
 *   Node process behind them. Hono .route() gives identical isolation with
 *   zero extra infrastructure, zero extra deployment, full TypeScript.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Hono } from 'hono';
import { supabase } from '../lib/supabase-client';

export const marketplaceRoute = new Hono();

// ─── Row → domain shape ───────────────────────────────────────────────────────
type DbRow = Record<string, unknown>;

function rowToEntry(row: DbRow) {
  return {
    id:              row['id'],
    name:            row['name'],
    version:         row['version'],
    slug:            row['slug'],
    label:           row['label'],
    description:     row['description'],
    category:        row['category'],
    tags:            row['tags'],
    previewImageUrl: row['preview_image_url'] ?? undefined,
    previewCode:     row['preview_code'] ?? undefined,
    importMeta:      row['import_meta'],
    sourceCode:      row['source_code'],
    defaultProps:    row['default_props'],
    propsSchema:     row['props_schema'],
    publishedBy:     row['published_by'],
    isOfficial:      row['is_official'],
    isVerified:      row['is_verified'],
    createdAt:       row['created_at'],
    updatedAt:       row['updated_at'],
    downloads:       row['downloads'],
    stars:           row['stars'],
  };
}

function rowToStudioEntry(row: DbRow) {
  return {
    id:              row['id'],
    name:            row['name'],
    slug:            row['slug'],
    label:           row['label'],
    category:        row['category'],
    tags:            row['tags'],
    importMeta:      row['import_meta'],
    defaultProps:    row['default_props'],
    propsSchema:     row['props_schema'],
    previewImageUrl: row['preview_image_url'] ?? undefined,
    isOfficial:      row['is_official'],
    downloads:       row['downloads'],
  };
}

// ─── GET /api/marketplace/components ─────────────────────────────────────────

marketplaceRoute.get('/components', async (c) => {
  try {
    const q = c.req.query();
    const isStudio  = q['studio'] === '1';
    const pageNum   = Math.max(1, parseInt(q['page']  ?? '1'));
    const limitNum  = Math.min(100, parseInt(q['limit'] ?? '24'));
    const from      = (pageNum - 1) * limitNum;

    let query = supabase
      .from('components')
      .select(
        isStudio
          ? 'id,name,slug,label,category,tags,import_meta,default_props,props_schema,preview_image_url,is_official,downloads'
          : '*',
        { count: 'exact' }
      );

    if (q['search'])    query = query.or(`name.ilike.%${q['search']}%,label.ilike.%${q['search']}%,description.ilike.%${q['search']}%`);
    if (q['category'])  query = query.eq('category', q['category']);
    if (q['official'] === '1') query = query.eq('is_official', true);

    switch (q['sort'] ?? 'popular') {
      case 'newest':   query = query.order('created_at', { ascending: false }); break;
      case 'stars':    query = query.order('stars',       { ascending: false }); break;
      case 'official': query = query.order('is_official', { ascending: false }); break;
      default:         query = query.order('downloads',   { ascending: false }); break;
    }

    const { data, error, count } = await query.range(from, from + limitNum - 1);
    if (error) throw error;

    const mapper = isStudio ? rowToStudioEntry : rowToEntry;
    const components = (data as unknown as DbRow[] ?? []).map(mapper);

    // Studio just wants a flat array
    if (isStudio) {
      return c.json(components, 200, {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      });
    }

    return c.json({
      components,
      total:   count ?? 0,
      page:    pageNum,
      limit:   limitNum,
      hasMore: from + limitNum < (count ?? 0),
    }, 200, {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch components';
    console.error('[marketplace/components GET]', msg);
    return c.json({ error: msg }, 500);
  }
});

// ─── GET /api/marketplace/components/:slug ────────────────────────────────────

marketplaceRoute.get('/components/:slug', async (c) => {
  const slug = c.req.param('slug');
  try {
    const isUUID = /^[0-9a-f-]{36}$/.test(slug);
    const { data, error } = isUUID
      ? await supabase.from('components').select('*').eq('id',   slug).single()
      : await supabase.from('components').select('*').eq('slug', slug).single();

    if (error || !data) return c.json({ error: 'Component not found' }, 404);

    // Fire-and-forget download increment.
    // supabase.rpc() returns a PromiseLike (PostgrestSingleResponse), NOT a native Promise.
    // .catch() doesn't exist on it — wrap in Promise.resolve() to get a real Promise.
    Promise.resolve(
      supabase.rpc('increment_downloads', { component_id: (data as DbRow)['id'] as string })
    ).catch(() => {});

    return c.json(rowToEntry(data as DbRow), 200, {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch component';
    console.error('[marketplace/components/:slug GET]', msg);
    return c.json({ error: msg }, 500);
  }
});

// ─── POST /api/marketplace/publish ───────────────────────────────────────────

marketplaceRoute.post('/publish', async (c) => {
  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid request body' }, 400);
  }

  const required = ['name', 'version', 'slug', 'label', 'description', 'category', 'sourceCode', 'publishedBy'];
  for (const field of required) {
    if (!body[field]) return c.json({ success: false, error: `Missing field: ${field}` }, 400);
  }

  const slug = body['slug'] as string;
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return c.json({ success: false, error: 'slug must be lowercase alphanumeric with hyphens only' }, 400);
  }

  try {
    const { data: existing } = await supabase.from('components').select('id').eq('slug', slug).single();
    if (existing) return c.json({ success: false, error: `Slug '${slug}' already exists` }, 409);

    const publishedBy = body['publishedBy'] as string;
    const { data, error } = await supabase
      .from('components')
      .insert({
        name:          body['name'],
        version:       body['version'] ?? '1.0.0',
        slug,
        label:         body['label'],
        description:   body['description'],
        category:      body['category'],
        tags:          body['tags'] ?? [],
        import_meta:   body['importMeta'] ?? {},
        source_code:   body['sourceCode'],
        default_props: body['defaultProps'] ?? {},
        props_schema:  body['propsSchema'] ?? [],
        published_by:  publishedBy,
        preview_code:  body['previewCode'] ?? null,
        is_official:   publishedBy === 'vectra',
        is_verified:   publishedBy === 'vectra',
      })
      .select()
      .single();

    if (error) throw error;
    return c.json({ success: true, component: rowToEntry(data as DbRow) }, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Publish failed';
    console.error('[marketplace/publish POST]', msg);
    return c.json({ success: false, error: msg }, 500);
  }
});
