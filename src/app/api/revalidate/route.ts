/**
 * API Route for Cache Revalidation
 * Allows on-demand cache invalidation
 *
 * Usage:
 * POST /api/revalidate?secret=YOUR_SECRET&tag=products
 * POST /api/revalidate?secret=YOUR_SECRET&path=/products
 */

import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Get secret from query params
    const secret = request.nextUrl.searchParams.get('secret');

    // Security check
    if (!secret || secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { error: 'Invalid or missing secret' },
        { status: 401 }
      );
    }

    // Get revalidation type
    const tag = request.nextUrl.searchParams.get('tag');
    const path = request.nextUrl.searchParams.get('path');
    const all = request.nextUrl.searchParams.get('all');

    // Revalidate by tag
    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({
        success: true,
        revalidated: true,
        type: 'tag',
        value: tag,
        timestamp: Date.now(),
      });
    }

    // Revalidate by path
    if (path) {
      revalidatePath(path);
      return NextResponse.json({
        success: true,
        revalidated: true,
        type: 'path',
        value: path,
        timestamp: Date.now(),
      });
    }

    // Revalidate everything (use with caution)
    if (all === 'true') {
      // Revalidate common paths
      const paths = ['/', '/products', '/categories', '/cart', '/checkout'];
      paths.forEach((p) => revalidatePath(p));

      // Revalidate common tags
      const tags = ['products', 'categories', 'homepage', 'cart'];
      tags.forEach((t) => revalidateTag(t));

      return NextResponse.json({
        success: true,
        revalidated: true,
        type: 'all',
        paths,
        tags,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json(
      { error: 'Missing tag, path, or all parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      {
        error: 'Revalidation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also support GET for easy browser testing
export async function GET(request: NextRequest) {
  return POST(request);
}
