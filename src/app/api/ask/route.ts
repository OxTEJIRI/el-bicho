import { NextResponse } from 'next/server';
import { ask } from '@/lib/ask';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const q = typeof body?.q === 'string' ? body.q.trim().slice(0, 200) : '';
  const fanId = typeof body?.fanId === 'string' ? body.fanId : '';
  if (!q) return NextResponse.json({ error: 'Ask me something about his goals, his form, or your memories.' }, { status: 400 });
  try {
    return NextResponse.json(await ask(q, fanId));
  } catch (e) {
    return NextResponse.json({ error: 'I could not answer that right now. Try again.', detail: String((e as Error).message).slice(0, 120) }, { status: 502 });
  }
}
