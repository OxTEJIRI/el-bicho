import { NextResponse } from 'next/server';
import { MOMENTS } from '@/lib/data';
import { fanNamespace, recall, remember } from '@/lib/memory';
import { tasteFrom } from '@/lib/taste';

export const runtime = 'nodejs';

const REACTIONS = ['Unreal', 'SIUUU', 'Tears', 'Remember'];

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const fanId = typeof body?.fanId === 'string' ? body.fanId : '';
  const moment = MOMENTS.find((m) => m.id === body?.momentId);
  if (!fanId || !moment || !REACTIONS.includes(body?.reaction)) {
    return NextResponse.json({ error: 'Unknown moment or reaction.' }, { status: 400 });
  }
  const note = typeof body?.note === 'string' ? body.note.replace(/\s+/g, ' ').slice(0, 280) : '';
  const ns = fanNamespace(fanId);
  try {
    const text = `REACTION · moment=${moment.id} · reaction=${body.reaction} · tags=${moment.tags.join(',')}` + (note ? ` · memory="${note}"` : '');
    const mem = await remember(text, ns);
    const lines = (await recall('reactions to Ronaldo moments', ns, 30)).map((r) => r.text);
    return NextResponse.json({ ok: true, blobId: mem.blobId, taste: tasteFrom(lines) });
  } catch (e) {
    return NextResponse.json({ error: 'Could not save that reaction. Try again.', detail: String((e as Error).message).slice(0, 160) }, { status: 502 });
  }
}
