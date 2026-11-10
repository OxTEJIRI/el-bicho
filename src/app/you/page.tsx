'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFan } from '@/components/Fan';
import { THEMES, THEME_KEYS } from '@/lib/themes';
import type { Taste } from '@/components/Reactions';

export default function YouPage() {
  const { fanId, theme, setTheme } = useFan();
  const [taste, setTaste] = useState<Taste | null>(null);
  const [calls, setCalls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fanId) return;
    fetch('/api/taste?fanId=' + fanId)
      .then((r) => r.json())
      .then((d) => { setTaste(d.taste); setCalls(d.calls ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [fanId]);

  const n = taste?.reactions ?? 0;
  const rank = n >= 20 ? 'Captain' : n >= 10 ? 'First team' : n >= 3 ? 'Reserves' : 'Academy';
  const cp = (c: string) => /checkpoint_observed=(\d+)/.exec(c)?.[1] ?? /locked_at_checkpoint=(\d+)/.exec(c)?.[1];
  const acceptedAt = (c: string) => /accepted_at_server=([^ ·]+)/.exec(c)?.[1];
  const pick = (c: string) => c.split(' · ').slice(2).filter((part) => !/^(accepted_at_server|checkpoint_observed|checkpoint_time|locked_at_checkpoint)=/.test(part)).join(', ').replace(/how=|when=/g, '');

  return (
    <section className="wrap" style={{ maxWidth: 760, paddingTop: 8, paddingBottom: 24 }}>
      <div className="eyebrow" style={{ color: 'var(--accent2)' }}>You</div>
      <h1 className="display" style={{ fontSize: 'clamp(40px,8vw,72px)', margin: '6px 0 14px', lineHeight: 0.95 }}>{rank.toUpperCase()}</h1>
      <div className="card" style={{ background: 'var(--accent)', color: 'var(--on-accent)', border: 0 }}>
        <div className="eyebrow" style={{ color: 'inherit', opacity: 0.85 }}>Your Ronaldo · learned from {n} memories</div>
        <div className="display" style={{ fontSize: 34, lineHeight: 1.05, marginTop: 6 }}>{loading ? 'RECALLING…' : taste?.profile ?? 'NOT LEARNED YET'}</div>
        <p style={{ margin: '8px 0 0', fontSize: 14, opacity: 0.92 }}>Kept in your Walrus memory account, so it follows you to any app that reads it. Rank grows with your reactions: Academy, Reserves, First team, Captain.</p>
        {!taste?.profile && <Link className="btn" href="/welcome" style={{ background: 'var(--on-accent)', color: 'var(--accent)', marginTop: 12 }}>Take the 30-second quiz</Link>}
      </div>

      <h2 className="display" style={{ fontSize: 30, margin: '24px 0 10px' }}>YOUR CALLS</h2>
      <div className="card">
        {calls.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>No calls yet. <Link href="/call" style={{ color: 'var(--accent2)', fontWeight: 800 }}>Make one</Link>.</p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
            {calls.map((c, i) => (
              <li key={i} style={{ fontSize: 14, paddingBottom: 10, borderBottom: i < calls.length - 1 ? '1px solid var(--line)' : 0 }}>
                <b>{pick(c)}</b> · {c.split(' · ')[1]?.replace('match=', '')}<br />
                <span className="muted">{acceptedAt(c) ? `Server accepted ${new Date(acceptedAt(c)!).toUTCString()}` : 'Earlier call · acceptance time unavailable'} · checkpoint reference {cp(c) ?? 'unavailable'}</span>{' '}
                {cp(c) && <a href={`https://suiscan.xyz/mainnet/checkpoint/${cp(c)}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent2)' }}>view context</a>}
              </li>
            ))}
          </ul>
        )}
        {calls.length > 0 && <Link className="btn ghost" href="/share" style={{ marginTop: 14 }}>Make a share card</Link>}
      </div>

      <h2 className="display" style={{ fontSize: 30, margin: '24px 0 10px' }}>YOUR KIT</h2>
      <div className="kits" role="group" aria-label="Kit theme" style={{ display: 'inline-flex' }}>
        {THEME_KEYS.map((k) => (
          <button key={k} className="kit" aria-pressed={theme === k} onClick={() => setTheme(k)} aria-label={`${THEMES[k].label} kit`} style={{ paddingRight: 12 }}>
            <span className="dot" style={{ background: THEMES[k].swatch }} />
            <span style={{ fontWeight: 700 }}>{THEMES[k].label}</span>
          </button>
        ))}
      </div>
      <p style={{ marginTop: 18 }}>
        <a href="https://memory.walrus.xyz/dashboard" target="_blank" rel="noreferrer" style={{ color: 'var(--accent2)', fontWeight: 800 }}>Open the Walrus Memory dashboard</a>{' '}
        <span className="muted">to see and manage the memory behind all this.</span>
      </p>
    </section>
  );
}
