"""Builds data/matches.json from ESPN's public player game log (Ronaldo, id 22774).
Walks season x team x league, keeps one row per match (date, opponent, home/away, competition, goals),
and assigns each goal its career number by counting backwards from the official total."""
import json, sys, io, os, time, urllib.request

TOTAL = 985  # ESPN goal tracker, official career goals after the Al Kholood hat-trick
BASE = 'https://site.web.api.espn.com/apis/common/v3/sports/soccer/athletes/22774/gamelog'
TEAMS = ['817', '111', '360', '482', '86']


def get(params):
    url = BASE + ('?' + params if params else '')
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            return json.load(urllib.request.urlopen(req, timeout=30))
        except Exception:
            time.sleep(1.5)
    return {}


rows = {}


def take(d):
    if 'events' not in d or 'names' not in d:
        return 0
    gi = d['names'].index('totalGoals')
    stats = {}
    for st in d.get('seasonTypes', []):
        for cat in st.get('categories', []):
            for ev in cat.get('events', []):
                stats[ev['eventId']] = ev['stats']
    n = 0
    for eid, e in d['events'].items():
        if eid not in stats:
            continue
        try:
            g = int(float(stats[eid][gi]))
        except Exception:
            g = 0
        rows[eid] = {
            'id': eid,
            'date': e['gameDate'][:10],
            'opponent': e['opponent']['displayName'],
            'home': e['atVs'] == 'vs',
            'comp': e.get('leagueShortName') or e.get('leagueName'),
            'team': e['team']['abbreviation'],
            'score': e.get('score'),
            'goals': g,
        }
        n += 1
    return n


for season in range(2022, 2027):
    for team in TEAMS:
        base = f'season={season}&team={team}'
        d = get(base)
        leagues = []
        for f in d.get('filters', []):
            if f['name'] == 'league':
                leagues = [o['value'] for o in f['options']]
        take(d)
        for lg in leagues:
            take(get(f'{base}&league={lg}'))
        print(season, team, 'leagues', len(leagues), 'rows so far', len(rows), file=sys.stderr)

ms = sorted(rows.values(), key=lambda r: (r['date'], r['id']))
run = TOTAL
for m in reversed(ms):
    m['careerAfter'] = run
    run -= m['goals']
    m['careerBefore'] = run
out = {'source': 'ESPN public game log, athlete 22774', 'officialTotal': TOTAL, 'firstMatch': ms[0]['date'], 'lastMatch': ms[-1]['date'], 'matches': ms}
os.makedirs('data', exist_ok=True)
json.dump(out, open('data/matches.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
print('matches', len(ms), 'from', ms[0]['date'], 'to', ms[-1]['date'], 'goals in log', sum(m['goals'] for m in ms), 'implied career goals before first match', ms[0]['careerBefore'])
for m in ms:
    if m['careerBefore'] < 900 <= m['careerAfter']:
        print('GOAL 900 lands in:', m['date'], m['team'], 'vs', m['opponent'], m['comp'], 'goals', m['goals'])
