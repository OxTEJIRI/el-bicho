'use client';

import { MOMENTS } from '@/lib/data';
import { THEMES } from '@/lib/themes';
import { Reactions } from '@/components/Reactions';

export default function RelivePage() {
  return (
    <section className="wrap" style={{ paddingTop: 8, paddingBottom: 24 }}>
      <div className="eyebrow" style={{ color: 'var(--accent2)' }}>Relive</div>
      <h1 className="display" style={{ fontSize: 'clamp(44px,8vw,88px)', margin: '6px 0 18px', lineHeight: .95 }}>THE GREATEST</h1>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {MOMENTS.map((m) => (
          <article key={m.id} id={m.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="media" style={{ height: 260 }}>
              <img src={THEMES[m.theme].photo} alt="" aria-hidden="true" style={{ objectPosition: THEMES[m.theme].pos }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,.85))' }} />
              <div style={{ position: 'absolute', left: 16, right: 16, bottom: 14, color: '#fff' }}>
                <div className="eyebrow" style={{ color: 'var(--accent2)' }}>{m.tag}</div>
                <div className="display" style={{ fontSize: 30, lineHeight: 1 }}>{m.title.toUpperCase()}</div>
                <div style={{ fontSize: 13, opacity: .85 }}>{m.meta}</div>
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <Reactions momentId={m.id} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
