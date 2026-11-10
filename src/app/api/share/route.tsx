import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

const T = {
  red: { bg: '#8E120B', accent: '#FFFFFF', gold: '#F5C542', ink: '#FFFFFF', photo: 'portugal', credit: 'Photo: Анна Нэсси, CC BY-SA 3.0' },
  white: { bg: '#D9CCAA', accent: '#141414', gold: '#8C6A12', ink: '#141414', photo: 'madrid', credit: 'Photo: KANO PHOTO, CC BY-SA 2.0' },
  gold: { bg: '#1A2F73', accent: '#FFD100', gold: '#FFD100', ink: '#FFFFFF', photo: 'alnassr', credit: 'Photo: Mehrdad Esfahani / Mehr News' },
} as const;

// A 9:16 story card for a locked call: GET /api/share?g=986&pick=...&cp=...&who=...&theme=red
export async function GET(req: Request) {
  const u = new URL(req.url);
  const theme = (['red', 'white', 'gold'].includes(u.searchParams.get('theme') || '') ? u.searchParams.get('theme') : 'red') as keyof typeof T;
  const t = T[theme];
  const g = (u.searchParams.get('g') || '986').replace(/\D/g, '').slice(0, 4) || '986';
  const pick = (u.searchParams.get('pick') || 'Scores').slice(0, 60);
  const cp = (u.searchParams.get('cp') || '').replace(/\D/g, '').slice(0, 12);
  const who = (u.searchParams.get('who') || 'a fan').slice(0, 24);
  const photo = `${u.origin}/photos/${t.photo}.jpg`;

  return new ImageResponse(
    (
      <div style={{ width: 1080, height: 1920, display: 'flex', position: 'relative', background: t.bg, color: t.ink, fontFamily: 'sans-serif' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" width={1080} height={1920} style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 1920, objectFit: 'cover', opacity: 0.6 }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 1920, background: 'rgba(0,0,0,0.38)', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 1920, display: 'flex', flexDirection: 'column', padding: '90px 70px 80px 70px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: 6, color: '#fff', display: 'flex' }}>EL BICHO</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 2, background: t.accent, color: t.accent === '#FFFFFF' ? '#8E120B' : t.accent === '#141414' ? '#fff' : '#071029', padding: '12px 22px', borderRadius: 12, display: 'flex' }}>ROAD TO 1,000</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: 5, color: t.gold, display: 'flex' }}>I CALLED IT</div>
            <div style={{ fontSize: 330, fontWeight: 700, lineHeight: 0.9, color: '#fff', display: 'flex' }}>{'#' + g}</div>
            <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, color: '#fff', marginTop: 24, display: 'flex' }}>{pick.toUpperCase()}</div>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 56, paddingTop: 36, borderTop: '3px solid rgba(255,255,255,0.4)', fontSize: 38, color: '#fff' }}>
              <div style={{ display: 'flex' }}>{who}</div>
              <div style={{ display: 'flex', opacity: 0.8, marginTop: 8 }}>{cp ? `Stamped on Sui · checkpoint ${cp}` : 'Stamped on Sui'}</div>
              <div style={{ display: 'flex', opacity: 0.7, marginTop: 8, fontSize: 30 }}>Call the next one at el-bicho-cr7.vercel.app</div>
              <div style={{ display: 'flex', flexDirection: 'column', opacity: 0.6, marginTop: 20, fontSize: 22 }}><div style={{ display: 'flex' }}>{t.credit}</div><div style={{ display: 'flex' }}>Fan project, not affiliated with Cristiano Ronaldo or his clubs</div></div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920 },
  );
}
