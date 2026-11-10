import { NextResponse } from 'next/server';
import { liveOracle } from '@/lib/oracle-live';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET() {
  return NextResponse.json(await liveOracle());
}
