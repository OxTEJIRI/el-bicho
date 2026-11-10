'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFan } from '@/components/Fan';
import { MOMENTS, type Moment } from '@/lib/data';
import { THEMES } from '@/lib/themes';
import type { Taste } from '@/components/Reactions';

const FILTERS: [string, string | null][] = [['All', null], ['Portugal', 'portugal'], ['Madrid', 'madrid'], ['United', 'united'], ['Juventus', 'juventus'], ['Al Nassr', 'al-nassr']];
const RAIL: [string, string][] = [['WOW', 'Unreal'], ['SIUUU', 'SIUUU'], ['TEARS', 'Tears'], ['MEMORY', 'Remember']];

function Reel({ m, playing, setPlaying, onNext, status, setStatus, setTaste }: {
  m: Moment; playing: string | null; setPlaying: (id: string | null) => void; onNext: () => void;
  status: string; setStatus: (s: string) => void; setTaste: (t: Taste) => void;
}) {
  const { fanId } = useFan();
  const ref = useRef<HTMLElement>(null);
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [note, setNote] = useState('');
  const photo = THEMES[m.theme];
  const isPlaying = playing === m.id;

  // stop the video when its card scrolls out of view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) setPlaying(null); }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [setPlaying]);

  async function react(reaction: string, memory = '') {
    if (!fanId || busy) return;
    setBusy(true);
    setStatus('Saving to your memory on Walrus…');
    try {
      const res = await fetch('/api/react', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fanId, momentId: m.id, reaction, note: memory }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPicked((p) => ({ ...p, [reaction]: true }));
      setTaste(data.taste);
      setStatus(data.taste?.profile ? `Learned: ${data.taste.profile} Your picks just changed.` : 'Saved to your memory on Walrus.');
    } catch (e) {
      setStatus((e as Error).message || 'Could not save that. Try again.');
    } finally {
      setBusy(false);
    }
  }

  function tap(reaction: string) {
    if (reaction === 'Remember') { setSheet((v) => !v); return; }
    void react(reaction);
  }

  return (
    <article ref={ref} className="reel" id={m.id} aria-label={m.title}>
      <div className="media" style={{ position: 'absolute', inset: 0 }}>
        <img src={photo.photo} alt="" aria-hidden="true" style={{ objectPosition: photo.pos }} />
      </div>
      <div className="reel-seven display" aria-hidden="true">7</div>
      <div className="reel-top" />
      <div className="reel-bottom" />

      <div className="reel-video">
        {isPlaying ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${m.yt}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
            title={m.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button className="reel-play" onClick={() => setPlaying(m.id)} aria-label={`Play ${m.title}`}>
            <img src={`https://i.ytimg.com/vi/${m.yt}/hqdefault.jpg`} alt="" aria-hidden="true" loading="lazy" />
            <span className="reel-playbtn"><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg></span>
          </button>
        )}
      </div>

      <div className="reel-info">
        <span className="live" style={{ borderRadius: 6 }}>{m.tag.toUpperCase()}</span>
        <h2 className="display" style={{ fontSize: 'clamp(30px, 8vw, 44px)', lineHeight: 1, margin: '8px 0 0' }}>{m.title.toUpperCase()}</h2>
        <div style={{ fontSize: 13, opacity: .85, marginTop: 6 }}>{m.meta}</div>
        <a className="reel-credit" href={`https://www.youtube.com/watch?v=${m.yt}`} target="_blank" rel="noreferrer">Video: {m.channel} on YouTube</a>
        {sheet && (
          <div className="reel-sheet">
            <label className="eyebrow" htmlFor={`note-${m.id}`} style={{ color: 'var(--accent2)' }}>Where were you?</label>
            <textarea id={`note-${m.id}`} value={note} onChange={(e) => setNote(e.target.value)} maxLength={280} rows={2} placeholder="Watching with my brother, the whole room went quiet" />
            <button className="btn" style={{ width: '100%', minHeight: 44 }} disabled={busy || !note.trim()} onClick={() => { void react('Remember', note); setNote(''); setSheet(false); }}>Save to my memory</button>
          </div>
        )}
        <div className="reel-status" role="status">{status}</div>
      </div>

      <div className="reel-rail">
        {RAIL.map(([label, reaction]) => (
          <button key={reaction} className={'reel-r' + (picked[reaction] ? ' on' : '')} disabled={busy && reaction !== 'Remember'} onClick={() => tap(reaction)} aria-pressed={!!picked[reaction]}>{label}</button>
        ))}
        <button className="reel-r" onClick={onNext} aria-label="Next moment">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </button>
      </div>
    </article>
  );
}

export default function RelivePage() {
  const { fanId } = useFan();
  const [filter, setFilter] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [taste, setTaste] = useState<Taste | null>(null);
  const [status, setStatus] = useState('Tap play, then react. Every reaction teaches El Bicho your taste.');
  const feed = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fanId) return;
    fetch('/api/taste?fanId=' + fanId).then((r) => r.json()).then((d) => setTaste(d.taste)).catch(() => {});
  }, [fanId]);

  // order once from what El Bicho already knows about this fan, then keep it steady while they scroll
  const ordered = useMemo(() => {
    const order = taste?.picks ?? [];
    const rank = (id: string) => { const i = order.indexOf(id); return i < 0 ? 99 : i; };
    return [...MOMENTS].sort((a, b) => rank(a.id) - rank(b.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taste?.picks?.join(',')]);
  const list = filter ? ordered.filter((m) => m.tags.includes(filter)) : ordered;

  function next(i: number) {
    const el = feed.current?.children[i + 1] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="reels-wrap">
      <div className="reels-filters" role="group" aria-label="Filter by era">
        {FILTERS.map(([label, key]) => (
          <button key={label} className="chip" style={{ minHeight: 36 }} aria-pressed={filter === key} onClick={() => { setFilter(key); setPlaying(null); feed.current?.scrollTo({ top: 0 }); }}>{label}</button>
        ))}
      </div>
      <div className="reels" ref={feed}>
        {list.map((m, i) => (
          <Reel key={m.id} m={m} playing={playing} setPlaying={setPlaying} onNext={() => next(i)} status={status} setStatus={setStatus} setTaste={setTaste} />
        ))}
      </div>
    </div>
  );
}
