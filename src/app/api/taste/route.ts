import { NextResponse } from 'next/server';
import { fanNamespace, recall } from '@/lib/memory';
import { tasteFrom } from '@/lib/taste';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const fanId = new URL(req.url).searchParams.get('fanId') || '';
  if (!fanId) return NextResponse.json({ error: 'Missing fan id.' }, { status: 400 });
  try {
    const ns = fanNamespace(fanId);
    const reactions = (await recall('reactions to Ronaldo moments', ns, 30)).map((r) => r.text).filter((t) => t.startsWith('REACTION'));
    const calls = (await recall('calls for the next match', ns, 10)).map((r) => r.text).filter((t) => t.startsWith('CALL'));
    return NextResponse.json({ taste: tasteFrom(reactions), calls });
  } catch (e) {
    return NextResponse.json({ taste: tasteFrom([]), calls: [], degraded: true });
  }
}
