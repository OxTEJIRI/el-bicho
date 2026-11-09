'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useFan } from '@/components/Fan';
import { Reactions, type Taste } from '@/components/Reactions';
import { CAREER_GOALS, MOMENTS, NEXT_MATCH, TARGET } from '@/lib/data';
import { THEMES } from '@/lib/themes';

export default function Home() {
  const { theme, fanId } = useFan();
  const t = THEMES[theme];
  const [n, setN] = useState(CAREER_GOALS - 45);
  const [taste, setTaste] = useState<Taste | null>(null);

  useEffect(() => {
    if (n >= CAREER_GOALS) return;
    const id = setTimeout(() => setN((v) => v + 1), 28);
    return () => clearTimeout(id);
  }, [n]);

  useEffect(() => {
    if (!fanId) return;
    fetch('/api/taste?fanId=' + fanId).then((r) => r.json()).then((d) => setTaste(d.taste)).catch(() => {});
  }, [fanId]);

  const picks = useMemo(() => {
    if (!taste?.picks?.length) return MOMENTS;
    return taste.picks.map((id) => MOMENTS.find((m) => m.id === id)!).filter(Boolean);
  }, [taste]);

  const slots = Array.from({ length: TARGET - CAREER_GOALS }, (_, i) => CAREER_GOALS + 1 + i);
  const onThisDay = MOMENTS[0];

  return (
    <>
      <section className="wrap" style={{ paddingTop: 0 }}>
        <div className="hero" style={{ borderRadius: 24 }}>
          <img className="photo" src={t.photo} alt={`Cristiano Ronaldo in the ${t.kit} shirt`} style={{ objectPosition: t.pos }} />
          <div className="display seven" aria-hidden="true">7</div>
          <div className="scrim" />
          <div className="inner">
            <span className="live"><i />ROAD TO 1,000</span>
            <div className="digits" aria-label={`${CAREER_GOALS} of ${TARGET} career goals`}>
              {String(n).split('').map((d, i) => <div key={i} className="digit display">{d}</div>)}
              <div style={{ paddingBottom: 10, marginLeft: 4 }}>
                <div className="display muted" style={{ fontSize: 'clamp(26px,4vw,52px)', lineHeight: 1 }}>/{TARGET}</div>
                <div style={{ fontSize: 13, fontWeight: 800, marginTop: 4 }}>career goals</div>
              </div>
            </div>
            <div className="slots">
              {slots.map((g) => <div key={g} className={'slot' + (g === CAREER_GOALS + 1 ? ' next' : g === TARGET ? ' goal' : '')}>{g}</div>)}
            </div>
            <p className="muted" style={{ fontSize: 15, margin: '12px 0 0' }}><strong style={{ color: 'var(--ink)' }}>Goal {CAREER_GOALS + 1} is next.</strong> Each box lights up when he scores it.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
              <Link className="btn" href="/call">Call the next match</Link>
              <Link className="btn ghost" href="/relive">Relive the greatest</Link>
            </div>
            <div className="credit" style={{ marginTop: 14 }}>Photo: {t.credit}</div>
          </div>
        </div>
      </section>

      <div className="ticker" style={{ marginTop: 18 }} aria-label="Road to 1,000">
        <div className="run">
          {[0, 1].map((k) => (
            <span key={k} style={{ display: 'inline-flex', gap: 28 }}>
              <span><b>{CAREER_GOALS}</b> career goals</span>
              <span><b>{TARGET - CAREER_GOALS}</b> to go</span>
              <span>Calls lock at kickoff · stamped on <b>Sui</b></span>
              <span>Your reactions live in <b>Walrus</b> memory</span>
              <span>Be the first to call goal <b>{CAREER_GOALS + 1}</b></span>
            </span>
          ))}
        </div>
      </div>

      <section className="wrap split" style={{ marginTop: 18 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
            <span className="eyebrow">Next match</span>
            <span className="eyebrow" style={{ color: 'var(--accent2)' }}>Calls lock at kickoff</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 12 }}>
            <span className="display" style={{ fontSize: 'clamp(26px,4vw,48px)' }}>{NEXT_MATCH.home.toUpperCase()}</span>
            <span className="muted" style={{ fontWeight: 800 }}>vs</span>
            <span className="display muted" style={{ fontSize: 'clamp(26px,4vw,48px)' }}>{NEXT_MATCH.away?.toUpperCase() ?? 'TBC'}</span>
          </div>
          <p className="muted" style={{ margin: '8px 0 0' }}>{NEXT_MATCH.kickoff ? new Date(NEXT_MATCH.kickoff).toUTCString() : 'Fixture confirmed after the international break.'}</p>
          <Link className="btn" href="/call" style={{ marginTop: 14, width: '100%' }}>Make your call</Link>
        </div>
        <div className="card" style={{ background: 'var(--accent)', color: 'var(--on-accent)', border: 0 }}>
          <div className="eyebrow" style={{ color: 'inherit', opacity: .85 }}>Your Ronaldo</div>
          <div className="display" style={{ fontSize: 30, lineHeight: 1.05, marginTop: 8 }}>{taste?.profile ?? 'React to a moment to start.'}</div>
          <p style={{ margin: '8px 0 0', fontSize: 14, opacity: .9 }}>Learned from your reactions, kept in your Walrus memory, so it follows you anywhere.</p>
        </div>
      </section>

      <section className="wrap" style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <h2 className="display" style={{ margin: 0, fontSize: 30 }}>PICKED FOR YOU</h2>
          <Link href="/relive" style={{ fontWeight: 800, color: 'var(--accent2)', textDecoration: 'none' }}>See all</Link>
        </div>
        <div className="picks">
          {picks.map((m) => (
            <Link key={m.id} href={`/relive#${m.id}`} className="pick">
              <img src={THEMES[m.theme].photo} alt="" aria-hidden="true" style={{ objectPosition: THEMES[m.theme].pos }} />
              <div className="shade" />
              <div className="txt">
                <div className="eyebrow" style={{ color: 'var(--accent2)' }}>{m.tag}</div>
                <div className="display" style={{ fontSize: 24, lineHeight: 1.02, marginTop: 4 }}>{m.title}</div>
                <div style={{ fontSize: 12, opacity: .8, marginTop: 4 }}>{m.meta}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap" style={{ marginTop: 22 }}>
        <div className="card">
          <div className="eyebrow">Relive · react to teach El Bicho</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 6 }}>{onThisDay.title} · {onThisDay.meta}</div>
          <Reactions momentId={onThisDay.id} onTaste={setTaste} />
        </div>
      </section>
    </>
  );
}
