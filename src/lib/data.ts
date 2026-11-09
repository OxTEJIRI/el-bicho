// Facts used by the app. Every number here is sourced; anything not yet verified stays null
// and renders as a placeholder rather than an invented figure.

export const CAREER_GOALS = 985; // ESPN goal tracker, after the hat-trick vs Al Kholood (2026)
export const TARGET = 1000;

export const ERAS: { club: string; goals: number | null; color: string }[] = [
  { club: 'Real Madrid', goals: 450, color: '#FFFFFF' },
  { club: 'Manchester United', goals: 145, color: '#DA020E' },
  { club: 'Portugal', goals: null, color: '#C8102E' },
  { club: 'Al Nassr', goals: null, color: '#FFD100' },
  { club: 'Juventus', goals: 101, color: '#111111' },
  { club: 'Sporting CP', goals: 5, color: '#00A650' },
];

export const MILESTONES = [
  { n: 'Goal 1', what: 'Sporting CP · 2002' },
  { n: 'Goal 900', what: 'Portugal vs Croatia · 5 Sep 2024' },
  { n: 'Goal 985', what: 'Hat-trick vs Al Kholood · 2026' },
  { n: 'Goal 986', what: 'Next. Call it before kickoff', next: true },
  { n: 'Goal 1,000', what: 'The 1,000 Wall opens' },
];

export type Moment = { id: string; tag: string; title: string; meta: string; tags: string[]; theme: 'red' | 'white' | 'gold' };

export const MOMENTS: Moment[] = [
  { id: 'bicycle-juventus-2018', tag: 'Champions League · 2018', title: 'Bicycle kick vs Juventus', meta: 'Turin · 3 Apr 2018', tags: ['overhead', 'big-night', 'madrid'], theme: 'white' },
  { id: 'hattrick-spain-2018', tag: 'World Cup · 2018', title: 'Hat-trick vs Spain', meta: 'Sochi · 15 Jun 2018', tags: ['free-kick', 'late', 'portugal', 'big-night'], theme: 'red' },
  { id: 'goal-900-croatia-2024', tag: 'Nations League · 2024', title: 'Goal 900 vs Croatia', meta: 'Lisbon · 5 Sep 2024', tags: ['milestone', 'portugal'], theme: 'red' },
  { id: 'hattrick-al-kholood-2026', tag: 'Saudi Pro League · 2026', title: 'Hat-trick to 985', meta: 'vs Al Kholood', tags: ['hat-trick', 'al-nassr'], theme: 'gold' },
];

export const NEXT_MATCH = {
  home: 'Al Nassr',
  away: null as string | null, // filled by the admin when the fixture is confirmed
  kickoff: null as string | null, // ISO time, filled by the admin
};
