import { NextResponse } from 'next/server';
import { searchAddress } from '@/lib/datasources/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get('q') ?? '';
  const country = url.searchParams.get('country') ?? 'de';
  const data = await searchAddress(query, country);
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, max-age=30' }
  });
}
