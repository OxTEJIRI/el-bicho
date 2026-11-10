import { NextResponse } from 'next/server';
import { recall } from '@/lib/memory';
import { MATCHES, backtest, calibrate, forecast1000, pScore, reasons } from '@/lib/oracle';
import { CAREER_GOALS, TARGET } from '@/lib/data';

export const runtime = 'nodejs';
export const maxDuration = 60;

// The Oracle recalls its own calibration lesson from Walrus Memory before it makes a call.
// If memory is unreachable it falls back to the raw forecast and says so.
export async function GET() {
  const bt = backtest();
  const raw = pScore(MATCHES);
  let shrink = 1;
  let source: { blobId: string; asof: string } | null = null;
  try {
    const found = await recall('oracle calibration shrink lesson', 'elbicho-oracle', 10);
    const cal = found
      .filter((r) => r.text.startsWith('ORACLE · calibration'))
      .map((r) => ({ r, asof: /asof=(\d{4}-\d{2}-\d{2})/.exec(r.text)?.[1] ?? '', s: Number(/shrink=([0-9.]+)/.exec(r.text)?.[1]) }))
      .filter((x) => x.asof && Number.isFinite(x.s))
      .sort((a, b) => b.asof.localeCompare(a.asof))[0];
    if (cal) { shrink = cal.s; source = { blobId: cal.r.blobId, asof: cal.asof }; }
  } catch { /* fall back below */ }

  const p = calibrate(raw, shrink);
  return NextResponse.json({
    raw,
    shrink,
    p,
    fromMemory: !!source,
    source,
    call: p >= 0.5 ? 'Scores' : 'Blanks',
    reasons: reasons(),
    backtest: {
      matches: bt.matches, trainMatches: bt.trainMatches, testMatches: bt.testMatches, shrink: bt.shrink,
      test: bt.test, rolling: bt.rolling, worstMiss: bt.worstMiss,
    },
    forecast: forecast1000(TARGET - CAREER_GOALS),
    log: { matches: MATCHES.length, from: MATCHES[0].date, to: MATCHES[MATCHES.length - 1].date },
  });
}
