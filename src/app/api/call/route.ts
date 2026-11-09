import { NextResponse } from 'next/server';
import { latestCheckpoint } from '@/lib/sui';
import { fanNamespace, remember } from '@/lib/memory';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SCORE = ['Yes', 'No'];
const HOW = ['Header', 'Left foot', 'Right foot', 'Penalty', 'Free kick'];
const WHEN = ['1st half', '2nd half'];

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const fanId = typeof body?.fanId === 'string' ? body.fanId : '';
  const match = typeof body?.match === 'string' ? body.match.slice(0, 80) : 'next-match';
  if (!fanId || !SCORE.includes(body?.score) || (body.score === 'Yes' && (!HOW.includes(body?.how) || !WHEN.includes(body?.when)))) {
    return NextResponse.json({ error: 'Pick whether he scores, and how and when.' }, { status: 400 });
  }
  try {
    const cp = await latestCheckpoint();
    const pick = body.score === 'No' ? 'blank' : `scores · how=${body.how} · when=${body.when}`;
    const text = `CALL · match=${match} · ${pick} · locked_at_checkpoint=${cp.sequence} · checkpoint_time=${cp.time}`;
    const mem = await remember(text, fanNamespace(fanId));
    return NextResponse.json({ ok: true, checkpoint: cp, blobId: mem.blobId, text });
  } catch (e) {
    return NextResponse.json({ error: 'Could not lock your call right now. Try again.', detail: String((e as Error).message).slice(0, 160) }, { status: 502 });
  }
}
