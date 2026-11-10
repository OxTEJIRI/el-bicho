import 'server-only';
import { AL_NASSR_GOALS, CAREER_GOALS, ERAS, MOMENTS, TARGET, nextFixture } from './data';
import { fanNamespace, recall } from './memory';
import { MATCHES, forecast1000 } from './oracle';
import { liveOracle } from './oracle-live';
import { tasteFrom } from './taste';

// Ask El Bicho. No language model: it answers only from sources it can name — the ESPN match log,
// the career totals, the Oracle, and the fan's own Walrus memories — and says plainly when it cannot answer.

export type Answer = { answer: string; sources: string[]; kind: string };

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const monthYear = (iso: string) => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const LOG = `Match log: ESPN, ${MATCHES.length} matches since June 2022`;

function humanise(text: string): string {
  const moment = (id: string) => MOMENTS.find((m) => m.id === id)?.title ?? id;
  const get = (k: string) => new RegExp(k + '=([^·]+?)(?: ·|$)').exec(text)?.[1]?.trim();
  if (text.startsWith('REACTION')) {
    const mem = /memory="([^"]+)"/.exec(text)?.[1];
    return mem ? `You remembered "${mem}" on ${moment(get('moment') ?? '')}.` : `You reacted ${get('reaction')} to ${moment(get('moment') ?? '')}.`;
  }
  if (text.startsWith('CALL')) {
    const parts = text.split(' · ');
    const metadata = /^(accepted_at_server|checkpoint_observed|checkpoint_time|locked_at_checkpoint)=/;
    const pick = parts.slice(2).filter((part) => !metadata.test(part)).join(', ').replace(/how=|when=/g, '');
    const acceptedAt = get('accepted_at_server');
    const checkpoint = get('checkpoint_observed') ?? get('locked_at_checkpoint');
    const timing = acceptedAt ? `accepted by the server at ${acceptedAt}` : 'saved with an earlier checkpoint receipt';
    return `Your call for ${get('match')}: ${pick}, ${timing}. Sui checkpoint reference: ${checkpoint ?? 'not recorded'} (context only).`;
  }
  if (text.startsWith('PROFILE')) return `You told me your Ronaldo: ${get('eras')}; goals you love: ${get('kinds')}.`;
  return text.slice(0, 160);
}

export async function ask(q: string, fanId: string): Promise<Answer> {
  const n = norm(q);

  // goal 1,000 forecast
  if (/(1000|1,000|thousand|\b1k\b)/.test(n) && /(when|date|reach|hit|get to|will)/.test(n)) {
    const f = forecast1000(TARGET - CAREER_GOALS);
    return { kind: 'forecast', sources: [LOG], answer: `Most likely ${monthYear(f.p50)}, with a range of ${monthYear(f.p10)} to ${monthYear(f.p90)}. That assumes he plays for Al Nassr only, scores ${f.goalsPerMatch.toFixed(2)} goals a match (his last 25 Al Nassr games), and plays about ${f.matchesPerWeek.toFixed(1)} club matches a week. He has ${TARGET - CAREER_GOALS} to go.` };
  }

  // opponent
  const opponents = [...new Set(MATCHES.map((m) => m.opponent))].sort((a, b) => b.length - a.length);
  const opp = opponents.find((o) => n.includes(norm(o)));
  if (opp) {
    const ms = MATCHES.filter((m) => m.opponent === opp);
    const goals = ms.reduce((a, m) => a + m.goals, 0);
    const scored = ms.filter((m) => m.goals > 0).length;
    const last = ms.slice(-3).map((m) => `${m.date}: ${m.goals} ${m.goals === 1 ? 'goal' : 'goals'} (${m.comp})`).join('; ');
    return { kind: 'opponent', sources: [LOG], answer: `Against ${opp} since June 2022: ${goals} ${goals === 1 ? 'goal' : 'goals'} in ${ms.length} ${ms.length === 1 ? 'match' : 'matches'}, scoring in ${scored}. Latest: ${last}. My log is incomplete and starts in June 2022, so older meetings are not counted.` };
  }

  // goal type — the log is per match, not per goal
  if (/(header|head|left foot|right foot|left-foot|right-foot|free kick|free-kick|penalt|volley|bicycle|overhead)/.test(n)) {
    const lastN = MATCHES.slice(-10);
    return { kind: 'limit', sources: [LOG], answer: `I can't split his goals by how he scored them. My match log records goals per game, not per goal, and I won't guess. What I can tell you: he scored in ${lastN.filter((m) => m.goals > 0).length} of his last 10 matches. You can still react to a moment (a bicycle kick, a free kick) in Relive and I'll learn which kind you love.` };
  }

  // home / away
  if (/(home|away)/.test(n)) {
    const rate = (h: boolean) => { const ms = MATCHES.filter((m) => m.home === h); return { n: ms.length, g: ms.reduce((a, m) => a + m.goals, 0), s: ms.filter((m) => m.goals > 0).length }; };
    const h = rate(true), a = rate(false);
    return { kind: 'venue', sources: [LOG], answer: `At home he has ${h.g} goals in ${h.n} matches (scored in ${h.s}). Away: ${a.g} in ${a.n} (scored in ${a.s}). Counting June 2022 onwards.` };
  }

  // the next call
  if (/(oracle|predict|tonight|next match|will he score|call)/.test(n) && !/\bmy\b/.test(n)) {
    const o = await liveOracle();
    return { kind: 'oracle', sources: [LOG, o.fromMemory ? `Oracle lesson recalled from Walrus (${o.source?.asof})` : 'Raw forecast (memory unreachable)'], answer: `Next: ${nextFixture().home.name} vs ${nextFixture().away.name}, ${nextFixture().comp}, ${new Date(nextFixture().kickoff).toUTCString().slice(0, 22)} UTC. ${Math.round(o.p * 100)}% chance he scores, so ${Math.abs(o.p - 0.5) < 0.05 ? "it's a toss-up" : o.call.toLowerCase()}. ${o.reasons.join(' ')} ${o.fromMemory ? `I pulled my raw ${Math.round(o.raw * 100)}% toward 50/50 because my past forecasts were overconfident.` : ''}`.trim() };
  }

  // career totals
  if (/(how many|total|goals for|club|career)/.test(n) && !/\b(my|i)\b/.test(n)) {
    const lines = ERAS.map((e) => `${e.club} ${e.goals}${e.counting ? '+' : ''}`).join(', ');
    return { kind: 'career', sources: ['Career totals', 'ESPN goal tracker (985)'], answer: `${CAREER_GOALS} official career goals: ${lines}. Portugal is final: he retired from international football on 5 Nov 2026. Al Nassr is still counting (${AL_NASSR_GOALS}+); it is his career total minus the other shirts. He needs ${TARGET - CAREER_GOALS} more for 1,000.` };
  }

  // form
  if (/(form|recent|lately|last (few|match|game))/.test(n)) {
    const l = MATCHES.slice(-10);
    return { kind: 'form', sources: [LOG], answer: `In his last 10 matches he scored ${l.reduce((a, m) => a + m.goals, 0)} goals and found the net in ${l.filter((m) => m.goals > 0).length}. Last match: ${MATCHES[MATCHES.length - 1].goals} vs ${MATCHES[MATCHES.length - 1].opponent} (${MATCHES[MATCHES.length - 1].date}).` };
  }

  // the fan's own memories
  if (fanId) {
    const ns = fanNamespace(fanId);
    try {
      const found = await recall(q, ns, 6);
      const mine = found.filter((r) => /^(REACTION|CALL|PROFILE)/.test(r.text));
      if (/(taste|profile|ronaldo is mine|what do i like|what do i love)/.test(n)) {
        const t = tasteFrom(mine.map((r) => r.text));
        return { kind: 'taste', sources: mine.length ? ['Your memory · Walrus'] : [], answer: t.profile ? `Your Ronaldo: ${t.profile} I learned that from ${mine.length} of your memories.` : "I don't know your taste yet. React to a few moments in Relive, or take the 30-second quiz on the Welcome page." };
      }
      if (mine.length) return { kind: 'memory', sources: mine.map((r) => `Your memory · blob ${r.blobId.slice(0, 8)}`), answer: mine.slice(0, 4).map((r) => humanise(r.text)).join(' ') };
    } catch { /* fall through to help */ }
  }

  return { kind: 'help', sources: [], answer: "I can answer from my match log (since June 2022), his career totals, my own forecast, and your memories. Try: how many goals against Al Hilal, when will he hit 1,000, will he score next match, what's my taste, or what did I react to." };
}
