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
  { href: '/ask', label: 'Ask' },
  { href: '/wall', label: '1,000 Wall' },
  { href: '/you', label: 'You' },
];

export function TopBar() {
  const path = usePathname();
  const { theme, setTheme } = useFan();
  return (
    <header className="topbar-shell">
      <div className="wrap topbar">
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
      </div>
    </header>
  );
}

const Icon = ({ d }: { d: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

const TABS = [
  { href: '/', label: 'Home', d: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z' },
  { href: '/relive', label: 'Relive', d: 'M6 3h12v18H6zM10 9l5 3-5 3z' },
  { href: '/call', label: 'Call', d: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7l3.8 2.8-1.5 4.5H9.7L8.2 9.8zM12 3v4M21 10.5l-5.2-.7M17.6 19.2l-3.3-4.9M6.4 19.2l3.3-4.9M3 10.5l5.2-.7', key: true },
  { href: '/road', label: 'Road', d: 'M4 20l5-6 4 3 7-10M15 7h5v5' },
  { href: '/ask', label: 'Ask', d: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z' },
];

// The page you are on rises out of the bar as the big round button.
export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="bottomnav" aria-label="Main">
      {TABS.map((t) => {
        const on = path === t.href;
        return (
          <Link key={t.href} href={t.href} aria-current={on ? 'page' : undefined} className={'tab' + (on ? ' on' : '') + (t.key ? ' key' : '')}>
            <span className="tab-disc"><Icon d={t.d} /></span>
            <span className="tab-label">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
