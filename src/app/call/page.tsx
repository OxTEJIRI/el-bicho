'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useFan } from '@/components/Fan';
import { CAREER_GOALS, opponentOf } from '@/lib/data';
import { THEMES } from '@/lib/themes';
import { OracleCard, useOracle } from '@/components/Oracle';
import { Crest, MatchTicket, useNextFixture } from '@/components/Match';

const HOW = ['Header', 'Left foot', 'Right foot', 'Penalty', 'Free kick'];
const WHEN = ['1st half', '2nd half'];

type Receipt = { checkpoint: { sequence: string; digest: string; time: string }; blobId: string; text: string };
type Crowd = { total: number | null; scores?: number };

export default function CallPage() {
  const { fanId, theme } = useFan();
  const f = useNextFixture();
  const opp = opponentOf(f);
  const [score, setScore] = useState<'Yes' | 'No'>('Yes');
  const [how, setHow] = useState('Right foot');
  const [when, setWhen] = useState('2nd half');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [crowd, setCrowd] = useState<Crowd | null>(null);
  const oracle = useOracle();

  useEffect(() => { fetch('/api/crowd').then((r) => r.json()).then(setCrowd).catch(() => setCrowd({ total: null })); }, []);

  const oPct = oracle.data ? Math.round(oracle.data.p * 100) : null;
  const fansPct = crowd?.total ? Math.round(((crowd.scores ?? 0) / crowd.total) * 100) : null;
  const pickText = score === 'No' ? 'He blanks' : `He scores · ${how} · ${when}`;

  async function lock() {
    if (!fanId || busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/call', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fanId, match: f.id, score, how, when }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReceipt(data);
      try { localStorage.setItem('elbicho.lastCall', JSON.stringify({ pick: score === 'No' ? 'Blanks' : `${how} · ${when}`, cp: data.checkpoint.sequence, goal: CAREER_GOALS + 1, match: `${f.home.name} vs ${f.away.name}` })); } catch { /* private mode */ }
    } catch (e) {
      setError((e as Error).message || 'Could not lock your call. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="wrap page">
      <header className="page-head">
        <p className="kicker">Predict his next match</p>
        <h1 className="display page-title">Will Ronaldo score?</h1>
        <p className="lede">Make your call before kickoff. It is saved to your Walrus memory and stamped with the latest Sui checkpoint, read through Tatum.</p>
      </header>

      <div className="call-grid">
        <div className="call-main">
          <MatchTicket f={f} />

          {!receipt ? (
            <div className="slip">
              <div className="slip-q">
                <span className="slip-face">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={THEMES[theme].photo} alt="" aria-hidden="true" style={{ objectPosition: THEMES[theme].pos }} />
                </span>
                <div>
                  <div className="slip-player">Cristiano Ronaldo</div><div className="slip-player"><span>#7 · Al Nassr</span></div>
                  <div className="slip-question">To score vs {opp.name}?</div>
                </div>
                <Crest team={opp} size={40} />
              </div>

              <div className="slip-options" role="radiogroup" aria-label="Does he score?">
                <button role="radio" aria-checked={score === 'Yes'} className="opt" onClick={() => setScore('Yes')}>
                  <span className="opt-label display">Yes, he scores</span>
                  <span className="opt-meta">Oracle {oPct ?? '--'}%{fansPct !== null && <> · Fans {fansPct}%</>}</span>
                </button>
                <button role="radio" aria-checked={score === 'No'} className="opt" onClick={() => setScore('No')}>
                  <span className="opt-label display">No, he blanks</span>
                  <span className="opt-meta">Oracle {oPct === null ? '--' : 100 - oPct}%{fansPct !== null && <> · Fans {100 - fansPct}%</>}</span>
                </button>
              </div>

              {score === 'Yes' && (
                <>
                  <fieldset className="slip-group">
                    <legend>How does he score?</legend>
                    <div className="chips">{HOW.map((o) => <button key={o} className="chip" aria-pressed={how === o} onClick={() => setHow(o)}>{o}</button>)}</div>
                  </fieldset>
                  <fieldset className="slip-group">
                    <legend>When?</legend>
                    <div className="chips">{WHEN.map((o) => <button key={o} className="chip" aria-pressed={when === o} onClick={() => setWhen(o)}>{o}</button>)}</div>
                  </fieldset>
                </>
              )}

              <div className="slip-foot">
                <div>
                  <div className="slip-yours">Your call</div>
                  <div className="slip-pick">{pickText}</div>
                </div>
                <button className="btn" onClick={lock} disabled={busy || !fanId}>{busy ? 'Locking…' : 'Lock my call'}</button>
              </div>
              {busy && <p className="slip-note">Reading the latest Sui checkpoint through Tatum and writing to Walrus. This takes about 20 seconds.</p>}
              {error && <p role="alert" className="slip-error">{error}</p>}
            </div>
          ) : (
            <div className="receipt">
              <div className="receipt-top">
                <span className="receipt-stamp display">Locked</span>
                <div className="display receipt-pick">{pickText}</div>
                <div className="muted">{f.home.name} vs {f.away.name} · goal {CAREER_GOALS + 1} is next</div>
              </div>
              <dl className="receipt-rows">
                <dt>Sui checkpoint</dt><dd>{receipt.checkpoint.sequence}<small>{new Date(receipt.checkpoint.time).toUTCString()}</small></dd>
                <dt>Digest</dt><dd className="mono">{receipt.checkpoint.digest}</dd>
                <dt>Walrus memory</dt><dd className="mono">{receipt.blobId}</dd>
              </dl>
              <div className="receipt-actions">
                <Link className="btn" href="/share">Make my share card</Link>
                <a className="btn ghost" href={`https://suiscan.xyz/mainnet/checkpoint/${receipt.checkpoint.sequence}`} target="_blank" rel="noreferrer">See it on Suiscan</a>
                <button className="btn ghost" onClick={() => setReceipt(null)}>Change my call</button>
              </div>
            </div>
          )}
        </div>

        <aside className="call-side">
          <OracleCard data={oracle.data} error={oracle.error} opponent={opp.name} />
          <Link href="/crowd" className="crowd-mini">
            <span className="crowd-mini-label">What fans called</span>
            {crowd?.total ? (
              <>
                <span className="crowd-bar"><i style={{ width: `${fansPct}%` }} /></span>
                <span className="crowd-mini-num"><b>{fansPct}%</b> say he scores · {crowd.total} calls</span>
              </>
            ) : <span className="crowd-mini-num">{crowd ? 'Be the first to call it' : 'Reading the crowd from Walrus…'}</span>}
          </Link>
        </aside>
      </div>
    </section>
  );
}
