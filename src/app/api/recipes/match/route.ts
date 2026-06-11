import { NextResponse } from 'next/server';
import { findRecipeForHost, type PortalRecipe } from '@/lib/portalRecipes';
import { verifyRecipeToken } from '@/lib/recipeToken';
import { mockBuyers } from '@/lib/mockData';
import { buildServerProfile } from '@/lib/serverProfile';
import { buildProfileSnapshot } from '@/lib/portalMapping';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_PROFILE_KEYS = new Set([
  'name',
  'firstName',
  'lastName',
  'email',
  'phone',
  'birthDate',
  'iban',
  'steuerId',
  'meterReadingElectricity',
  'meterReadingGas',
  'moveInDate',
  'newAddress',
  'newStreet',
  'newHouseNumber',
  'newPostalCode',
  'newCity',
  'newDistrict',
  'oldAddress',
  'oldStreet',
  'oldHouseNumber',
  'oldPostalCode',
  'oldCity'
]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const host = url.searchParams.get('host') ?? '';
  const path = url.searchParams.get('path') ?? '';
  const token = url.searchParams.get('token') ?? '';

  if (!host) {
    return NextResponse.json({ error: 'missing_host' }, { status: 400 });
  }

  const recipe = findRecipeForHost(host, path);
  if (!recipe) {
    return NextResponse.json({ error: 'no_recipe', host }, { status: 404 });
  }

  const payload = verifyRecipeToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
  }

  const buyer = mockBuyers.find(b => b.id === payload.buyerId);
  const profile = buildServerProfile(buyer ?? mockBuyers[0]);
  const requestedKeys = recipe.fields
    .map(f => f.profileKey)
    .filter(k => ALLOWED_PROFILE_KEYS.has(k as string));
  const snapshot = buildProfileSnapshot(profile, requestedKeys);

  const safeRecipe: PortalRecipe = {
    ...recipe,
    fields: recipe.fields.filter(f => ALLOWED_PROFILE_KEYS.has(f.profileKey as string))
  };

  return NextResponse.json(
    {
      recipe: safeRecipe,
      profile: snapshot,
      issuedFor: payload.buyerId,
      expiresAt: new Date(payload.exp * 1000).toISOString()
    },
    {
      headers: {
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
