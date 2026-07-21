'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Clock, ArrowLeft, ArrowRight, Ticket } from 'lucide-react';
import { CountdownTimer } from '@/components/CountdownTimer';
import { getShow } from '@/lib/api';
import { formatDate, formatTime, formatCurrency, getAvailabilityInfo } from '@/lib/utils';
import type { Show } from '@/types';

export default function EventPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [show, setShow] = useState<Show | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getShow(slug)
      .then(setShow)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-brand-muted text-sm">Loading event...</p>
      </div>
    );
  }

  if (notFound || !show) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <Ticket size={48} className="text-brand-muted mx-auto mb-4" />
        <h1 className="text-white text-2xl font-bold mb-2">Event Not Found</h1>
        <p className="text-brand-muted mb-6">This event doesn&apos;t exist or has been removed.</p>
        <Link href="/events" className="btn-gold">Back to Events</Link>
      </div>
    );
  }

  const isSoldOut = show.status === 'SOLD_OUT';
  const isPast = new Date(show.showDate) < new Date();
  const canBuy = !isSoldOut && !isPast && show.ticketTypes.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/events"
        className="inline-flex items-center gap-2 text-brand-muted hover:text-white text-sm mb-8 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Events
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── Main Content ─── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Poster / Banner */}
          <div className="card overflow-hidden">
            <div className="relative h-64 sm:h-80 bg-gradient-to-br from-purple-900 via-brand-card to-brand-dark">
              {show.posterUrl ? (
                <img
                  src={show.posterUrl}
                  alt={show.title}
                  className="w-full h-full object-cover opacity-70"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Ticket size={80} className="text-brand-gold/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg">
                  {show.title}
                </h1>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-brand-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-brand-muted text-xs mb-0.5">Date</p>
                    <p className="text-white text-sm font-semibold">
                      {formatDate(show.showDate, 'EEE, d MMM yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-brand-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-brand-muted text-xs mb-0.5">Time</p>
                    <p className="text-white text-sm font-semibold">
                      {show.doorsTime || formatTime(show.showDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-brand-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-brand-muted text-xs mb-0.5">Venue</p>
                    <p className="text-white text-sm font-semibold">
                      {show.venue}
                    </p>
                    <p className="text-brand-muted text-xs">{show.city}, {show.country}</p>
                  </div>
                </div>
              </div>

              {!isPast && (
                <div className="bg-brand-dark rounded-2xl p-5 border border-brand-border">
                  <p className="text-brand-muted text-xs font-semibold uppercase tracking-wider mb-3">
                    Event Starts In
                  </p>
                  <CountdownTimer targetDate={show.showDate} />
                </div>
              )}
            </div>
          </div>

          {show.description && (
            <div className="card p-6">
              <h2 className="text-white font-bold text-lg mb-3">About This Event</h2>
              <p className="text-brand-muted leading-relaxed whitespace-pre-wrap">
                {show.description}
              </p>
            </div>
          )}
        </div>

        {/* ─── Ticket Sidebar ─── */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-white font-bold text-xl mb-5">Tickets</h2>

            {isSoldOut && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4 text-center">
                <p className="text-red-400 font-semibold">This event is Sold Out</p>
              </div>
            )}

            {isPast && (
              <div className="bg-brand-border rounded-xl p-4 mb-4 text-center">
                <p className="text-brand-muted font-semibold">This event has passed</p>
              </div>
            )}

            {show.ticketTypes.length === 0 && !isSoldOut && (
              <div className="text-center py-6">
                <p className="text-brand-muted text-sm">Ticket sales haven&apos;t opened yet.</p>
                <p className="text-brand-muted text-sm">Check back soon!</p>
              </div>
            )}

            <div className="space-y-3 mb-6">
              {show.ticketTypes.map((tt) => {
                const { label, variant, remaining } = getAvailabilityInfo(tt.totalQty, tt.soldQty);
                return (
                  <div
                    key={tt.id}
                    className="flex items-center justify-between p-4 bg-brand-dark rounded-xl border border-brand-border"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {tt.color && (
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: tt.color }}
                          />
                        )}
                        <p className="text-white font-semibold text-sm">{tt.name}</p>
                      </div>
                      <span
                        className={
                          variant === 'soldout'
                            ? 'badge-soldout'
                            : variant === 'limited'
                            ? 'badge-limited'
                            : 'badge-available'
                        }
                      >
                        {label}
                      </span>
                    </div>
                    <p className="text-brand-gold font-bold text-lg">
                      {formatCurrency(tt.price)}
                    </p>
                  </div>
                );
              })}
            </div>

            {canBuy ? (
              <Link
                href={`/checkout/${show.slug}`}
                className="btn-gold w-full justify-center text-base py-3.5"
              >
                Buy Tickets
                <ArrowRight size={18} />
              </Link>
            ) : null}

            <div className="mt-4 space-y-2 text-xs text-brand-muted text-center">
              <p>✓ Secure payment via PayNow Zimbabwe</p>
              <p>✓ Instant delivery — Email & WhatsApp</p>
              <p>✓ QR code valid at gate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
