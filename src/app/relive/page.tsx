'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFan } from '@/components/Fan';
import { MOMENTS, type Moment } from '@/lib/data';
import { playSfx, preloadSfx, SFX_FOR_REACTION } from '@/lib/sfx';
import { loadYT } from '@/lib/yt';
import { THEMES } from '@/lib/themes';
import type { Taste } from '@/components/Reactions';

const FILTERS: [string, string | null][] = [['For you', null], ['Portugal', 'portugal'], ['Madrid', 'madrid'], ['United', 'united'], ['Al Nassr', 'al-nassr'], ['SIUUU', 'celebration']];
const RAIL: { label: string; reaction: string; icon: string }[] = [
  { label: 'WOW', reaction: 'Unreal', icon: 'M12 2l2.4 6.6L21 9l-5 4.4L17.5 20 12 16.5 6.5 20 8 13.4 3 9l6.6-.4z' },
  { label: 'SIUUU', reaction: 'SIUUU', icon: 'M13 2L4 14h6l-1 8 9-12h-6z' },
  { label: 'TEARS', reaction: 'Tears', icon: 'M12 3s6 6.2 6 10.5A6 6 0 0 1 6 13.5C6 9.2 12 3 12 3z' },
  { label: 'MEMORY', reaction: 'Remember', icon: 'M5 4h14v16l-7-4-7 4z' },
];

type Burst = { id: number; text: string; x: number };

function Reel({ m, active, onActive, onBroken, soundOn, setSoundOn, setTaste, setStatus, status }: {
  m: Moment; active: boolean; onActive: (id: string) => void; onBroken: (id: string) => void;
  soundOn: boolean; setSoundOn: (v: boolean) => void; setTaste: (t: Taste) => void; setStatus: (s: string) => void; status: string;
}) {
  const { fanId } = useFan();
  const ref = useRef<HTMLElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [note, setNote] = useState('');
  const [bursts, setBursts] = useState<Burst[]>([]);
  const photo = THEMES[m.theme];

  // tell the page when this card is the one on screen
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) onActive(m.id); }, { threshold: 0.65 });
    io.observe(el);
    return () => io.disconnect();
  }, [m.id, onActive]);

  // play only the card on screen; tear the player down when it leaves
  useEffect(() => {
    if (!active) {
      try { player.current?.destroy(); } catch { /* already gone */ }
      player.current = null; setPlaying(false); setPaused(false); setProgress(0);
      return;
    }
    let dead = false;
    loadYT().then((YT) => {
      if (dead || !host.current) return;
      const slot = document.createElement('div');
      host.current.innerHTML = '';
      host.current.appendChild(slot);
      player.current = new YT.Player(slot, {
        width: '100%', height: '100%', videoId: m.yt,
        playerVars: { autoplay: 1, mute: soundOn ? 0 : 1, controls: 0, playsinline: 1, rel: 0, modestbranding: 1, loop: 1, playlist: m.yt, iv_load_policy: 3, fs: 0, disablekb: 1 },
        events: {
          onReady: (e: any) => { try { soundOn ? e.target.unMute() : e.target.mute(); e.target.playVideo(); } catch { /* ignore */ } },
          onStateChange: (e: any) => { if (e.data === 1) { setPlaying(true); setPaused(false); } if (e.data === 2) setPaused(true); },
          onError: () => onBroken(m.id), // embedding off, removed or region-blocked: skip it
        },
      });
    }).catch(() => onBroken(m.id));
    return () => { dead = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, m.yt]);

  useEffect(() => { try { soundOn ? player.current?.unMute?.() : player.current?.mute?.(); } catch { /* ignore */ } }, [soundOn]);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      try { const d = player.current?.getDuration?.(); if (d) setProgress(player.current.getCurrentTime() / d); } catch { /* ignore */ }
    }, 250);
    return () => clearInterval(t);
  }, [active]);

  function tapVideo() {
    if (!soundOn) { setSoundOn(true); return; } // the first tap turns the sound on
    try { paused ? player.current?.playVideo() : player.current?.pauseVideo(); } catch { /* ignore */ }
  }

  async function react(reaction: string, label: string, memory = '') {
    playSfx(SFX_FOR_REACTION[reaction]);
    const id = Date.now() + Math.random();
    setBursts((b) => [...b, { id, text: label === 'MEMORY' ? 'SAVED' : label + '!', x: 20 + Math.random() * 60 }]);
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1100);
    setPicked((p) => ({ ...p, [reaction]: true }));
    if (!fanId || busy) return;
    setBusy(true);
    setStatus('Saving to your memory on Walrus…');
    try {
      const res = await fetch('/api/react', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fanId, momentId: m.id, reaction, note: memory }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTaste(data.taste);
      setStatus(data.taste?.profile ? `Learned: ${data.taste.profile}` : 'Saved to your memory on Walrus.');
    } catch (e) {
      setStatus((e as Error).message || 'Could not save that. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <article ref={ref} className="reel" id={m.id} aria-label={m.title}>
      <div className="media" style={{ position: 'absolute', inset: 0 }}>
        <img src={photo.photo} alt="" aria-hidden="true" style={{ objectPosition: photo.pos }} />
      </div>

      <div className={'reel-stage' + (m.wide ? ' wide' : '')}>
        {!playing && <img className="reel-poster" src={`https://i.ytimg.com/vi/${m.yt}/hqdefault.jpg`} alt="" aria-hidden="true" />}
        <div ref={host} className="reel-host" />
        {active && !playing && <div className="reel-loading" aria-hidden="true"><i /></div>}
      </div>

      {/* a plain layer over the player: taps play, pause and unmute, and vertical swipes still scroll the feed */}
      <button className="reel-tap" onClick={tapVideo} aria-label={paused ? 'Play' : soundOn ? 'Pause' : 'Turn the sound on'}>
        {paused && <span className="reel-pauseicon" aria-hidden="true"><svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg></span>}
        {active && playing && !soundOn && <span className="reel-soundhint">TAP FOR SOUND</span>}
      </button>

      <div className="reel-shade" />
      <div className="reel-bursts" aria-hidden="true">
        {bursts.map((b) => <span key={b.id} className="burst display" style={{ left: `${b.x}%` }}>{b.text}</span>)}
      </div>

      <div className="reel-info">
        <span className="pill">{m.tag.toUpperCase()}</span>
        <h2 className="display reel-title">{m.title.toUpperCase()}</h2>
        {sheet && (
          <div className="reel-sheet">
            <label className="eyebrow" htmlFor={`note-${m.id}`} style={{ color: 'var(--accent2)' }}>Where were you?</label>
            <textarea id={`note-${m.id}`} value={note} onChange={(e) => setNote(e.target.value)} maxLength={280} rows={2} placeholder="Watching with my brother, the whole room went quiet" />
            <button className="btn" style={{ width: '100%', minHeight: 44 }} disabled={busy || !note.trim()} onClick={() => { void react('Remember', 'MEMORY', note); setNote(''); setSheet(false); }}>Save to my memory</button>
          </div>
        )}
        <div className="reel-status" role="status">{status}</div>
      </div>

      <div className="reel-rail">
        {RAIL.map((r) => (
          <button key={r.reaction} className={'reel-r' + (picked[r.reaction] ? ' on' : '')} aria-pressed={!!picked[r.reaction]} aria-label={r.label}
            onClick={() => (r.reaction === 'Remember' ? (playSfx('memory'), setSheet((v) => !v)) : void react(r.reaction, r.label))}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={picked[r.reaction] ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d={r.icon} /></svg>
            <span>{r.label}</span>
          </button>
        ))}
        <button className={'reel-r' + (soundOn ? ' on' : '')} aria-pressed={soundOn} aria-label={soundOn ? 'Mute video' : 'Unmute video'} onClick={() => setSoundOn(!soundOn)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4z" />{soundOn ? <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /> : <path d="M16 9l5 6M21 9l-5 6" />}</svg>
          <span>{soundOn ? 'SOUND' : 'MUTED'}</span>
        </button>
      </div>

      <div className="reel-progress" aria-hidden="true"><i style={{ width: `${progress * 100}%` }} /></div>
    </article>
  );
}

export default function RelivePage() {
  const { fanId } = useFan();
  const [filter, setFilter] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [broken, setBroken] = useState<string[]>([]);
  const [soundOn, setSoundOn] = useState(false);
  const [taste, setTaste] = useState<Taste | null>(null);
  const [status, setStatus] = useState('Tap a reaction. Every one teaches El Bicho your taste.');
  const feed = useRef<HTMLDivElement>(null);

  useEffect(() => {
    preloadSfx();
    try { const raw = sessionStorage.getItem('elbicho.broken'); if (raw) setBroken(JSON.parse(raw)); } catch { /* none */ }
  }, []);
  useEffect(() => {
    if (!fanId) return;
    fetch('/api/taste?fanId=' + fanId).then((r) => r.json()).then((d) => setTaste(d.taste)).catch(() => {});
  }, [fanId]);

  // order once from what El Bicho knows about this fan, then keep it steady while they scroll
  const ordered = useMemo(() => {
    const order = taste?.picks ?? [];
    const rank = (id: string) => { const i = order.indexOf(id); return i < 0 ? 99 : i; };
    return [...MOMENTS].sort((a, b) => rank(a.id) - rank(b.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taste?.picks?.join(',')]);
  const list = (filter ? ordered.filter((m) => m.tags.includes(filter)) : ordered).filter((m) => !broken.includes(m.id));

  const onBroken = useCallback((id: string) => {
    setBroken((b) => {
      if (b.includes(id)) return b;
      const next = [...b, id];
      try { sessionStorage.setItem('elbicho.broken', JSON.stringify(next)); } catch { /* private mode */ }
      return next;
    });
  }, []);
  const onActive = useCallback((id: string) => setActiveId(id), []);

  return (
    <div className="reels-wrap">
      <div className="reels-filters" role="group" aria-label="Filter by era">
        {FILTERS.map(([label, key]) => (
          <button key={label} className="chip" style={{ minHeight: 36 }} aria-pressed={filter === key} onClick={() => { setFilter(key); setActiveId(null); feed.current?.scrollTo({ top: 0 }); }}>{label}</button>
        ))}
      </div>
      <div className="reels" ref={feed}>
        {list.map((m) => (
          <Reel key={m.id} m={m} active={activeId === m.id} onActive={onActive} onBroken={onBroken} soundOn={soundOn} setSoundOn={setSoundOn} setTaste={setTaste} setStatus={setStatus} status={status} />
        ))}
        {list.length === 0 && <div className="reel" style={{ display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}><p className="muted">No playable videos here right now. Try another filter.</p></div>}
      </div>
    </div>
  );
}
