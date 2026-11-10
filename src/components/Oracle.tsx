'use client';

import { useEffect, useState } from 'react';

export type OracleData = {
  raw: number; shrink: number; p: number; fromMemory: boolean; source: { blobId: string; asof: string } | null; call: string; reasons: string[];
  backtest: { matches: number; trainMatches: number; testMatches: number; shrink: number; test: { brierCoin: number; brierRaw: number; brierLearned: number; hitLearned: number }; rolling: { date: string; learned: number; coin: number; raw: number }[]; worstMiss: { date: string; opponent: string; p: number; scored: boolean }[] };
  forecast: { remaining: number; goalsPerMatch: number; matchesPerWeek: number; p10: string; p50: string; p90: string; asOf: string };
  log: { matches: number; from: string; to: string };
};

export function useOracle() {
  const [data, setData] = useState<OracleData | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    fetch('/api/oracle').then((r) => r.json()).then(setData).catch(() => setError(true));
  }, []);
  return { data, error };
}

const month = (iso: string) => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });

export function OracleCard({ data, error }: { data: OracleData | null; error: boolean }) {
  return (
    <div className="card" style={{ background: 'var(--accent)', color: 'var(--on-accent)', border: 0 }}>
      <div className="eyebrow" style={{ color: 'inherit', opacity: .85 }}>The Oracle · El Bicho&apos;s own call</div>
      {!data ? (
        <div className="display" style={{ fontSize: 30, marginTop: 8 }}>{error ? 'OFFLINE' : 'RECALLING…'}</div>
      ) : (
        <>
          <div className="display" style={{ fontSize: 40, lineHeight: 1, marginTop: 8 }}>{data.call.toUpperCase()} · {Math.round(data.p * 100)}%</div>
          <p style={{ margin: '8px 0 0', fontSize: 14, opacity: .92 }}>
            {data.fromMemory
              ? `Recalled from Walrus memory (${data.source?.asof}): its raw forecast was overconfident, so it pulls ${Math.round(data.raw * 100)}% toward 50/50 and says ${Math.round(data.p * 100)}%.`
              : 'Memory is unreachable right now, so this is the raw forecast.'}
          </p>
          <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 13, opacity: .92 }}>
            {data.reasons.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}

export function ForecastCard({ data }: { data: OracleData | null }) {
  return (
    <div className="card">
      <div className="eyebrow">Goal 1,000 forecast</div>
      {!data ? <div className="display" style={{ fontSize: 34, marginTop: 8 }}>…</div> : (
        <>
          <div className="display" style={{ fontSize: 'clamp(34px,6vw,56px)', lineHeight: 1, marginTop: 8, color: 'var(--accent)' }}>{month(data.forecast.p50).toUpperCase()}</div>
          <p className="muted" style={{ margin: '6px 0 0', fontSize: 14 }}>
            Likely range {month(data.forecast.p10)} to {month(data.forecast.p90)}. Based on {data.forecast.goalsPerMatch.toFixed(2)} goals per match over his last 25 Al Nassr games and about {data.forecast.matchesPerWeek.toFixed(1)} matches a week. It assumes he plays for Al Nassr only.
          </p>
        </>
      )}
    </div>
  );
}

export function Replay({ data }: { data: OracleData }) {
  const b = data.backtest;
  const pts = b.rolling;
  const W = 600, H = 150, lo = 0.18, hi = 0.34;
  const x = (i: number) => (i / Math.max(1, pts.length - 1)) * W;
  const y = (v: number) => H - ((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * H;
  const path = (k: 'learned' | 'raw') => pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p[k]).toFixed(1)}`).join(' ');
  const row = (label: string, v: number, strong?: boolean) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line)', fontWeight: strong ? 800 : 600 }}>
      <span>{label}</span><span className="display" style={{ fontSize: 22, color: strong ? 'var(--accent)' : 'var(--ink)' }}>{v.toFixed(3)}</span>
    </div>
  );
  return (
    <div className="card">
      <div className="eyebrow">What if it knew? · replay of {b.testMatches} matches it had not seen</div>
      <p className="muted" style={{ margin: '6px 0 12px', fontSize: 14 }}>
        El Bicho learned from his first {b.trainMatches} matches, kept one lesson in Walrus memory, then forecast the next {b.testMatches} using only games played before each one. Error score (lower is better):
      </p>
      {row('A coin flip (always 50%)', b.test.brierCoin)}
      {row('Oracle with no memory', b.test.brierRaw)}
      {row('Oracle with its memory', b.test.brierLearned, true)}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="150" role="img" aria-label="Rolling error score of the Oracle with and without memory" style={{ display: 'block', marginTop: 14 }}>
        <line x1="0" x2={W} y1={y(0.25)} y2={y(0.25)} stroke="var(--line)" strokeDasharray="4 4" />
        <path d={path('raw')} fill="none" stroke="var(--sub)" strokeWidth="2" />
        <path d={path('learned')} fill="none" stroke="var(--accent)" strokeWidth="3" />
      </svg>
      <div className="muted" style={{ fontSize: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <span><b style={{ color: 'var(--accent)' }}>━</b> with memory</span><span>━ no memory</span><span>┄ coin flip (0.250)</span>
      </div>
      <p style={{ margin: '12px 0 0', fontSize: 14 }}>
        <b>Honest read:</b> scoring is close to a coin flip, and the memory only helps a little. Its one lesson, shrinking its forecasts by {b.shrink}, makes it humble enough to edge past the coin flip. Right on {Math.round(b.test.hitLearned * 100)}% of matches.
      </p>
      <p className="muted" style={{ margin: '8px 0 0', fontSize: 12 }}>Data: ESPN public game log, {data.log.matches} matches, {data.log.from} to {data.log.to}. The log is incomplete, so it is used for scoring rates only.</p>
    </div>
  );
}
