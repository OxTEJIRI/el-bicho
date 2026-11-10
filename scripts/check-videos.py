"""Looks up each YouTube id with oEmbed: real channel name, title, and whether embedding is allowed (HTTP 200)."""
import json, sys, io, urllib.request, urllib.error, concurrent.futures as cf
ids = sys.argv[1:]
def look(i):
    url = f'https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v={i}'
    try:
        d = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=15))
        return i, 200, d.get('author_name', ''), d.get('title', '')
    except urllib.error.HTTPError as e:
        return i, e.code, '', ''
    except Exception:
        return i, 0, '', ''
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
with cf.ThreadPoolExecutor(12) as ex:
    for i, c, a, t in ex.map(look, ids):
        print(f'{i} | {c} | {a} | {t[:80]}')
