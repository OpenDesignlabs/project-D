import { NextRequest, NextResponse } from 'next/server';
import { getComponents, getStudioComponents } from '../../../lib/registry';
import type { GetComponentsQuery, ComponentCategory } from '../../../types';

/**
 * GET /api/components
 *
 * Query params:
 *   search    - full-text search string
 *   category  - ComponentCategory filter
 *   sort      - 'popular' | 'newest' | 'official' | 'stars'
 *   page      - page number (default 1)
 *   limit     - items per page (default 24)
 *   tags      - comma-separated tag list
 *   official  - '1' to filter official only
 *   studio    - '1' to return StudioComponentEntry shape (no sourceCode)
 *
 * Used by: Marketplace browse page + Studio UIContext on load.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    // Studio-optimized endpoint (no sourceCode field)
    if (searchParams.get('studio') === '1') {
      const components = await getStudioComponents();
      return NextResponse.json(components, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      });
    }

    const query: GetComponentsQuery = {
      search:       searchParams.get('search') ?? undefined,
      category:     (searchParams.get('category') as ComponentCategory) ?? undefined,
      sort:         (searchParams.get('sort') as GetComponentsQuery['sort']) ?? 'popular',
      page:         searchParams.get('page')  ? parseInt(searchParams.get('page')!)  : 1,
      limit:        searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 24,
      officialOnly: searchParams.get('official') === '1',
      tags: searchParams.get('tags')
        ? searchParams.get('tags')!.split(',').filter(Boolean)
        : undefined,
    };

    const result = await getComponents(query);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
      },
    });
  } catch (err) {
    console.error('[/api/components GET]', err);
    return NextResponse.json(
      { error: 'Failed to fetch components' },
      { status: 500 }
    );
  }
}
