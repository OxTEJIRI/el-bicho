import { NextResponse } from 'next/server';
import { recall, remember } from '@/lib/memory';

export const runtime = 'nodejs';
export const maxDuration = 60;

const NS = 'elbicho-wall';

// The 1,000 Wall: fans leave a message for Ronaldo. Messages are sealed until goal 1,000;
// the API only ever returns how many there are.
export async function GET() {
  try {
    const found = (await recall('message for Ronaldo on the road to 1000', NS, 100)).filter((r) => r.text.startsWith('WALL'));
    return NextResponse.json({ count: found.length, capped: found.length >= 100 });
  } catch {
    return NextResponse.json({ count: null });
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const message = typeof body?.message === 'string' ? body.message.replace(/\s+/g, ' ').trim().slice(0, 200) : '';
  const handle = typeof body?.handle === 'string' ? body.handle.replace(/[^\p{L}\p{N}_ .-]/gu, '').trim().slice(0, 24) : '';
  if (message.length < 3) return NextResponse.json({ error: 'Write a few words for him.' }, { status: 400 });
  try {
    const mem = await remember(`WALL · handle=${handle || 'a fan'} · message="${message}"`, NS);
    return NextResponse.json({ ok: true, blobId: mem.blobId });
  } catch {
    return NextResponse.json({ error: 'Could not seal your message right now. Try again.' }, { status: 502 });
  }
}
