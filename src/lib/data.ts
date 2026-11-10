// Facts used by the app. Every number here is sourced; anything not yet verified stays null
// and renders as a placeholder rather than an invented figure.

export const CAREER_GOALS = 985; // ESPN goal tracker, after the hat-trick vs Al Kholood (2026)
export const TARGET = 1000;

// Career goals by shirt. Real Madrid 450, Manchester United 145, Juventus 101 and Sporting CP 5 are published career
// figures; Portugal is 146 (supplied by the owner). Al Nassr is still counting, so it is derived: the official career
// total minus the other four, and it moves up with every goal he scores.
const OTHERS = { madrid: 450, united: 145, juventus: 101, sporting: 5, portugal: 146 };
export const AL_NASSR_GOALS = CAREER_GOALS - Object.values(OTHERS).reduce((a, b) => a + b, 0);

export const ERAS: { club: string; goals: number; color: string; counting?: boolean }[] = [
  { club: 'Real Madrid', goals: OTHERS.madrid, color: '#FFFFFF' },
  { club: 'Portugal', goals: OTHERS.portugal, color: '#C8102E' },
  { club: 'Manchester United', goals: OTHERS.united, color: '#DA020E' },
  { club: 'Al Nassr', goals: AL_NASSR_GOALS, color: '#FFD100', counting: true },
  { club: 'Juventus', goals: OTHERS.juventus, color: '#111111' },
  { club: 'Sporting CP', goals: OTHERS.sporting, color: '#00A650' },
];

export const MILESTONES = [
  { n: 'Goal 1', what: 'Sporting CP · 2002' },
  { n: 'Goal 900', what: 'Portugal vs Croatia · 5 Sep 2024' },
  { n: 'Goal 985', what: 'Hat-trick vs Al Kholood · 2026' },
  { n: 'Goal 986', what: 'Next. Call it before kickoff', next: true },
  { n: 'Goal 1,000', what: 'The 1,000 Wall opens' },
];

export type Moment = {
  id: string; tag: string; title: string; meta: string; tags: string[]; theme: 'red' | 'white' | 'gold';
  yt: string; channel: string; // YouTube video id and the channel that uploaded it (checked with YouTube oEmbed)
};

// Every video here was looked up on YouTube: it exists, allows embedding, and the channel is a rights holder
// (club, league, FIFA/UEFA, or a major broadcaster). Fan-channel uploads are deliberately left out.
export const MOMENTS: Moment[] = [
  { id: 'bicycle-juventus-2018', tag: 'Champions League · 2018', title: 'Bicycle kick vs Juventus', meta: 'Turin · 3 Apr 2018', tags: ['overhead', 'big-night', 'madrid'], theme: 'white', yt: 'c_JlCriK3fY', channel: 'Real Madrid' },
  { id: 'hattrick-spain-2018', tag: 'World Cup · 2018', title: 'Hat-trick vs Spain', meta: 'Sochi · 15 Jun 2018 · free kick in the 88th', tags: ['free-kick', 'late', 'portugal', 'big-night', 'hat-trick'], theme: 'red', yt: 'yC30rfjXw9g', channel: 'FIFA' },
  { id: 'final-2017-juventus', tag: 'Champions League final · 2017', title: 'Two goals in the final', meta: 'Cardiff · 3 Jun 2017 · Real Madrid 4-1 Juventus', tags: ['big-night', 'madrid', 'final'], theme: 'white', yt: 'G4vcAxJA0-8', channel: 'Real Madrid' },
  { id: 'wc2026-croatia', tag: 'World Cup · 2026', title: 'Equaliser vs Croatia', meta: 'Round of 32 · Portugal 2-1 Croatia', tags: ['big-night', 'portugal', 'milestone'], theme: 'red', yt: 'ZlSvZ5qNWw8', channel: 'FIFA' },
  { id: 'wc2026-uzbekistan', tag: 'World Cup · 2026', title: 'Record goal vs Uzbekistan', meta: 'Group stage · Portugal 5-0 Uzbekistan', tags: ['portugal', 'milestone'], theme: 'red', yt: '_fl81hI-P30', channel: 'FIFA' },
  { id: 'hattrick-atletico-2019', tag: 'Champions League · 2019', title: 'Hat-trick vs Atlético', meta: 'Turin · 12 Mar 2019 · Juventus 3-0', tags: ['hat-trick', 'big-night', 'juventus'], theme: 'white', yt: 'MgMlnuWX794', channel: 'Juventus' },
  { id: 'goal-900-croatia-2024', tag: 'Nations League · 2024', title: 'Goal 900 vs Croatia', meta: 'Lisbon · 5 Sep 2024', tags: ['milestone', 'portugal'], theme: 'red', yt: 'RdVTRCOZuro', channel: "L'ÉQUIPE" },
  { id: 'hattrick-al-kholood-2026', tag: 'Saudi Pro League · 2026', title: 'Hat-trick to 985', meta: 'Al Nassr vs Al Kholood', tags: ['hat-trick', 'al-nassr'], theme: 'gold', yt: 'ZDR09E9qu78', channel: 'Fox Deportes' },
  { id: 'spl-brace', tag: 'Saudi Pro League', title: 'A brace wins it for Al Nassr', meta: 'Official league highlights', tags: ['al-nassr', 'late'], theme: 'gold', yt: 'QhQi9-CVRYs', channel: 'Saudi Pro League' },
  { id: 'nassr-espn-goal', tag: 'Saudi Pro League', title: 'Al Nassr cruise to 3-0', meta: 'ESPN UK highlights', tags: ['al-nassr'], theme: 'gold', yt: 'IU08QN1qetc', channel: 'ESPN UK' },
  { id: 'nassr-lob', tag: 'Al Nassr', title: 'The long-range lob', meta: 'Guardian Football', tags: ['al-nassr', 'long-range'], theme: 'gold', yt: '__gnFaW3mGY', channel: 'Guardian Football' },
  { id: 'porto-2009', tag: 'Champions League · 2009', title: 'The rocket vs Porto', meta: 'Manchester United · 15 Apr 2009', tags: ['long-range', 'big-night', 'united'], theme: 'red', yt: '7H56QszsqsI', channel: 'CBS Sports Golazo' },
  { id: 'madrid-long-shots', tag: 'Real Madrid', title: 'The long shots', meta: 'Real Madrid highlights', tags: ['long-range', 'madrid'], theme: 'white', yt: 'dWhdZxhFCC8', channel: 'Real Madrid' },
  { id: 'madrid-laliga', tag: 'Real Madrid · LaLiga', title: 'Best LaLiga goals', meta: 'Real Madrid highlights', tags: ['madrid'], theme: 'white', yt: 'cjbTRDPbLTw', channel: 'Real Madrid' },
  { id: 'madrid-all-451', tag: 'Real Madrid · 2009-2018', title: 'All 451 goals', meta: 'Real Madrid highlights', tags: ['madrid', 'compilation'], theme: 'white', yt: 'aeapZzsujqc', channel: 'Real Madrid' },
  { id: 'wc-all-goals', tag: 'World Cups · Portugal', title: 'All 11 World Cup goals', meta: 'FIFA highlights', tags: ['portugal', 'compilation'], theme: 'red', yt: 'KyyuE7ClNI0', channel: 'FIFA' },
  { id: 'spl-all-2025-26', tag: 'Saudi Pro League · 2025/26', title: 'Every goal of the season', meta: 'Saudi Pro League highlights', tags: ['al-nassr', 'compilation'], theme: 'gold', yt: 'qUFAYud9Q1A', channel: 'Saudi Pro League' },
];

export const NEXT_MATCH = {
  home: 'Al Nassr',
  away: null as string | null, // filled by the admin when the fixture is confirmed
  kickoff: null as string | null, // ISO time, filled by the admin
};
