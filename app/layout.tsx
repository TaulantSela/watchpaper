import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WatchPaper',
  description:
    'Wallpapers that match the watch on your wrist — famous dials reduced to pure texture and colour. No logos, no indices, no hands.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'WatchPaper',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#14161A' },
    { media: '(prefers-color-scheme: light)', color: '#F0EFEB' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
