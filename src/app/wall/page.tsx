'use client';

import { useEffect, useState } from 'react';
import { CAREER_GOALS, TARGET } from '@/lib/data';

export default function WallPage() {
  const [count, setCount] = useState<number | null>(null);
  const [capped, setCapped] = useState(false);
  const [handle, setHandle] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/wall').then((r) => r.json()).then((d) => { setCount(d.count); setCapped(!!d.capped); }).catch(() => {});
  }, []);

  async function send() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/wall', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ handle, message }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(message);
      setMessage('');
      setCount((c) => (c ?? 0) + 1);
    } catch (e) {
      setError((e as Error).message || 'Try again.');
    } finally {
      setBusy(false);
    }
  }

  const field = { width: '100%', borderRadius: 14, border: '1px solid var(--line)', background: 'var(--digit)', color: 'var(--ink)', font: 'inherit' } as const;

  return (
    <section className="wrap" style={{ maxWidth: 760, paddingTop: 8, paddingBottom: 24 }}>
      <div className="eyebrow" style={{ color: 'var(--accent2)' }}>The 1,000 Wall</div>
      <h1 className="display" style={{ fontSize: 'clamp(40px,8vw,80px)', margin: '6px 0 6px', lineHeight: 0.95 }}>LEAVE HIM A MESSAGE</h1>
      <p className="muted" style={{ margin: '0 0 16px' }}>Messages are sealed in Walrus memory. They open together the moment he scores goal {TARGET}. He is on {CAREER_GOALS}.</p>

      <div className="card" style={{ background: 'var(--accent)', color: 'var(--on-accent)', border: 0, marginBottom: 14 }}>
        <div className="eyebrow" style={{ color: 'inherit', opacity: 0.85 }}>Sealed until goal {TARGET}</div>
        <div className="display" style={{ fontSize: 64, lineHeight: 1 }}>{count === null ? '…' : `${count}${capped ? '+' : ''}`}</div>
        <div style={{ fontSize: 14, opacity: 0.9 }}>{count === 1 ? 'message' : 'messages'} waiting</div>
      </div>

      {sent ? (
        <div className="card" style={{ borderColor: 'var(--accent)' }}>
          <div className="eyebrow" style={{ color: 'var(--accent2)' }}>Sealed</div>
          <p style={{ fontSize: 18, margin: '8px 0' }}>&ldquo;{sent}&rdquo;</p>
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>Saved to Walrus memory. It stays hidden until goal {TARGET}.</p>
          <button className="btn ghost" style={{ marginTop: 12 }} onClick={() => setSent(null)}>Write another</button>
        </div>
      ) : (
        <div className="card">
          <label className="eyebrow" htmlFor="h">Your name (optional)</label>
          <input id="h" value={handle} onChange={(e) => setHandle(e.target.value)} maxLength={24} style={{ ...field, minHeight: 48, margin: '6px 0 14px', padding: '0 14px' }} />
          <label className="eyebrow" htmlFor="m">Your message</label>
          <textarea id="m" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={200} rows={3} placeholder="Thank you for every Sunday morning I woke up early to watch you." style={{ ...field, margin: '6px 0 6px', padding: 14 }} />
          <div className="muted" style={{ fontSize: 12, textAlign: 'right' }}>{message.length}/200</div>
          <button className="btn" style={{ width: '100%', minHeight: 54, marginTop: 8 }} onClick={send} disabled={busy || message.trim().length < 3}>{busy ? 'Sealing in Walrus…' : 'Seal my message'}</button>
          {error && <p role="alert" style={{ color: 'var(--accent2)', fontWeight: 700, marginBottom: 0 }}>{error}</p>}
        </div>
      )}
    </section>
  );
}
