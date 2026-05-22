import { NextResponse } from 'next/server';
import { getAdInsights } from '@/lib/meta/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get('accountId');
  const datePreset = searchParams.get('datePreset') || 'last_7d';

  if (!accountId) {
    return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
  }

  try {
    const data = await getAdInsights(accountId, undefined, datePreset);
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
