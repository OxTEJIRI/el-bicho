'use client';

import { useRef, useState } from 'react';
import { useFan } from '@/components/Fan';

type Msg = { role: 'me' | 'bicho'; text: string; sources?: string[] };
const SUGGESTIONS = ['When will he hit 1,000?', 'Will he score next match?', 'How many goals against Al Hilal?', "What's my taste?", 'What did I react to?', 'How many goals for each club?'];

export default function AskPage() {
  const { fanId } = useFan();
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'bicho', text: "Ask me about his goals, his form, my forecast, or your own memories. I only answer from sources I can name, and I'll say so when I can't." }]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    setMsgs((m) => [...m, { role: 'me', text: question }]);
    setQ('');
    setBusy(true);
    try {
      const res = await fetch('/api/ask', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ q: question, fanId }) });
      const data = await res.json();
      setMsgs((m) => [...m, { role: 'bicho', text: data.answer ?? data.error ?? 'No answer.', sources: data.sources }]);
    } catch {
      setMsgs((m) => [...m, { role: 'bicho', text: 'I could not reach my sources. Try again.' }]);
    } finally {
      setBusy(false);
      setTimeout(() => end.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }

  return (
    <section className="wrap" style={{ maxWidth: 760, paddingTop: 8, paddingBottom: 24 }}>
      <div className="eyebrow" style={{ color: 'var(--accent2)' }}>Ask El Bicho</div>
      <h1 className="display" style={{ fontSize: 'clamp(40px,8vw,80px)', margin: '6px 0 14px', lineHeight: 0.95 }}>ASK ANYTHING</h1>
      <div className="card" style={{ display: 'grid', gap: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ justifySelf: m.role === 'me' ? 'end' : 'start', maxWidth: '88%' }}>
            <div style={{ background: m.role === 'me' ? 'var(--accent)' : 'var(--digit)', color: m.role === 'me' ? 'var(--on-accent)' : 'var(--ink)', borderRadius: m.role === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding: '10px 14px', lineHeight: 1.45 }}>{m.text}</div>
            {m.sources && m.sources.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {m.sources.map((s) => <span key={s} style={{ fontSize: 11, fontWeight: 700, border: '1px solid var(--line)', borderRadius: 999, padding: '3px 9px', color: 'var(--sub)' }}>{s}</span>)}
              </div>
            )}
          </div>
        ))}
        {busy && <div className="muted" style={{ fontSize: 14 }}>Checking my sources…</div>}
        <div ref={end} />
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 0' }}>
        {SUGGESTIONS.map((s) => <button key={s} className="chip" style={{ flex: 'none', minHeight: 40 }} onClick={() => send(s)}>{s}</button>)}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); void send(q); }} style={{ display: 'flex', gap: 8 }}>
        <label className="sr-only" htmlFor="ask">Ask a question</label>
        <input id="ask" value={q} onChange={(e) => setQ(e.target.value)} maxLength={200} placeholder="Ask about any goal, or your memories" style={{ flex: 1, minHeight: 52, borderRadius: 16, border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink)', padding: '0 16px', font: 'inherit' }} />
        <button className="btn" type="submit" disabled={busy || !q.trim()} style={{ minHeight: 52 }}>Ask</button>
      </form>
    </section>
  );
}
