'use client';

import { useEffect, useState } from 'react';
import { playSfx, preloadSfx, SFX_FOR_REACTION } from '@/lib/sfx';
import { useFan } from './Fan';

export type Taste = { profile: string | null; top: string[]; reactions: number; picks: string[] };

const REACTIONS = ['Unreal', 'SIUUU', 'Tears', 'Remember'] as const;

export function Reactions({ momentId, onTaste }: { momentId: string; onTaste?: (t: Taste) => void }) {
  const { fanId } = useFan();
  const [picked, setPicked] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('Every reaction teaches El Bicho your taste.');
  const [busy, setBusy] = useState(false);

  useEffect(() => { preloadSfx(); }, []);

  async function send(reaction: string) {
    playSfx(SFX_FOR_REACTION[reaction]);
    if (!fanId || busy) return;
    if (reaction === 'Remember' && !note.trim()) {
      setPicked('Remember');
      setStatus('Write where you were, then tap Remember again.');
      return;
    }
    setPicked(reaction);
    setBusy(true);
    setStatus('Saving to your memory on Walrus…');
    try {
      const res = await fetch('/api/react', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fanId, momentId, reaction, note: reaction === 'Remember' ? note : '' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onTaste?.(data.taste);
      setStatus(data.taste?.profile ? `Learned: ${data.taste.profile} Your picks just changed.` : 'Saved to your memory on Walrus.');
      if (reaction === 'Remember') setNote('');
    } catch (e) {
      setStatus((e as Error).message || 'Could not save that. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="reactions">
        {REACTIONS.map((r) => (
          <button key={r} className="reaction" aria-pressed={picked === r} disabled={busy} onClick={() => send(r)}>{r}</button>
        ))}
      </div>
      {picked === 'Remember' && (
        <label style={{ display: 'block', marginTop: 10 }}>
          <span className="eyebrow">Where were you?</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={280} rows={2} placeholder="Watching at my uncle's place, the whole street screamed" style={{ width: '100%', marginTop: 6, borderRadius: 14, border: '1px solid var(--line)', background: 'var(--digit)', color: 'var(--ink)', padding: 12, font: 'inherit' }} />
        </label>
      )}
      <div className="learned" role="status">{status}</div>
    </div>
  );
}
