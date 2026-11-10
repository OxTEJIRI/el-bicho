import { NextResponse } from 'next/server';
import { recall } from '@/lib/memory';

export const runtime = 'nodejs';
export const maxDuration = 60;

// What the crowd has called for the next match, read back from Walrus Memory.
export async function GET() {
  try {
    const rows = (await recall('crowd calls for the next match', 'elbicho-calls', 100)).filter((r) => r.text.startsWith('PUBLICCALL'));
    const parsed = rows.map((r) => {
      const t = r.text;
      return {
        fan: /fan=([^ ·]+)/.exec(t)?.[1] ?? '',
        checkpoint: /checkpoint_observed=(\d+)/.exec(t)?.[1] ?? /checkpoint=(\d+)/.exec(t)?.[1] ?? '',
        acceptedAt: /accepted_at_server=([^ ·]+)/.exec(t)?.[1] ?? null,
        scores: t.includes('scores'),
        how: /how=([^·]+?)(?: ·|$)/.exec(t)?.[1]?.trim() ?? null,
        when: /when=([^·]+?)(?: ·|$)/.exec(t)?.[1]?.trim() ?? null,
        blobId: r.blobId,
      };
    });
    const count = (k: 'how' | 'when') => parsed.reduce<Record<string, number>>((a, c) => { const v = c[k]; if (v) a[v] = (a[v] || 0) + 1; return a; }, {});
    const scores = parsed.filter((c) => c.scores).length;
    return NextResponse.json({ total: parsed.length, scores, blanks: parsed.length - scores, how: count('how'), when: count('when'), latest: parsed.slice(0, 8) });
  } catch {
    return NextResponse.json({ total: null });
  }
}
