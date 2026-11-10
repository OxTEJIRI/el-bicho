'use client';

import Link from 'next/link';
import { CAREER_GOALS, ERAS, TARGET } from '@/lib/data';
import { ForecastCard, useOracle } from '@/components/Oracle';
import { Trivia } from '@/components/Trivia';

const month = (iso: string) => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });

// Dated stops on the way, from published match reports.
const STOPS = [
  { n: 1, when: 'Oct 2002', what: 'Sporting CP vs Moreirense' },
  { n: 500, when: 'Sep 2015', what: 'Real Madrid at Malmö' },
  { n: 700, when: 'Oct 2019', what: 'Portugal at Ukraine' },
  { n: 800, when: 'Dec 2021', what: 'Man United vs Arsenal' },
  { n: 900, when: 'Sep 2024', what: 'Portugal vs Croatia' },
];

export default function RoadPage() {
  const oracle = useOracle();
  const total = ERAS.reduce((a, e) => a + e.goals, 0);
  const p1000 = oracle.data ? month(oracle.data.forecast.p50) : 'forecasting…';
  return (
    <section className="wrap page">
      <header className="page-head">
        <p className="kicker">The road to 1,000</p>
        <h1 className="display page-title road-title">{CAREER_GOALS} down.<br />{TARGET - CAREER_GOALS} to go.</h1>
      </header>

      <div className="road" role="img" aria-label={`${CAREER_GOALS} of ${TARGET} goals, with stops at goals 1, 500, 700, 800 and 900`}>
        <div className="road-line"><i style={{ width: `${(CAREER_GOALS / TARGET) * 100}%` }} /></div>
        {STOPS.map((s, k) => (
          <div key={s.n} className={'road-stop ' + (k % 2 ? 'up' : 'down') + (s.n > 1 ? ' minor' : ' start')} style={{ left: `${(s.n / TARGET) * 100}%` }}>
            <span className="road-dot" />
            <span className="road-n display">{s.n}</span>
            <span className="road-when">{s.when}</span>
          </div>
        ))}
        <div className="road-stop now up" style={{ left: `${(CAREER_GOALS / TARGET) * 100}%` }}>
          <span className="road-dot" />
          <span className="road-n display">{CAREER_GOALS}</span>
          <span className="road-when">Now</span>
        </div>
        <div className="road-stop goal down" style={{ left: '100%' }}>
          <span className="road-dot" />
          <span className="road-n display">1,000</span>
          <span className="road-when">{p1000}</span>
        </div>
      </div>
      <ul className="road-legend">
        {STOPS.map((s) => <li key={s.n}><b>Goal {s.n}</b> {s.what}, {s.when}</li>)}
      </ul>

      <div className="road-grid">
        <div className="panel">
          <h2 className="panel-title">Goals by shirt</h2>
          <div className="shirt-bar" aria-hidden="true">
            {ERAS.map((e) => <i key={e.club} style={{ flex: e.goals, background: e.color }} title={`${e.club} ${e.goals}`} />)}
          </div>
          <ul className="shirts">
            {ERAS.map((e) => (
              <li key={e.club}>
                <span className="shirt-swatch" style={{ background: e.color }} />
                <span className="shirt-club">{e.club}<small>{e.years}</small></span>
                {e.counting && <span className="tag live-tag">Still counting</span>}
                {e.note === 'final' && <span className="tag">Final</span>}
                <span className="display shirt-n">{e.goals}{e.counting ? '+' : ''}</span>
              </li>
            ))}
          </ul>
          <p className="fine">Total {total}. Portugal is final: he retired from international football on 5 Nov 2026 with 146 goals. Al Nassr is his career total minus the other shirts, so it moves with every goal.</p>
        </div>
        <div className="road-side">
          <ForecastCard data={oracle.data} />
          <Link href="/call" className="panel road-cta">
            <span className="kicker">Goal {CAREER_GOALS + 1} is next</span>
            <span className="display">Call his next match</span>
          </Link>
        </div>
      </div>

      <Trivia />
    </section>
  );
}
