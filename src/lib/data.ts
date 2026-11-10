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
  yt: string; channel: string; wide?: boolean; // YouTube video id; the uploader is credited on the Credits page
};

type Era = 'madrid' | 'portugal' | 'united' | 'nassr' | 'siu';
const ERA: Record<Era, { tag: string; theme: Moment['theme']; tags: string[] }> = {
  madrid: { tag: 'Real Madrid', theme: 'white', tags: ['madrid'] },
  portugal: { tag: 'Portugal', theme: 'red', tags: ['portugal'] },
  united: { tag: 'Man United', theme: 'red', tags: ['united'] },
  nassr: { tag: 'Al Nassr', theme: 'gold', tags: ['al-nassr'] },
  siu: { tag: 'SIUUU', theme: 'red', tags: ['celebration'] },
};
const v = (yt: string, title: string, channel: string, era: Era, extra: string[] = [], wide = false): Moment => ({
  id: 'v-' + yt, yt, title, channel, meta: '', wide, tag: ERA[era].tag, theme: ERA[era].theme, tags: [...ERA[era].tags, ...extra],
});

// Vertical YouTube Shorts and edits. Each id was looked up on YouTube, and the feed also skips any video that
// refuses to play in the viewer's browser (embedding can be switched off by the uploader at any time).
export const MOMENTS: Moment[] = [
  v('h6_CL2IjPY8', 'Bicycle kick vs Juventus', 'Digiaps', 'madrid', ['overhead', 'big-night']),
  v('-cbmVoJrk3w', 'The epic SIUUU', 'cr7-8h', 'siu'),
  v('VKbE5kzRdMg', 'Goal 981 vs Neftchi Fergana', 'CR7IR', 'nassr'),
  v('2hD2Ec5Zi2o', 'Free kick vs Spain', 'GoalCrazeAe', 'portugal', ['free-kick', 'big-night']),
  v('sq0g0sXD1Ug', '2008 prime at Man United', 'Mag1cks', 'united'),
  v('gBpSgcgGYmE', 'Bicycle kick x anime crossover', 'The_EDITOR', 'madrid', ['overhead']),
  v('YXQBw0FikP0', 'A goal and a last-minute winner', 'NexGoal', 'portugal', ['big-night', 'late']),
  v('53AT-AvYlPc', 'The free kick that shook the world', 'SuccessLife International', 'madrid', ['free-kick']),
  v('rqcYYHyQGNg', 'The comeback vs Man City', 'CR7EDIT', 'nassr', ['big-night']),
  v('y9Jawtz5AZ4', 'The legendary bicycle kick', 'Footy21', 'madrid', ['overhead', 'big-night']),
  v('JWeYgi5Y_r8', 'Aura edit, 4K', 'Louis Thomilson', 'united'),
  v('RU9X6yq0F2A', 'The origin of the SIU', 'FutDivision', 'siu'),
  v('MqrS89XqsPc', 'Portugal are back', 'CROATBALL', 'portugal', ['milestone']),
  v('rlFHGeshpvw', 'Prime free kick', 'speedeafc', 'madrid', ['free-kick']),
  v('cv1YNmv0R04', 'Goal 964 vs Al Hazem', 'CR7IR', 'nassr'),
  v('pJpgv8XgkbM', 'Unreal bicycle kick', 'The Magic Boots', 'madrid', ['overhead']),
  v('-4JW7BOeMns', 'Masterclass vs Derby, 2008', 'Cristiano cr7x', 'united', ['big-night']),
  v('EEo142oAOKM', 'Goal at the 2026 World Cup', 'GOAT Football Shorts', 'portugal', ['milestone', 'big-night']),
  v('8y_IVkxZELY', 'Goal 978 vs Al Taawoun', 'FTBL Tactics', 'nassr'),
  v('sTWH96P3nOE', 'The extreme free kick', 'Mr. Edit', 'madrid', ['free-kick']),
  v('ls2QOkF_TD8', 'Insane goals and the SIUUU', 'GOAL RUSH INSIDER', 'siu', ['compilation']),
  v('aDZFTmcinrk', 'Bicycle kick, 4K edit', 'cris7ronaldosiuuuu', 'madrid', ['overhead']),
  v('G6FFQKYfm8o', 'Prime debut for Real Madrid, 2009', 'Cristiano cr7x', 'madrid'),
  v('6W9TTH7Ql6Q', 'Goal vs Uzbekistan, World Cup 2026', 'Football Bawal', 'portugal', ['milestone']),
  v('VSy0FJy0LXA', 'The prime Manchester era', 'Footy-Flash', 'united'),
  v('u5BtGu_SbN4', 'The drop kick goal', 'Rubel racer', 'madrid', ['long-range']),
  v('z1jxBOdS0kg', 'Why the SIUUU is iconic', 'Thefactball', 'siu'),
  v('np41KkBYSBA', 'Man United vs Tottenham edit', 'Oldage_editx', 'united'),
  v('QE8v_pIddaA', 'Prime skills, 2011', 'Cristiano cr7x', 'madrid'),
  v('bxZMocIwfDY', 'A goal in the 6-0 vs Congo', 'STARVERSE', 'portugal'),
  v('c_JlCriK3fY', 'Bicycle kick vs Juventus (full highlight)', 'Real Madrid', 'madrid', ['overhead', 'big-night'], true),
];

export const NEXT_MATCH = {
  home: 'Al Nassr',
  away: null as string | null, // filled by the admin when the fixture is confirmed
  kickoff: null as string | null, // ISO time, filled by the admin
};
