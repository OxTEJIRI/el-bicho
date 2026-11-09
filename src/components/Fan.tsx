'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { isThemeKey, type ThemeKey } from '@/lib/themes';

type Fan = { fanId: string; theme: ThemeKey; setTheme: (t: ThemeKey) => void };
const Ctx = createContext<Fan>({ fanId: '', theme: 'red', setTheme: () => {} });

function read(key: string) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function write(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* private mode: keep it in memory only */ }
}

export function FanProvider({ children }: { children: React.ReactNode }) {
  const [fanId, setFanId] = useState('');
  const [theme, setThemeState] = useState<ThemeKey>('red');

  useEffect(() => {
    let id = read('elbicho.fan');
    if (!id) {
      id = (crypto.randomUUID?.() || String(Date.now()) + Math.random().toString(16).slice(2)).replace(/-/g, '').slice(0, 24);
      write('elbicho.fan', id);
    }
    setFanId(id);
    const t = read('elbicho.theme');
    if (isThemeKey(t)) setThemeState(t);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setTheme = (t: ThemeKey) => { setThemeState(t); write('elbicho.theme', t); };
  return <Ctx.Provider value={{ fanId, theme, setTheme }}>{children}</Ctx.Provider>;
}

export const useFan = () => useContext(Ctx);
