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

export const verdict = (p: number) => (p >= 0.65 ? 'Backing him' : p >= 0.55 ? 'Leans goal' : p > 0.45 ? 'Toss-up' : p > 0.35 ? 'Leans blank' : 'Tough night');

// A half-dial from 0% to 100%: the needle is the Oracle's chance that he scores.
function Gauge({ p }: { p: number | null }) {
  const [shown, setShown] = useState(0);
  useEffect(() => { if (p !== null) { const id = requestAnimationFrame(() => setShown(p)); return () => cancelAnimationFrame(id); } }, [p]);
  const R = 90, cx = 110, cy = 104;
  const pt = (v: number, r = R) => { const a = Math.PI * (1 - v); return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; };
  const arc = (from: number, to: number) => { const [x1, y1] = pt(from); const [x2, y2] = pt(to); return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`; };
  const ticks = Array.from({ length: 21 }, (_, i) => i / 20);
  return (
    <svg viewBox="0 0 220 120" className="gauge" role="img" aria-label={p === null ? 'Loading the forecast' : `${Math.round(p * 100)}% chance he scores`}>
      <path d={arc(0, 1)} className="gauge-track" />
      <path d={arc(0.45, 0.55)} className="gauge-zone" />
      {p !== null && <path d={arc(0, Math.max(0.001, shown))} className="gauge-fill" />}
      {ticks.map((t, i) => { const major = i % 5 === 0; const [x1, y1] = pt(t, R - 16); const [x2, y2] = pt(t, major ? R - 28 : R - 22); return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} className={'gauge-tick' + (major ? ' major' : '')} />; })}
      <g className="gauge-needle" style={{ transform: `rotate(${-90 + shown * 180}deg)`, transformOrigin: `${cx}px ${cy}px` }}>
        <line x1={cx} y1={cy - R + 30} x2={cx} y2={cy - R - 8} />
      </g>
      <text x={cx - R} y={cy + 14} className="gauge-end">0</text>
      <text x={cx + R} y={cy + 14} className="gauge-end" textAnchor="end">100</text>
    </svg>
  );
}

export function OracleCard({ data, error, opponent }: { data: OracleData | null; error: boolean; opponent?: string }) {
  const p = data ? data.p : null;
  return (
    <div className="oracle">
      <div className="oracle-head">
        <span className="oracle-badge" aria-hidden="true">O</span>
        <div>
          <div className="oracle-title">The Oracle</div>
          <div className="oracle-sub">El Bicho&apos;s own call{opponent ? ` for ${opponent}` : ''}</div>
        </div>
      </div>
      <div className="oracle-dial">
        <Gauge p={p} />
        <div className="oracle-read">
          <span className="display oracle-pct">{p === null ? (error ? '--' : '··') : Math.round(p * 100)}<small>%</small></span>
          <span className="oracle-verdict">{p === null ? (error ? 'Offline' : 'Recalling memory') : verdict(p)}</span>
        </div>
      </div>
      <div className="oracle-split" aria-hidden={p === null}>
        <span><b>Scores</b> {p === null ? '--' : Math.round(p * 100) + '%'}</span>
        <span><b>Blanks</b> {p === null ? '--' : 100 - Math.round(p * 100) + '%'}</span>
      </div>
      {data && (
        <details className="oracle-why">
          <summary>How it decided</summary>
          <p>
            {data.fromMemory
              ? `It recalled its own lesson from Walrus memory (${data.source?.asof}): past forecasts were overconfident. So it pulled its raw ${Math.round(data.raw * 100)}% toward 50/50 and settled on ${Math.round(data.p * 100)}%.`
              : 'Memory is unreachable right now, so this is the raw forecast.'}
          </p>
          <ul>{data.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
        </details>
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
