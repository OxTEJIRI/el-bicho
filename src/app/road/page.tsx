import { CAREER_GOALS, ERAS, MILESTONES, TARGET } from '@/lib/data';

export default function RoadPage() {
  const max = Math.max(...ERAS.map((e) => e.goals ?? 0));
  return (
    <section className="wrap" style={{ paddingTop: 8, paddingBottom: 24 }}>
      <div className="eyebrow" style={{ color: 'var(--accent2)' }}>The road</div>
      <h1 className="display" style={{ fontSize: 'clamp(48px,9vw,120px)', margin: '6px 0 18px', lineHeight: .9 }}>
        {CAREER_GOALS} GOALS.<br /><span style={{ color: 'var(--accent)' }}>{TARGET - CAREER_GOALS} TO GO.</span>
      </h1>

      <div className="split">
        <div className="card">
          <div className="eyebrow">Goals by shirt</div>
          <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
            {ERAS.map((e) => (
              <div key={e.club} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 10, height: 30, borderRadius: 4, background: e.color, border: '1px solid var(--line)' }} />
                <span style={{ width: 150, fontWeight: 800 }}>{e.club}</span>
                <span style={{ flex: 1, height: 10, borderRadius: 5, background: 'var(--line)', overflow: 'hidden' }}>
                  <span style={{ display: 'block', height: '100%', width: e.goals ? `${(e.goals / max) * 100}%` : '0%', background: 'var(--accent)' }} />
                </span>
                <span className="display" style={{ width: 56, textAlign: 'right', fontSize: 24 }}>{e.goals ?? '—'}</span>
              </div>
            ))}
          </div>
          <p className="muted" style={{ fontSize: 12, marginBottom: 0 }}>Portugal and Al Nassr totals are being verified before they go up.</p>
        </div>
        <div className="card" style={{ background: 'var(--accent)', color: 'var(--on-accent)', border: 0 }}>
          <div className="eyebrow" style={{ color: 'inherit', opacity: .85 }}>Goal 1,000 forecast</div>
          <div className="display" style={{ fontSize: 40, lineHeight: 1, marginTop: 8 }}>LEARNING</div>
          <p style={{ margin: '8px 0 0', opacity: .9 }}>The forecast starts once the next fixtures are in, then narrows after every match. Each update is saved to Walrus, so you can watch it learn.</p>
        </div>
      </div>

      <h2 className="display" style={{ fontSize: 34, margin: '30px 0 14px' }}>MILESTONES</h2>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
        {MILESTONES.map((m) => (
          <li key={m.n}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', border: '3px solid var(--accent)', background: m.next ? 'var(--accent)' : 'transparent' }} />
            <div className="display" style={{ fontSize: 26, marginTop: 10 }}>{m.n.toUpperCase()}</div>
            <div className="muted" style={{ fontSize: 14 }}>{m.what}</div>
          </li>
        ))}
      </ol>
    </section>
  );
}
