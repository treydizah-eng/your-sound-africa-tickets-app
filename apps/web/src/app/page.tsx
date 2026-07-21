import Link from 'next/link';
import { ArrowRight, Shield, Zap, MessageCircle, Star, Ticket } from 'lucide-react';
import { EventCard } from '@/components/EventCard';
import { CountdownTimer } from '@/components/CountdownTimer';
import { getShows } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Show } from '@/types';

async function getPublishedShows(): Promise<Show[]> {
  try {
    return await getShows();
  } catch {
    return [];
  }
}

const features = [
  {
    icon: Zap,
    title: 'Instant Delivery',
    desc: 'Tickets arrive in your inbox and WhatsApp within seconds of payment.',
  },
  {
    icon: Shield,
    title: 'Fraud-Proof QR',
    desc: 'Every ticket has a cryptographically signed QR code that cannot be duplicated.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp & Email',
    desc: 'Receive your tickets on WhatsApp for easy offline access at the gate.',
  },
];

export default async function HomePage() {
  const shows = await getPublishedShows();
  const nextShow = shows[0];

  return (
    <div>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-brand-dark to-brand-dark" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 80%, #f7a800 0%, transparent 50%), radial-gradient(circle at 80% 20%, #7c3aed 0%, transparent 50%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-4 py-1.5 text-brand-gold text-sm font-medium mb-6">
              <Star size={13} fill="currentColor" />
              Official Ticketing for Michael Mahendere
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
              Experience the{' '}
              <span className="text-brand-gold">Sound</span>
              <br />
              of Africa Live
            </h1>

            <p className="text-brand-muted text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl">
              Buy tickets securely for Michael Mahendere & Friends events. Instant delivery
              via Email and WhatsApp. No account required.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/events" className="btn-gold text-base py-3.5 px-7">
                Browse Events
                <ArrowRight size={18} />
              </Link>
              <Link href="/my-ticket" className="btn-outline text-base py-3.5 px-7">
                Find My Ticket
              </Link>
            </div>
          </div>

          {nextShow && (
            <div className="mt-14 card p-6 max-w-lg">
              <p className="text-brand-muted text-xs font-semibold uppercase tracking-wider mb-3">
                Next Event
              </p>
              <h2 className="text-white text-xl font-bold mb-1">{nextShow.title}</h2>
              <p className="text-brand-muted text-sm mb-4">
                {formatDate(nextShow.showDate)} · {nextShow.venue}, {nextShow.city}
              </p>
              <CountdownTimer targetDate={nextShow.showDate} />
            </div>
          )}
        </div>
      </section>

      {/* ─── Upcoming Events ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-brand-gold text-sm font-semibold uppercase tracking-wider mb-2">
              Don&apos;t Miss Out
            </p>
            <h2 className="text-3xl font-extrabold text-white">Upcoming Events</h2>
          </div>
          <Link
            href="/events"
            className="hidden sm:flex text-brand-gold text-sm font-medium items-center gap-1 hover:gap-2 transition-all"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {shows.length === 0 ? (
          <div className="card p-12 text-center">
            <Ticket size={40} className="text-brand-muted mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No events scheduled yet</h3>
            <p className="text-brand-muted text-sm">Check back soon for upcoming shows.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shows.slice(0, 1).map((show) => (
              <div key={show.id} className="md:col-span-2">
                <EventCard show={show} featured />
              </div>
            ))}
            {shows.slice(1, 3).map((show) => (
              <EventCard key={show.id} show={show} />
            ))}
          </div>
        )}

        {shows.length > 3 && (
          <div className="mt-8 text-center">
            <Link href="/events" className="btn-outline">
              View all {shows.length} events
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>

      {/* ─── Why YoTicketsAfrica ─── */}
      <section className="bg-brand-card border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <p className="text-brand-gold text-sm font-semibold uppercase tracking-wider mb-2">
              Why Choose Us
            </p>
            <h2 className="text-3xl font-extrabold text-white">
              The Simplest Way to Get Your Ticket
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="text-center group">
                <div className="w-14 h-14 bg-brand-gold/10 border border-brand-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-gold/20 transition-colors">
                  <f.icon size={24} className="text-brand-gold" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-brand-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="card p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Ready to secure your seat?
            </h2>
            <p className="text-brand-muted mb-8 max-w-md mx-auto">
              Browse all upcoming events and get your tickets delivered instantly.
            </p>
            <Link href="/events" className="btn-gold text-base py-3.5 px-8">
              Buy Tickets Now
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
