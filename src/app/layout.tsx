import type { Metadata, Viewport } from 'next';
import { Anton, Inter } from 'next/font/google';
import './globals.css';
import { FanProvider } from '@/components/Fan';
import { BottomNav, TopBar } from '@/components/Chrome';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-anton' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'El Bicho · Road to 1,000',
  description: 'Relive every Ronaldo goal, call the next one, and count down to 1,000. Memories on Walrus, calls stamped on Sui through Tatum.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0D0506' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="red" className={`${anton.variable} ${inter.variable}`}>
      <body>
        <FanProvider>
          <TopBar />
          <main>{children}</main>
          <footer className="wrap muted" style={{ padding: '32px 16px 24px', fontSize: 12 }}>
            Memories on Walrus · calls stamped on Sui through Tatum · Photos: Анна Нэсси (CC BY-SA 3.0), KANO PHOTO (CC BY-SA 2.0), Mehrdad Esfahani / Mehr News
          </footer>
          <BottomNav />
        </FanProvider>
      </body>
    </html>
  );
}
