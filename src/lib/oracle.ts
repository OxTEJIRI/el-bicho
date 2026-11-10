import raw from '../../data/matches.json';

// The Oracle: El Bicho's own call before every match, and the goal-1,000 date forecast.
// Pure functions over data/matches.json (ESPN public game log, 210 matches since June 2022).
// The log is incomplete (it does not reproduce goal numbering), so it is used only for
// scoring rates, never for goal numbers.

export type Match = { id: string; date: string; opponent: string; home: boolean; comp: string; team: string; score: string | null; goals: number };
export const MATCHES = (raw as { matches: Match[] }).matches;

const smooth = (scored: number, n: number) => (scored + 0.55 * 2) / (n + 2); // prior: he scores in ~55% of matches
const rate = (ms: Match[]) => smooth(ms.filter((m) => m.goals > 0).length, ms.length);

export function pScore(prior: Match[], home?: boolean): number {
  const r12 = rate(prior.slice(-12));
  const r60 = rate(prior.slice(-60));
  if (home === undefined) return 0.6 * r12 + 0.4 * r60;
  const venue = prior.filter((m) => m.home === home).slice(-30);
  return 0.45 * r12 + 0.35 * rate(venue) + 0.2 * r60;
}

export const calibrate = (p: number, shrink: number) => Math.min(0.97, Math.max(0.03, 0.5 + shrink * (p - 0.5)));
const brier = (p: number, y: number) => (p - y) ** 2;

export type Backtest = {
  matches: number;
  trainMatches: number;
  testMatches: number;
  shrink: number;
  baselineRate: number;
  test: { brierCoin: number; brierRaw: number; brierLearned: number; hitRaw: number; hitLearned: number };
  rolling: { date: string; learned: number; coin: number; raw: number }[]; // rolling Brier over the test window
  worstMiss: { date: string; opponent: string; p: number; scored: boolean }[];
};

// Walk-forward: every forecast uses only matches played before it.
export function backtest(): Backtest {
  const start = 30;
  const split = Math.floor(start + (MATCHES.length - start) * 0.55);
  const rows = [];
  for (let i = start; i < MATCHES.length; i++) {
    const prior = MATCHES.slice(0, i);
    rows.push({ m: MATCHES[i], p: pScore(prior, MATCHES[i].home), y: MATCHES[i].goals > 0 ? 1 : 0, i });
  }
  const train = rows.filter((r) => r.i < split);
  const test = rows.filter((r) => r.i >= split);
  // learn one number from the past only: how much to shrink the raw forecast toward 50/50
  let shrink = 1, best = Infinity;
  for (let s = 0.1; s <= 1.6; s += 0.05) {
    const b = train.reduce((a, r) => a + brier(calibrate(r.p, s), r.y), 0) / train.length;
    if (b < best) { best = b; shrink = Math.round(s * 100) / 100; }
  }
  const baselineRate = 0.5; // the fair baseline: a coin flip
  const avg = (rs: typeof test, f: (r: (typeof test)[number]) => number) => rs.reduce((a, r) => a + f(r), 0) / rs.length;
  const hit = (p: number, y: number) => ((p >= 0.5 ? 1 : 0) === y ? 1 : 0);
  const rolling = test.map((r, k) => {
    const w = test.slice(Math.max(0, k - 14), k + 1);
    return { date: r.m.date, learned: avg(w, (x) => brier(calibrate(x.p, shrink), x.y)), coin: 0.25, raw: avg(w, (x) => brier(x.p, x.y)) };
  });
  const worst = [...test].sort((a, b) => Math.abs(b.p - b.y) - Math.abs(a.p - a.y)).slice(0, 3);
  return {
    matches: rows.length,
    trainMatches: train.length,
    testMatches: test.length,
    shrink,
    baselineRate,
    test: {
      brierCoin: avg(test, (r) => brier(baselineRate, r.y)),
      brierRaw: avg(test, (r) => brier(r.p, r.y)),
      brierLearned: avg(test, (r) => brier(calibrate(r.p, shrink), r.y)),
      hitRaw: avg(test, (r) => hit(r.p, r.y)),
      hitLearned: avg(test, (r) => hit(calibrate(r.p, shrink), r.y)),
    },
    rolling,
    worstMiss: worst.map((r) => ({ date: r.m.date, opponent: r.m.opponent, p: r.p, scored: r.y === 1 })),
  };
}

// Reasons shown next to the call, all computed from the log.
export function reasons() {
  const l10 = MATCHES.slice(-10);
  const l10g = l10.reduce((a, m) => a + m.goals, 0);
  const lastHome = MATCHES.filter((m) => m.home).slice(-10);
  const lastAway = MATCHES.filter((m) => !m.home).slice(-10);
  const sc = (ms: Match[]) => ms.filter((m) => m.goals > 0).length;
  return [
    `Scored in ${sc(l10)} of his last 10 matches (${l10g} goals).`,
    `At home: scored in ${sc(lastHome)} of the last 10. Away: ${sc(lastAway)} of the last 10.`,
    `Last match: ${MATCHES[MATCHES.length - 1].goals} goals vs ${MATCHES[MATCHES.length - 1].opponent}, ${MATCHES[MATCHES.length - 1].date}.`,
  ];
}

// Goal-1,000 date forecast: simulate Al Nassr fixtures and his goals per match from the last 25 games.
function prng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function poisson(lambda: number, rnd: () => number) {
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= rnd(); } while (p > L);
  return k - 1;
}

export type Forecast = { remaining: number; goalsPerMatch: number; matchesPerWeek: number; p10: string; p50: string; p90: string; asOf: string };

export function forecast1000(remaining: number): Forecast {
  const nsr = MATCHES.filter((m) => m.team === 'NSR');
  const lambda = nsr.slice(-25).reduce((a, m) => a + m.goals, 0) / Math.min(25, nsr.length);
  const lastDate = new Date(nsr[nsr.length - 1].date + 'T12:00:00Z');
  const yearAgo = new Date(lastDate.getTime() - 365 * 86400000);
  const recent = nsr.filter((m) => new Date(m.date + 'T12:00:00Z') >= yearAgo);
  const gaps: number[] = [];
  for (let i = 1; i < recent.length; i++) gaps.push((new Date(recent[i].date).getTime() - new Date(recent[i - 1].date).getTime()) / 86400000);
  const rnd = prng(1000);
  const ends: number[] = [];
  for (let run = 0; run < 3000; run++) {
    let t = lastDate.getTime(), g = 0, guard = 0;
    while (g < remaining && guard++ < 400) {
      t += gaps[Math.floor(rnd() * gaps.length)] * 86400000;
      g += poisson(lambda, rnd);
    }
    ends.push(t);
  }
  ends.sort((a, b) => a - b);
  const at = (q: number) => new Date(ends[Math.floor(q * (ends.length - 1))]).toISOString().slice(0, 10);
  const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  return { remaining, goalsPerMatch: lambda, matchesPerWeek: 7 / mean, p10: at(0.1), p50: at(0.5), p90: at(0.9), asOf: nsr[nsr.length - 1].date };
}
