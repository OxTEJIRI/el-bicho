'use client';

import { useRef, useState } from 'react';
import { useFan } from '@/components/Fan';

type Msg = { role: 'me' | 'bicho'; text: string; sources?: string[] };
const SUGGESTIONS = ['When will he hit 1,000?', 'Will he score next match?', 'How many goals against Al Ahli?', "What's my taste?", 'What did I react to?', 'How many goals for each club?'];

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
    <section className="wrap page ask">
      <header className="page-head">
        <p className="kicker">Ask El Bicho</p>
        <h1 className="display page-title">Ask anything</h1>
        <p className="lede">His goals, his form, the Oracle, or your own memories. Every answer names its source.</p>
      </header>
      <div className="chat" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={'msg ' + m.role}>
            {m.role === 'bicho' && <span className="msg-avatar display" aria-hidden="true">EB</span>}
            <div className="msg-body">
              <div className="bubble">{m.text}</div>
              {m.sources && m.sources.length > 0 && (
                <div className="sources">{m.sources.map((s) => <span key={s}>{s}</span>)}</div>
              )}
            </div>
          </div>
        ))}
        {busy && <div className="msg bicho"><span className="msg-avatar display" aria-hidden="true">EB</span><div className="bubble typing"><i /><i /><i /></div></div>}
        <div ref={end} />
      </div>
      <div className="ask-dock">
        <div className="suggest">
          {SUGGESTIONS.map((s) => <button key={s} className="chip" onClick={() => send(s)} disabled={busy}>{s}</button>)}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); void send(q); }} className="ask-form">
          <label className="sr-only" htmlFor="ask">Ask a question</label>
          <input id="ask" value={q} onChange={(e) => setQ(e.target.value)} maxLength={200} placeholder="Ask about any goal, or your memories" autoComplete="off" />
          <button className="btn" type="submit" disabled={busy || !q.trim()} aria-label="Send">Ask</button>
        </form>
      </div>
    </section>
  );
}
