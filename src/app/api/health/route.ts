import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Minimal health check - no filesystem, no DB, no external calls
// Just return 200 OK as fast as possible
export async function GET() {
  return new Response('ok', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  });
}

