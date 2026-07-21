import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'YoTicketsAfrica — Official Ticketing',
    template: '%s | YoTicketsAfrica',
  },
  description:
    'Buy tickets securely for Michael Mahendere & Friends events. Instant delivery via Email and WhatsApp.',
  keywords: ['tickets', 'Michael Mahendere', 'gospel', 'Zimbabwe', 'Africa', 'events'],
  openGraph: {
    type: 'website',
    locale: 'en_ZW',
    url: 'https://yoticketsafrica.com',
    siteName: 'YoTicketsAfrica',
    title: 'YoTicketsAfrica — Official Ticketing',
    description: 'Buy tickets securely for Michael Mahendere events.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YoTicketsAfrica',
    description: 'Buy tickets securely for Michael Mahendere events.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-brand-dark text-white min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
