// Facts used by the app. Every number here is sourced; anything not yet verified stays null
// and renders as a placeholder rather than an invented figure.

export const CAREER_GOALS = 985; // ESPN goal tracker, after the hat-trick vs Al Kholood (2026)
export const TARGET = 1000;

// Career goals by shirt. Real Madrid 450, Manchester United 145, Juventus 101 and Sporting CP 5 are published career
// figures; Portugal is 146 (supplied by the owner). Al Nassr is still counting, so it is derived: the official career
// total minus the other four, and it moves up with every goal he scores.
const OTHERS = { madrid: 450, united: 145, juventus: 101, sporting: 5, portugal: 146 };
export const AL_NASSR_GOALS = CAREER_GOALS - Object.values(OTHERS).reduce((a, b) => a + b, 0);

export const ERAS: { club: string; goals: number; color: string; counting?: boolean; note?: string; years: string }[] = [
  { club: 'Real Madrid', goals: OTHERS.madrid, color: '#F4F4F4', years: '2009-18' },
  { club: 'Portugal', goals: OTHERS.portugal, color: '#C8102E', note: 'final', years: '2003-26' },
  { club: 'Manchester United', goals: OTHERS.united, color: '#FF7A59', years: '2003-09, 2021-22' },
  { club: 'Al Nassr', goals: AL_NASSR_GOALS, color: '#FFD100', counting: true, years: '2023-' },
  { club: 'Juventus', goals: OTHERS.juventus, color: '#9A9A9A', years: '2018-21' },
  { club: 'Sporting CP', goals: OTHERS.sporting, color: '#00A650', years: '2002-03' },
];

export const MILESTONES = [
  { n: 'Goal 1', what: 'Sporting CP, 2002' },
  { n: 'Goal 900', what: 'Portugal vs Croatia, 5 Sep 2024' },
  { n: 'Goal 985', what: 'Hat-trick vs Al Kholood, 2026' },
  { n: 'Portugal farewell', what: 'Retired from Portugal on 5 Nov 2026: 146 goals in 234 caps' },
  { n: 'Goal 986', what: 'Next. Call it before kickoff', next: true },
  { n: 'Goal 1,000', what: 'The 1,000 Wall opens' },
];

export type Moment = {
  id: string; tag: string; title: string; meta: string; tags: string[]; theme: 'red' | 'white' | 'gold';
  yt: string; channel: string; wide?: boolean; // YouTube video id; the uploader is credited on the Credits page
};

type Era = 'madrid' | 'portugal' | 'united' | 'nassr' | 'juve' | 'siu';
const ERA: Record<Era, { tag: string; theme: Moment['theme']; tags: string[] }> = {
  madrid: { tag: 'Real Madrid', theme: 'white', tags: ['madrid'] },
  portugal: { tag: 'Portugal', theme: 'red', tags: ['portugal'] },
  united: { tag: 'Man United', theme: 'red', tags: ['united'] },
  nassr: { tag: 'Al Nassr', theme: 'gold', tags: ['al-nassr'] },
  juve: { tag: 'Juventus', theme: 'white', tags: ['juventus'] },
  siu: { tag: 'SIUUU', theme: 'red', tags: ['celebration'] },
};
const v = (yt: string, title: string, channel: string, era: Era, extra: string[] = [], wide = false): Moment => ({
  id: 'v-' + yt, yt, title, channel, meta: '', wide, tag: ERA[era].tag, theme: ERA[era].theme, tags: [...ERA[era].tags, ...extra],
});

// Vertical YouTube Shorts and edits. Each id was looked up on YouTube, and the feed also skips any video that
// refuses to play in the viewer's browser (embedding can be switched off by the uploader at any time).
export const MOMENTS: Moment[] = [
  v('SpDSjdj8uuQ', 'Bicycle kick vs Juventus', 'Life Football', 'madrid', ['overhead', 'big-night']),
  v('-0T6JvFpCcQ', 'Hat-trick vs Atlético', 'LoyalFootball', 'juve', ['big-night', 'comeback']),
  v('jmlSSJhtt0s', 'Hat-trick vs Spain, World Cup 2018', 'FIFA', 'portugal', ['big-night', 'free-kick']),
  v('-cbmVoJrk3w', 'The epic SIUUU', 'cr7-8h', 'siu'),
  v('H19Cw7UNL5E', 'His best goal?', 'UEFA', 'madrid', ['big-night']),
  v('ucoOu480kHk', 'Bicycle kick for Al Nassr', 'FxWshorts', 'nassr', ['overhead']),
  v('FPVpkgd0Bys', 'The day he won Euro 2016', 'ay7aep', 'portugal', ['big-night', 'milestone']),
  v('K7iq6OcDen8', 'Hat-trick for goal 985', 'Vishalx7', 'nassr', ['milestone']),
  v('VKbE5kzRdMg', 'Goal 981 vs Neftchi Fergana', 'CR7IR', 'nassr'),
  v('2hD2Ec5Zi2o', 'Free kick vs Spain', 'GoalCrazeAe', 'portugal', ['free-kick', 'big-night']),
  v('qCotPp-1t_Y', 'First free kick of the season', 'TOUCHLINE', 'nassr', ['free-kick']),
  v('sq0g0sXD1Ug', '2008 prime at Man United', 'Mag1cks', 'united'),
  v('02vC3RnsOlQ', 'He promised. Then he delivered', 'Legacy Replays', 'juve', ['big-night']),
  v('YXQBw0FikP0', 'A goal and a last-minute winner', 'NexGoal', 'portugal', ['big-night', 'late']),
  v('f3i4Qr2rM80', 'Last-minute free kick', 'Obelix', 'nassr', ['free-kick', 'late']),
  v('y9Jawtz5AZ4', 'The legendary bicycle kick', 'Footy21', 'madrid', ['overhead', 'big-night']),
  v('fr_Knjrj5Gs', 'Ball control at 37', 'Heptic Aep', 'united'),
  v('JWeYgi5Y_r8', 'Aura edit, 4K', 'Louis Thomilson', 'united'),
  v('hgzRo5_-WJM', 'The cold hat-trick', 'ay7aep', 'madrid'),
  v('RU9X6yq0F2A', 'The origin of the SIU', 'FutDivision', 'siu'),
  v('51hVcWqJWLs', 'Goal 982 and a new celebration', 'Vishalx7', 'nassr', ['celebration']),
  v('fMilVnKndEs', 'Long-range strike', 'Gvozdo', 'portugal', ['long-range']),
  v('cv1YNmv0R04', 'Goal 964 vs Al Hazem', 'CR7IR', 'nassr'),
  v('VxHIt-MsXfE', 'Against Barcelona', 'Lucidaep', 'madrid', ['big-night']),
  v('pJpgv8XgkbM', 'Unreal bicycle kick vs Juventus', 'The Magic Boots', 'madrid', ['overhead']),
  v('XNq_Na6vmM4', 'Backheel goal at Euro 2016', 'ay7aep', 'portugal'),
  v('-4JW7BOeMns', 'Masterclass vs Derby, 2008', 'Cristiano cr7x', 'united', ['big-night']),
  v('rktzj1RjDVM', 'Free kick vs Al Kholood', 'RJ Production PK', 'nassr', ['free-kick']),
  v('EEo142oAOKM', 'Goal at the 2026 World Cup', 'GOAT Football Shorts', 'portugal', ['milestone', 'big-night']),
  v('Q-LJIAsUuz8', 'Dribbling skills', 'Samuel AEP', 'madrid'),
  v('8y_IVkxZELY', 'Goal 978 vs Al Taawoun', 'FTBL Tactics', 'nassr'),
  v('XTiMI6DFfm4', 'Hat-trick commentary, 4K', 'Heptic Aep', 'madrid'),
  v('ls2QOkF_TD8', 'Insane goals and the SIUUU', 'GOAL RUSH INSIDER', 'siu', ['compilation']),
  v('ElPmf9BbyZ4', 'All the bicycle kicks', 'Best Football Shorts', 'madrid', ['overhead']),
  v('YANLzDPCKJ4', 'Shooting power', 'Mythftbl', 'juve', ['long-range']),
  v('G6FFQKYfm8o', 'Prime debut for Real Madrid, 2009', 'Cristiano cr7x', 'madrid'),
  v('hyo38nmPgBA', 'Hat-trick comeback vs Al Kholood', '@xa07_Editx', 'nassr', ['comeback']),
  v('6W9TTH7Ql6Q', 'Goal vs Uzbekistan, World Cup 2026', 'Football Bawal', 'portugal', ['milestone']),
  v('k1guaG6GlFo', 'Never underestimate his speed', 'Hoanftbl', 'portugal'),
  v('VSy0FJy0LXA', 'The prime Manchester era', 'Footy-Flash', 'united'),
  v('HcZVGVQfK5g', 'Goal vs Al Taawoun', 'Football today HD', 'nassr'),
  v('u5BtGu_SbN4', 'The drop kick goal', 'Rubel racer', 'madrid', ['long-range']),
  v('oou3XtKGEOA', 'Never forget prime Ronaldo', 'BryanzyYT', 'united'),
  v('5auZex6w0jA', 'First 10/10 for Real Madrid', '7ARENA', 'madrid'),
  v('np41KkBYSBA', 'Man United vs Tottenham edit', 'Oldage_editx', 'united'),
  v('aDZFTmcinrk', 'Bicycle kick, 4K edit', 'cris7ronaldosiuuuu', 'madrid', ['overhead']),
  v('QE8v_pIddaA', 'Prime skills, 2011', 'Cristiano cr7x', 'madrid'),
  v('c_JlCriK3fY', 'Bicycle kick vs Juventus (full highlight)', 'Real Madrid', 'madrid', ['overhead', 'big-night'], true),
];

export type Team = { name: string; short: string; logo: string };
const logo = (id: string) => `https://a.espncdn.com/i/teamlogos/soccer/500/${id}.png`;
export const TEAMS: Record<string, Team> = {
  nassr: { name: 'Al Nassr', short: 'NAS', logo: logo('817') },
  ahli: { name: 'Al Ahli', short: 'AHL', logo: logo('8346') },
  sadd: { name: 'Al Sadd', short: 'SAD', logo: logo('7135') },
  hazem: { name: 'Al Hazem', short: 'HAZ', logo: logo('21964') },
  kholood: { name: 'Al Kholood', short: 'KHO', logo: logo('22028') },
};

// Al Nassr fixtures from ESPN's public schedule (checked 10 Nov 2026). He retired from Portugal on 5 Nov 2026,
// so his next matches are all Al Nassr. Kickoff times are UTC.
export type Fixture = { id: string; home: Team; away: Team; kickoff: string; comp: string; venue: string; city: string };
export const FIXTURES: Fixture[] = [
  { id: 'ahl-nas-2026-11-20', home: TEAMS.ahli, away: TEAMS.nassr, kickoff: '2026-11-20T17:30:00Z', comp: 'Saudi Pro League', venue: 'King Abdullah Sports City', city: 'Jeddah' },
  { id: 'nas-sad-2026-11-24', home: TEAMS.nassr, away: TEAMS.sadd, kickoff: '2026-11-24T18:15:00Z', comp: 'AFC Champions League Elite', venue: 'Al-Awwal Park', city: 'Riyadh' },
  { id: 'haz-nas-2026-11-28', home: TEAMS.hazem, away: TEAMS.nassr, kickoff: '2026-11-28T12:15:00Z', comp: 'Saudi Pro League', venue: 'King Abdullah Sport City Stadium', city: 'Buraidah' },
  { id: 'nas-kho-2026-12-01', home: TEAMS.nassr, away: TEAMS.kholood, kickoff: '2026-12-01T17:00:00Z', comp: "King's Cup", venue: 'Al-Awwal Park', city: 'Riyadh' },
];
export const opponentOf = (f: Fixture) => (f.home.name === 'Al Nassr' ? f.away : f.home);
// the first fixture that has not kicked off yet
export const nextFixture = (now = Date.now()) => FIXTURES.find((f) => new Date(f.kickoff).getTime() > now) ?? FIXTURES[FIXTURES.length - 1];
export const NEXT_MATCH = FIXTURES[0];
