'use client';

import { useState } from 'react';
import { useFan } from '@/components/Fan';
import { CAREER_GOALS, NEXT_MATCH } from '@/lib/data';

const HOW = ['Header', 'Left foot', 'Right foot', 'Penalty', 'Free kick'];
const WHEN = ['1st half', '2nd half'];

type Receipt = { checkpoint: { sequence: string; digest: string; time: string }; blobId: string; text: string };

export default function CallPage() {
  const { fanId } = useFan();
  const [score, setScore] = useState<'Yes' | 'No'>('Yes');
  const [how, setHow] = useState('Free kick');
  const [when, setWhen] = useState('2nd half');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  async function lock() {
    if (!fanId || busy) return;
    setBusy(true);
    setError('');
    try {
      const match = `${NEXT_MATCH.home}-vs-${NEXT_MATCH.away ?? 'TBC'}`.toLowerCase().replace(/\s+/g, '-');
      const res = await fetch('/api/call', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fanId, match, score, how, when }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReceipt(data);
    } catch (e) {
      setError((e as Error).message || 'Could not lock your call. Try again.');
    } finally {
      setBusy(false);
    }
  }

  const Group = ({ title, opts, value, set }: { title: string; opts: string[]; value: string; set: (v: string) => void }) => (
    <fieldset style={{ border: 0, margin: '0 0 16px', padding: 0 }}>
      <legend className="eyebrow" style={{ marginBottom: 8 }}>{title}</legend>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {opts.map((o) => <button key={o} className="chip" aria-pressed={value === o} onClick={() => set(o)}>{o}</button>)}
      </div>
    </fieldset>
  );

  return (
    <section className="wrap" style={{ maxWidth: 760, paddingTop: 8, paddingBottom: 24 }}>
      <div className="eyebrow" style={{ color: 'var(--accent2)' }}>Goal {CAREER_GOALS + 1} is next</div>
      <h1 className="display" style={{ fontSize: 'clamp(44px,8vw,88px)', margin: '6px 0 0', lineHeight: .95 }}>CALL IT</h1>
      <p className="muted" style={{ margin: '8px 0 18px' }}>{NEXT_MATCH.home} vs {NEXT_MATCH.away ?? 'TBC'} · calls lock at kickoff and get stamped with the current Sui checkpoint, read through Tatum.</p>

      {!receipt ? (
        <div className="card">
          <Group title="Does he score?" opts={['Yes', 'No']} value={score} set={(v) => setScore(v as 'Yes' | 'No')} />
          {score === 'Yes' && <Group title="How?" opts={HOW} value={how} set={setHow} />}
          {score === 'Yes' && <Group title="When?" opts={WHEN} value={when} set={setWhen} />}
          <button className="btn" style={{ width: '100%', minHeight: 54 }} onClick={lock} disabled={busy || !fanId}>{busy ? 'Locking on Sui and Walrus…' : 'Lock my call'}</button>
          {error && <p role="alert" style={{ color: 'var(--accent2)', fontWeight: 700, marginBottom: 0 }}>{error}</p>}
        </div>
      ) : (
        <div className="card" style={{ borderColor: 'var(--accent)' }}>
          <div className="eyebrow" style={{ color: 'var(--accent2)' }}>Your call is locked</div>
          <div className="display" style={{ fontSize: 34, lineHeight: 1.05, marginTop: 6 }}>{score === 'No' ? 'BLANK TONIGHT' : `SCORES · ${how.toUpperCase()} · ${when.toUpperCase()}`}</div>
          <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 14px', fontSize: 14, marginTop: 14, wordBreak: 'break-all' }}>
            <dt className="muted">Sui checkpoint</dt><dd style={{ margin: 0 }}>{receipt.checkpoint.sequence} · {new Date(receipt.checkpoint.time).toUTCString()}</dd>
            <dt className="muted">Checkpoint digest</dt><dd style={{ margin: 0 }}>{receipt.checkpoint.digest}</dd>
            <dt className="muted">Walrus memory</dt><dd style={{ margin: 0 }}>{receipt.blobId}</dd>
          </dl>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
            <a className="btn ghost" href={`https://suiscan.xyz/mainnet/checkpoint/${receipt.checkpoint.sequence}`} target="_blank" rel="noreferrer">View checkpoint on Suiscan</a>
            <button className="btn ghost" onClick={() => setReceipt(null)}>Change before kickoff</button>
          </div>
        </div>
      )}
    </section>
  );
}
