'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { THEMES, THEME_KEYS } from '@/lib/themes';
import { useFan } from './Fan';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/relive', label: 'Relive' },
  { href: '/road', label: 'Road to 1,000' },
  { href: '/call', label: 'Call it' },
];

export function TopBar() {
  const path = usePathname();
  const { theme, setTheme } = useFan();
  return (
    <header className="wrap topbar">
      <Link href="/" className="display wordmark">EL BICHO</Link>
      <nav className="desk-links" aria-label="Main">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} aria-current={path === l.href ? 'page' : undefined}>{l.label}</Link>
        ))}
      </nav>
      <div className="kits" role="group" aria-label="Kit theme">
        {THEME_KEYS.map((k) => (
          <button key={k} className="kit" aria-pressed={theme === k} aria-label={`${THEMES[k].label} kit, ${THEMES[k].kit}`} onClick={() => setTheme(k)}>
            <span className="dot" style={{ background: THEMES[k].swatch }} />
            <span className="name">{THEMES[k].label}</span>
          </button>
        ))}
      </div>
    </header>
  );
}

const Icon = ({ d }: { d: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

export function BottomNav() {
  const path = usePathname();
  const cur = (h: string) => (path === h ? 'page' : undefined);
  return (
    <nav className="bottomnav" aria-label="Main">
      <Link href="/" aria-current={cur('/')}><Icon d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />Home</Link>
      <Link href="/relive" aria-current={cur('/relive')}><Icon d="M6 3h12v18H6zM10 9l5 3-5 3z" />Relive</Link>
      <Link href="/call" className="fab" aria-label="Call it" aria-current={cur('/call')}>CALL</Link>
      <Link href="/road" aria-current={cur('/road')}><Icon d="M4 20l5-6 4 3 7-10M15 7h5v5" />Road</Link>
      <a href="https://memory.walrus.xyz/dashboard" target="_blank" rel="noreferrer"><Icon d="M12 3l8 4v6c0 4.5-3.5 7.5-8 9-4.5-1.5-8-4.5-8-9V7z" />Memory</a>
    </nav>
  );
}
