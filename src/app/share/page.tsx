'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFan } from '@/components/Fan';
import { CAREER_GOALS } from '@/lib/data';

type Last = { pick: string; cp: string; goal: number };

export default function SharePage() {
  const { theme } = useFan();
  const [last, setLast] = useState<Last | null>(null);
  const [who, setWho] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('elbicho.lastCall');
      if (raw) setLast(JSON.parse(raw));
      setWho(localStorage.getItem('elbicho.handle') || '');
    } catch { /* none yet */ }
  }, []);

  if (!last) {
    return (
      <section className="wrap" style={{ maxWidth: 640, paddingTop: 8 }}>
        <h1 className="display" style={{ fontSize: 'clamp(40px,8vw,72px)', margin: 0 }}>NO CALL YET</h1>
        <p className="muted">Lock a call for his next match first. Your share card is built from it.</p>
        <Link className="btn" href="/call">Make your call</Link>
      </section>
    );
  }

  const handle = who ? '@' + who.replace(/^@/, '') : 'a fan';
  const src = `/api/share?g=${last.goal}&pick=${encodeURIComponent(last.pick)}&cp=${last.cp}&who=${encodeURIComponent(handle)}&theme=${theme}`;

  async function share() {
    try {
      const blob = await (await fetch(src)).blob();
      const file = new File([blob], 'el-bicho-call.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `I called goal #${last!.goal} on El Bicho` });
        setNote('');
        return;
      }
    } catch { /* fall through to download */ }
    const a = document.createElement('a');
    a.href = src;
    a.download = 'el-bicho-call.png';
    a.click();
    setNote('Saved. Post it on X or WhatsApp.');
  }

  return (
    <section className="wrap" style={{ maxWidth: 760, paddingTop: 8, paddingBottom: 24 }}>
      <div className="eyebrow" style={{ color: 'var(--accent2)' }}>Your share card</div>
      <h1 className="display" style={{ fontSize: 'clamp(40px,8vw,72px)', margin: '6px 0 14px', lineHeight: 0.95 }}>I CALLED #{last.goal}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, alignItems: 'start' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={`Share card: I called goal ${last.goal}, ${last.pick}`} style={{ width: '100%', maxWidth: 340, borderRadius: 24, border: '1px solid var(--line)' }} />
        <div className="card">
          <label className="eyebrow" htmlFor="who">Your handle on the card</label>
          <input id="who" value={who} onChange={(e) => { setWho(e.target.value); try { localStorage.setItem('elbicho.handle', e.target.value); } catch { /* private mode */ } }} maxLength={24} placeholder="yourhandle" style={{ width: '100%', minHeight: 48, margin: '6px 0 14px', borderRadius: 14, border: '1px solid var(--line)', background: 'var(--digit)', color: 'var(--ink)', padding: '0 14px', font: 'inherit' }} />
          <button className="btn" style={{ width: '100%', minHeight: 52 }} onClick={share}>Share or save the card</button>
          {note && <p role="status" className="muted" style={{ fontSize: 13 }}>{note}</p>}
          <p className="muted" style={{ fontSize: 13, marginBottom: 0 }}>The card shows your pick and the Sui checkpoint it was stamped at, so nobody can say you called it after the fact. He is on {CAREER_GOALS}.</p>
        </div>
      </div>
    </section>
  );
}
