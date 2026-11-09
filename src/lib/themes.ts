export type ThemeKey = 'red' | 'white' | 'gold';

export const THEME_KEYS: ThemeKey[] = ['red', 'white', 'gold'];

export const THEMES: Record<ThemeKey, { label: string; kit: string; swatch: string; photo: string; pos: string; credit: string }> = {
  red: {
    label: 'Red',
    kit: 'Portugal',
    swatch: '#E8291D',
    photo: '/photos/portugal.jpg',
    pos: 'center 14%',
    credit: 'Анна Нэсси, CC BY-SA 3.0',
  },
  white: {
    label: 'White',
    kit: 'Real Madrid',
    swatch: '#FFFFFF',
    photo: '/photos/madrid.jpg',
    pos: 'center 26%',
    credit: 'KANO PHOTO, CC BY-SA 2.0',
  },
  gold: {
    label: 'Gold',
    kit: 'Al Nassr',
    swatch: '#FFD100',
    photo: '/photos/alnassr.jpg',
    pos: 'center 10%',
    credit: 'Mehrdad Esfahani / Mehr News, attribution licence',
  },
};

export function isThemeKey(v: unknown): v is ThemeKey {
  return v === 'red' || v === 'white' || v === 'gold';
}
