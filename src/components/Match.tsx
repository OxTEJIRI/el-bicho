'use client';

import { useEffect, useState } from 'react';
import { nextFixture, type Fixture, type Team } from '@/lib/data';

export function Crest({ team, size = 64 }: { team: Team; size?: number }) {
  return (
    <span className="crest" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={team.logo} alt={`${team.name} crest`} width={size} height={size} />
    </span>
  );
}

export function useNextFixture() {
  const [f, setF] = useState<Fixture>(() => nextFixture(Date.parse('2026-11-10T00:00:00Z')));
  useEffect(() => setF(nextFixture()), []);
  return f;
}

export function useCountdown(iso: string) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, new Date(iso).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [iso]);
  if (left === null) return null;
  const s = Math.floor(left / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60, done: left === 0 };
}

const pad = (n: number) => String(n).padStart(2, '0');

export function kickoffLocal(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  };
}

// The match ticket: both crests, the kickoff in the visitor's own time, a live countdown to when calls lock.
export function MatchTicket({ f, compact = false }: { f: Fixture; compact?: boolean }) {
  const c = useCountdown(f.kickoff);
  const k = kickoffLocal(f.kickoff);
  return (
    <div className={'ticket' + (compact ? ' compact' : '')}>
      <div className="ticket-main">
        <div className="ticket-comp">{f.comp}</div>
        <div className="ticket-teams">
          <div className="ticket-team">
            <Crest team={f.home} size={compact ? 52 : 72} />
            <span className="display">{f.home.name}</span>
            <small>Home</small>
          </div>
          <div className="ticket-vs">
            <span className="display">{k.time}</span>
            <small>{k.day}</small>
          </div>
          <div className="ticket-team">
            <Crest team={f.away} size={compact ? 52 : 72} />
            <span className="display">{f.away.name}</span>
            <small>Away</small>
          </div>
        </div>
        <div className="ticket-venue">{f.venue}, {f.city}</div>
      </div>
      <div className="ticket-stub" aria-label="Time until calls lock">
        <span className="ticket-stub-label">Calls lock in</span>
        {c ? (
          c.done ? <span className="display ticket-clock">Locked</span> : (
            <span className="ticket-clock display" role="timer">
              <span><b>{c.d}</b><i>d</i></span><span><b>{pad(c.h)}</b><i>h</i></span><span><b>{pad(c.m)}</b><i>m</i></span><span><b>{pad(c.s)}</b><i>s</i></span>
            </span>
          )
        ) : <span className="display ticket-clock">…</span>}
      </div>
    </div>
  );
}
