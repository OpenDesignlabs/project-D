import { NextRequest, NextResponse } from 'next/server';
import { publishComponent } from '../../../lib/registry';
import type { PublishComponentPayload, PublishComponentResponse } from '../../../types';

const PUBLISH_SECRET = process.env.VECTRA_PUBLISH_SECRET;

/**
 * POST /api/publish
 *
 * Protected by VECTRA_PUBLISH_SECRET header for V1.
 * Community auth (Supabase Auth) comes in V2.
 *
 * Body: PublishComponentPayload
 * Returns: PublishComponentResponse
 *
 * Used by: Admin seed script, Vectra Server after AI codegen.
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check — V1 uses a shared secret
    const secret = req.headers.get('x-vectra-publish-secret');
    if (PUBLISH_SECRET && secret !== PUBLISH_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body: PublishComponentPayload = await req.json();

    // Basic validation
    const required: (keyof PublishComponentPayload)[] = [
      'name', 'version', 'slug', 'label', 'description',
      'category', 'importMeta', 'sourceCode', 'publishedBy',
    ];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Slug format validation
    if (!/^[a-z0-9-]+$/.test(body.slug)) {
      return NextResponse.json(
        { success: false, error: 'slug must be lowercase alphanumeric with hyphens only' },
        { status: 400 }
      );
    }

    const component = await publishComponent(body);

    const response: PublishComponentResponse = { success: true, component };
    return NextResponse.json(response, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/publish POST]', message);

    // Slug uniqueness conflict
    if (message.includes('already exists')) {
      return NextResponse.json(
        { success: false, error: message } satisfies PublishComponentResponse,
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to publish component' } satisfies PublishComponentResponse,
      { status: 500 }
    );
  }
}
