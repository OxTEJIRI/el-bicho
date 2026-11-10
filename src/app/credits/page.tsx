import { MOMENTS } from '@/lib/data';

export const metadata = { title: 'Credits · El Bicho' };

const PHOTOS = [
  { kit: 'Portugal', file: 'Cristiano Ronaldo 2018.jpg', by: 'Анна Нэсси', licence: 'CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Cristiano_Ronaldo_2018.jpg' },
  { kit: 'Real Madrid', file: 'Cristiano Ronaldo Madrid.jpg', by: 'KANO PHOTO', licence: 'CC BY-SA 2.0', url: 'https://commons.wikimedia.org/wiki/File:Cristiano_Ronaldo_Madrid.jpg' },
  { kit: 'Al Nassr', file: 'Cristiano Ronaldo with Al Nassr, 19 September 2023 - 83.jpg', by: 'Mehrdad Esfahani / Mehr News Agency', licence: 'Attribution', url: 'https://commons.wikimedia.org/wiki/File:Cristiano_Ronaldo_with_Al_Nassr,_19_September_2023_-_83.jpg' },
];

export default function Credits() {
  return (
    <section className="wrap" style={{ maxWidth: 760, paddingTop: 8, paddingBottom: 32 }}>
      <div className="eyebrow">Credits</div>
      <h1 className="display" style={{ fontSize: 'clamp(40px,8vw,72px)', margin: '6px 0 14px', lineHeight: 0.95 }}>WHO MADE WHAT</h1>
      <p className="muted">El Bicho is a fan-made project. It isn&apos;t affiliated with Cristiano Ronaldo, his clubs, or any league. Everything below belongs to its creators.</p>

      <h2 className="display" style={{ fontSize: 26, margin: '24px 0 8px' }}>PHOTOS</h2>
      <div className="card">
        {PHOTOS.map((p) => (
          <p key={p.kit} style={{ margin: '0 0 10px', fontSize: 14 }}>
            <b>{p.kit}:</b> <a href={p.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent2)' }}>{p.file}</a> by {p.by}, {p.licence}, from Wikimedia Commons.
          </p>
        ))}
      </div>

      <h2 className="display" style={{ fontSize: 26, margin: '24px 0 8px' }}>VIDEOS</h2>
      <div className="card">
        <p className="muted" style={{ marginTop: 0, fontSize: 14 }}>Every video plays through YouTube&apos;s own player, from the uploader&apos;s channel.</p>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, columns: 2, columnGap: 24 }}>
          {MOMENTS.map((m) => (
            <li key={m.id} style={{ breakInside: 'avoid', marginBottom: 6 }}>
              <a href={`https://www.youtube.com/watch?v=${m.yt}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent2)' }}>{m.title}</a> · {m.channel}
            </li>
          ))}
        </ul>
      </div>

      <h2 className="display" style={{ fontSize: 26, margin: '24px 0 8px' }}>DATA AND SOUNDS</h2>
      <div className="card" style={{ fontSize: 14 }}>
        <p style={{ marginTop: 0 }}>Career total from the ESPN goal tracker. Match log from ESPN&apos;s public game log. Memories on Walrus, Sui reads through Tatum.</p>
        <p style={{ marginBottom: 0 }}>Reaction sounds were voiced with Kokoro-82M, a text-to-speech model, as imitations. They are not recordings of anyone.</p>
      </div>
    </section>
  );
}
