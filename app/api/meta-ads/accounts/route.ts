import { NextResponse } from 'next/server';
import { getAdAccounts } from '@/lib/meta/api';

export async function GET(request: Request) {
  try {
    const accounts = await getAdAccounts();
    return NextResponse.json({ accounts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
