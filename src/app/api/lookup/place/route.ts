import { NextResponse } from 'next/server';
import { searchPlace } from '@/lib/datasources/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get('q') ?? '';
  const data = await searchPlace(query);
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, max-age=60' }
  });
}
