import { NextRequest, NextResponse } from 'next/server';
import { getComponentBySlug, getComponentById, incrementDownloads } from '../../../../lib/registry';

/**
 * GET /api/components/:id
 *
 * :id can be either a UUID or a slug — we try slug first, then UUID.
 * Returns the full ComponentRegistryEntry including sourceCode.
 *
 * Used by: Component detail page, Studio when user drops a Marketplace component.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try slug first (more common in URLs), fallback to UUID
    const component = id.includes('-') && id.length < 50
      ? (await getComponentBySlug(id)) ?? (await getComponentById(id))
      : (await getComponentById(id)) ?? (await getComponentBySlug(id));

    if (!component) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 });
    }

    // Fire-and-forget download increment
    incrementDownloads(component.id).catch(() => {});

    return NextResponse.json(component, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error('[/api/components/:id GET]', err);
    return NextResponse.json({ error: 'Failed to fetch component' }, { status: 500 });
  }
}
