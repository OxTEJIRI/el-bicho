import { NextResponse } from 'next/server';
import { FIXTURES } from '@/lib/data';
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
  const matchId = typeof body?.match === 'string' ? body.match : '';
  const fixture = FIXTURES.find((candidate) => candidate.id === matchId);
  if (!fanId) {
    return NextResponse.json({ error: 'Missing fan id.' }, { status: 400 });
  }
  if (!fixture) {
    return NextResponse.json({ error: 'Unknown match.' }, { status: 400 });
  }
  if (!SCORE.includes(body?.score) || (body.score === 'Yes' && (!HOW.includes(body?.how) || !WHEN.includes(body?.when)))) {
    return NextResponse.json({ error: 'Pick whether he scores, and how and when.' }, { status: 400 });
  }
  const kickoffAt = Date.parse(fixture.kickoff);
  if (Date.now() >= kickoffAt) {
    return NextResponse.json({ error: 'Calls are closed for this match.' }, { status: 409 });
  }

  try {
    const cp = await latestCheckpoint();
    // Recheck after the network read so a slow checkpoint request cannot carry a call past kickoff.
    const acceptedAtDate = new Date();
    if (acceptedAtDate.getTime() >= kickoffAt) {
      return NextResponse.json({ error: 'Calls are closed for this match.' }, { status: 409 });
    }
    const acceptedAt = acceptedAtDate.toISOString();
    const pick = body.score === 'No' ? 'blank' : `scores · how=${body.how} · when=${body.when}`;
    const text = `CALL · match=${fixture.id} · ${pick} · accepted_at_server=${acceptedAt} · checkpoint_observed=${cp.sequence} · checkpoint_time=${cp.time}`;
    const publicText = `PUBLICCALL · match=${fixture.id} · fan=${fanId.slice(0, 6)} · ${pick} · accepted_at_server=${acceptedAt} · checkpoint_observed=${cp.sequence}`;
    // both writes run at once, so the fan waits for one Walrus write, not two
    const [mem] = await Promise.all([remember(text, fanNamespace(fanId)), remember(publicText, 'elbicho-calls').catch(() => null)]);
    return NextResponse.json({ ok: true, acceptedAt, checkpoint: cp, blobId: mem.blobId, text, pick });
  } catch (e) {
    return NextResponse.json({ error: 'Could not save your call right now. Try again.', detail: String((e as Error).message).slice(0, 160) }, { status: 502 });
  }
}
