import { NextResponse } from 'next/server';
import { fanNamespace, remember } from '@/lib/memory';

export const runtime = 'nodejs';
export const maxDuration = 60;

const ERA_TAG: Record<string, string> = { Sporting: 'sporting', United: 'united', Madrid: 'madrid', Juventus: 'juventus', Portugal: 'portugal', 'Al Nassr': 'al-nassr' };
const KIND_TAG: Record<string, string> = { 'Free kicks': 'free-kick', Headers: 'header', 'Bicycle kicks': 'overhead', 'Solo runs': 'solo', Penalties: 'penalty', 'Last-minute winners': 'late', 'Long shots': 'long-range', 'Hat-tricks': 'hat-trick' };

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const fanId = typeof body?.fanId === 'string' ? body.fanId : '';
  const eras: string[] = Array.isArray(body?.eras) ? body.eras.filter((e: string) => e in ERA_TAG) : [];
  const kinds: string[] = Array.isArray(body?.kinds) ? body.kinds.filter((k: string) => k in KIND_TAG) : [];
  if (!fanId || (!eras.length && !kinds.length)) return NextResponse.json({ error: 'Pick at least one era or goal type.' }, { status: 400 });
  const tags = [...eras.map((e) => ERA_TAG[e]), ...kinds.map((k) => KIND_TAG[k])];
  try {
    const mem = await remember(`PROFILE · eras=${eras.join(', ') || 'any'} · kinds=${kinds.join(', ') || 'any'} · tags=${tags.join(',')}`, fanNamespace(fanId));
    return NextResponse.json({ ok: true, blobId: mem.blobId });
  } catch {
    return NextResponse.json({ error: 'Could not save your taste right now. Try again.' }, { status: 502 });
  }
}
