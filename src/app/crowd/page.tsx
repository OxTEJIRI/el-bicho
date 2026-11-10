'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Crowd = {
  total: number | null; scores: number; blanks: number;
  how: Record<string, number>; when: Record<string, number>;
  latest: { fan: string; checkpoint: string; acceptedAt: string | null; scores: boolean; how: string | null; when: string | null }[];
};

export default function CrowdPage() {
  const [c, setC] = useState<Crowd | null>(null);
  useEffect(() => { fetch('/api/crowd').then((r) => r.json()).then(setC).catch(() => {}); }, []);
  const total = c?.total ?? 0;
  const pct = total && c ? Math.round((c.scores / total) * 100) : 0;
  const bars = (o: Record<string, number>) => Object.entries(o).sort((a, b) => b[1] - a[1]);

  return (
    <section className="wrap" style={{ maxWidth: 760, paddingTop: 8, paddingBottom: 24 }}>
      <div className="eyebrow" style={{ color: 'var(--accent2)' }}>The crowd</div>
      <h1 className="display" style={{ fontSize: 'clamp(40px,8vw,72px)', margin: '6px 0 14px', lineHeight: 0.95 }}>WHAT FANS CALLED</h1>
      {!c ? (
        <p className="muted">Reading the calls from Walrus…</p>
      ) : c.total === null ? (
        <p className="muted">The call board is unreachable right now.</p>
      ) : total === 0 ? (
        <div className="card"><p style={{ margin: 0 }}>No calls yet. Be the first to call his next match. <Link href="/call" style={{ color: 'var(--accent2)', fontWeight: 800 }}>Call it</Link>.</p></div>
      ) : (
        <>
          <div className="card" style={{ background: 'var(--accent)', color: 'var(--on-accent)', border: 0 }}>
            <div className="eyebrow" style={{ color: 'inherit', opacity: 0.85 }}>{total} {total === 1 ? 'call' : 'calls'} for his next match</div>
            <div className="display" style={{ fontSize: 64, lineHeight: 1 }}>{pct}%</div>
            <div style={{ opacity: 0.92 }}>say he scores · {c.blanks} say he blanks</div>
          </div>
          <div className="split" style={{ marginTop: 14, gap: 14 }}>
            {([['How they think he scores', c.how], ['When', c.when]] as const).map(([title, o]) => (
              <div key={title} className="card">
                <div className="eyebrow">{title}</div>
                {bars(o).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                    <span style={{ width: 90, fontWeight: 700, fontSize: 14 }}>{k}</span>
                    <span style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--line)', overflow: 'hidden' }}>
                      <span style={{ display: 'block', height: '100%', width: `${(v / Math.max(1, c.scores)) * 100}%`, background: 'var(--accent)' }} />
                    </span>
                    <span className="display" style={{ fontSize: 20 }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="card" style={{ marginTop: 14 }}>
            <div className="eyebrow">Latest calls · server accepted before kickoff</div>
            {c.latest.map((l, i) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--line)', fontSize: 14 }}>
                <b>Fan {l.fan}</b> · {l.scores ? `scores · ${l.how} · ${l.when}` : 'blanks'}{' '}
                <span className="muted">· {l.acceptedAt ? `accepted ${new Date(l.acceptedAt).toUTCString()}` : 'acceptance time unavailable'} · checkpoint reference {l.checkpoint}</span>
              </div>
            ))}
          </div>
          <p className="muted" style={{ fontSize: 13 }}>The server closes calls at kickoff. Checkpoint references are context; they do not prove a call was written on-chain.</p>
        </>
      )}
    </section>
  );
}
