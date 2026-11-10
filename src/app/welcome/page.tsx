'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFan } from '@/components/Fan';
import { THEMES, THEME_KEYS } from '@/lib/themes';

const ERAS: [string, string][] = [['Sporting', '2002-03'], ['United', 'the rise'], ['Madrid', '450 goals'], ['Juventus', 'Serie A'], ['Portugal', 'the captain'], ['Al Nassr', 'road to 1,000']];
const KINDS = ['Free kicks', 'Headers', 'Bicycle kicks', 'Solo runs', 'Penalties', 'Last-minute winners', 'Long shots', 'Hat-tricks'];

function Chip({ on, label, sub, onClick }: { on: boolean; label: string; sub?: string; onClick: () => void }) {
  return (
    <button className="chip" aria-pressed={on} onClick={onClick} style={{ minHeight: 56, textAlign: 'left', padding: '8px 16px' }}>
      {label}
      {sub && (<><br /><span style={{ fontWeight: 500, fontSize: 12, opacity: 0.8 }}>{sub}</span></>)}
    </button>
  );
}

export default function Welcome() {
  const { fanId, theme, setTheme } = useFan();
  const [step, setStep] = useState(0);
  const [eras, setEras] = useState<string[]>([]);
  const [kinds, setKinds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  async function finish() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/profile', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fanId, eras, kinds }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      try { localStorage.setItem('elbicho.profiled', '1'); } catch { /* private mode */ }
      setDone(true);
    } catch (e) {
      setError((e as Error).message || 'Try again.');
    } finally {
      setBusy(false);
    }
  }

  const title = { fontSize: 'clamp(40px,8vw,68px)', margin: 0, lineHeight: 0.95 } as const;
  const next = { width: '100%', minHeight: 54, marginTop: 18 } as const;

  return (
    <section className="wrap" style={{ maxWidth: 640, paddingTop: 8, paddingBottom: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 18 }} aria-hidden="true">
        {[0, 1, 2].map((i) => <div key={i} style={{ height: 4, borderRadius: 2, background: i <= step || done ? 'var(--accent)' : 'var(--line)' }} />)}
      </div>

      {done ? (
        <div className="card" style={{ background: 'var(--accent)', color: 'var(--on-accent)', border: 0 }}>
          <div className="eyebrow" style={{ color: 'inherit', opacity: 0.85 }}>El Bicho remembers you</div>
          <div className="display" style={{ fontSize: 40, lineHeight: 1.02, marginTop: 8 }}>{(eras[0] ?? 'Every').toUpperCase()} ERA. {(kinds[0] ?? 'Every goal').toUpperCase()}.</div>
          <p style={{ margin: '10px 0 16px', opacity: 0.92 }}>Saved to your memory on Walrus. It sharpens with every reaction and call.</p>
          <Link className="btn" href="/relive" style={{ background: 'var(--on-accent)', color: 'var(--accent)' }}>Enter Relive</Link>
        </div>
      ) : step === 0 ? (
        <>
          <h1 className="display" style={title}>WHICH RONALDO IS YOURS?</h1>
          <p className="muted">Pick as many as you like.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {ERAS.map(([e, s]) => <Chip key={e} on={eras.includes(e)} label={e} sub={s} onClick={() => toggle(eras, setEras, e)} />)}
          </div>
          <button className="btn" style={next} onClick={() => setStep(1)}>Next</button>
        </>
      ) : step === 1 ? (
        <>
          <h1 className="display" style={title}>THE GOALS YOU LIVE FOR</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
            {KINDS.map((k) => <Chip key={k} on={kinds.includes(k)} label={k} onClick={() => toggle(kinds, setKinds, k)} />)}
          </div>
          <button className="btn" style={next} onClick={() => setStep(2)}>Next</button>
        </>
      ) : (
        <>
          <h1 className="display" style={title}>PICK YOUR KIT</h1>
          <p className="muted">The whole app wears it. Change it any time.</p>
          <div style={{ display: 'grid', gap: 10 }}>
            {THEME_KEYS.map((k) => (
              <button key={k} className="chip" aria-pressed={theme === k} onClick={() => setTheme(k)} style={{ minHeight: 60, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                <span style={{ width: 30, height: 30, borderRadius: '50%', background: THEMES[k].swatch, border: '1px solid var(--line)' }} />
                {THEMES[k].label}
                <span style={{ marginLeft: 'auto', fontWeight: 500, opacity: 0.8 }}>{THEMES[k].kit}</span>
              </button>
            ))}
          </div>
          <button className="btn" style={next} onClick={finish} disabled={busy || !fanId || (!eras.length && !kinds.length)}>{busy ? 'Saving to Walrus…' : 'Build my El Bicho'}</button>
          {!eras.length && !kinds.length && <p className="muted" style={{ fontSize: 13 }}>Go back and pick at least one era or goal type.</p>}
          {error && <p role="alert" style={{ color: 'var(--accent2)', fontWeight: 700 }}>{error}</p>}
        </>
      )}
    </section>
  );
}
