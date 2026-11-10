import { MOMENTS } from './data';

// Turns a fan's recalled reaction memories into a readable taste profile.
// Memory lines look like: "REACTION · moment=<id> · reaction=<name> · tags=a,b,c".

const LABELS: Record<string, string> = {
  overhead: 'overhead goals',
  'big-night': 'big nights',
  'free-kick': 'free kicks',
  late: 'late drama',
  milestone: 'milestones',
  'hat-trick': 'hat-tricks',
  madrid: 'the Madrid era',
  portugal: 'Portugal nights',
  'al-nassr': 'the Al Nassr years',
  'long-range': 'long-range strikes',
  united: 'the Manchester United years',
  juventus: 'the Juventus years',
  final: 'finals',
  compilation: 'the full highlight reels',
};

export function tasteFrom(texts: string[]) {
  const score: Record<string, number> = {};
  for (const t of texts) {
    const m = /tags=([a-z,-]+)/.exec(t);
    if (!m || /reaction=none/.test(t)) continue;
    for (const tag of m[1].split(',')) score[tag] = (score[tag] || 0) + 1;
  }
  const top = Object.entries(score).sort((a, b) => b[1] - a[1]).map(([k]) => k);
  const words = top.slice(0, 3).map((k) => LABELS[k] || k);
  const profile = words.length ? words.map((w) => w[0].toUpperCase() + w.slice(1)).join('. ') + '.' : null;
  const ranked = [...MOMENTS].sort((a, b) => rank(b.tags) - rank(a.tags));
  function rank(tags: string[]) {
    return tags.reduce((s, t) => s + (score[t] || 0), 0);
  }
  return { profile, top, reactions: texts.length, picks: ranked.map((m) => m.id) };
}
