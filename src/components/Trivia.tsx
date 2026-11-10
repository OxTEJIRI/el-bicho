'use client';

import { useEffect, useState } from 'react';
import { playSfx } from '@/lib/sfx';

type Q = { q: string; options: string[]; a: number; fact: string };

// Every answer here is a published fact about his goals.
const QUESTIONS: Q[] = [
  { q: 'Which club did he score his first senior goal for?', options: ['Manchester United', 'Sporting CP', 'Real Madrid', 'Portugal'], a: 1, fact: 'Sporting CP in 2002: two goals against Moreirense, aged 17.' },
  { q: 'Which shirt holds the most of his goals?', options: ['Manchester United', 'Al Nassr', 'Real Madrid', 'Juventus'], a: 2, fact: 'Real Madrid: 450 goals, the most by anyone in the club’s history.' },
  { q: 'His famous 2018 bicycle kick was against which team?', options: ['Juventus', 'Barcelona', 'Atlético Madrid', 'Bayern Munich'], a: 0, fact: 'Juventus in Turin, April 2018. The home fans stood and applauded.' },
  { q: 'How did his hat-trick against Spain at the 2018 World Cup end?', options: ['Portugal won 3-2', '3-3 draw', 'Spain won 4-3', '3-1 to Portugal'], a: 1, fact: 'It finished 3-3, and his third was a late free kick.' },
  { q: 'Who did he score goal 900 against?', options: ['Croatia', 'Spain', 'Al Hilal', 'Scotland'], a: 0, fact: 'Croatia, for Portugal, on 5 September 2024.' },
  { q: 'Whose men’s international record of 109 goals did he break in 2021?', options: ['Pelé', 'Miroslav Klose', 'Ali Daei', 'Ferenc Puskás'], a: 2, fact: 'Ali Daei of Iran. He passed it against Ireland in September 2021.' },
  { q: 'How many goals did he score for Portugal before retiring from international football?', options: ['128', '138', '146', '150'], a: 2, fact: '146 goals in 234 caps. He retired from Portugal on 5 November 2026.' },
  { q: 'How many Champions League titles has he won?', options: ['3', '4', '5', '6'], a: 2, fact: 'Five: 2008 with United, then 2014, 2016, 2017 and 2018 with Real Madrid.' },
  { q: 'His 2019 hat-trick against Atlético turned around which scoreline?', options: ['1-0', '2-0', '3-1', '2-1'], a: 1, fact: 'Juventus lost the first leg 2-0, then won 3-0 at home. He scored all three.' },
  { q: 'How many goals does he still need to reach 1,000?', options: ['5', '10', '15', '20'], a: 2, fact: '985 official goals, so 15 to go. Goal 986 is next.' },
];

export function Trivia() {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const done = i >= QUESTIONS.length;
  const q = QUESTIONS[Math.min(i, QUESTIONS.length - 1)];

  useEffect(() => { try { const b = localStorage.getItem('elbicho.trivia'); if (b) setBest(Number(b)); } catch { /* private mode */ } }, []);
  useEffect(() => {
    if (!done) return;
    try { if (best === null || score > best) { localStorage.setItem('elbicho.trivia', String(score)); setBest(score); } } catch { /* private mode */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  function answer(k: number) {
    if (pick !== null) return;
    setPick(k);
    if (k === q.a) { setScore((s) => s + 1); playSfx('siuuu'); } else playSfx('tears');
  }
  function next() { setPick(null); setI((v) => v + 1); }
  function restart() { setI(0); setPick(null); setScore(0); }

  const rank = score >= 9 ? 'Captain' : score >= 7 ? 'First team' : score >= 4 ? 'Bench' : 'Academy';

  return (
    <div className="trivia">
      <div className="trivia-top">
        <div>
          <div className="trivia-title display">Goal quiz</div>
          <div className="trivia-sub">Ten questions on his goals. {best !== null && <>Your best: {best}/10.</>}</div>
        </div>
        <div className="trivia-score display" aria-live="polite">{score}<small>/{QUESTIONS.length}</small></div>
      </div>
      <div className="trivia-dots" aria-hidden="true">
        {QUESTIONS.map((_, k) => <i key={k} className={k < i ? 'done' : k === i && !done ? 'now' : ''} />)}
      </div>

      {!done ? (
        <>
          <p className="trivia-q">{q.q}</p>
          <div className="trivia-options">
            {q.options.map((o, k) => {
              const state = pick === null ? '' : k === q.a ? ' right' : k === pick ? ' wrong' : ' dim';
              return <button key={o} className={'trivia-opt' + state} onClick={() => answer(k)} disabled={pick !== null && k !== pick && k !== q.a}>{o}</button>;
            })}
          </div>
          {pick !== null && (
            <div className="trivia-fact">
              <p><b>{pick === q.a ? 'Right.' : 'Not quite.'}</b> {q.fact}</p>
              <button className="btn" onClick={next}>{i === QUESTIONS.length - 1 ? 'See my score' : 'Next question'}</button>
            </div>
          )}
        </>
      ) : (
        <div className="trivia-end">
          <div className="display trivia-rank">{rank}</div>
          <p>You got {score} of {QUESTIONS.length}. {score === QUESTIONS.length ? 'Perfect. You know every one.' : 'Play again to beat it.'}</p>
          <button className="btn" onClick={restart}>Play again</button>
        </div>
      )}
    </div>
  );
}
