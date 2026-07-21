import Link from 'next/link';
import { Calendar, MapPin, Ticket, ArrowRight } from 'lucide-react';
import { formatDate, formatCurrency, getAvailabilityInfo } from '@/lib/utils';
import type { Show } from '@/types';

interface EventCardProps {
  show: Show;
  featured?: boolean;
}

export function EventCard({ show, featured = false }: EventCardProps) {
  const lowestPrice = show.ticketTypes.length
    ? Math.min(...show.ticketTypes.map((t) => t.price))
    : 0;

  const totalSold = show.ticketTypes.reduce((s, t) => s + t.soldQty, 0);
  const totalQty = show.ticketTypes.reduce((s, t) => s + t.totalQty, 0);
  const { label: availLabel, variant } = getAvailabilityInfo(totalQty, totalSold);

  const isSoldOut = show.status === 'SOLD_OUT' || variant === 'soldout';
  const isComing = show.status === 'PUBLISHED' && new Date(show.showDate) > new Date();

  if (featured) {
    return (
      <div className="card overflow-hidden group">
        <div className="relative h-56 sm:h-72 bg-gradient-to-br from-purple-900 via-brand-card to-brand-dark overflow-hidden">
          {show.posterUrl ? (
            <img
              src={show.posterUrl}
              alt={show.title}
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900/50 via-brand-card to-brand-dark flex items-center justify-center">
              <Ticket size={64} className="text-brand-gold/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-brand-gold text-black text-xs font-bold px-3 py-1 rounded-full">
              Featured
            </span>
            {isSoldOut ? (
              <span className="badge-soldout">Sold Out</span>
            ) : variant === 'limited' ? (
              <span className="badge-limited">{availLabel}</span>
            ) : (
              <span className="badge-available">Available</span>
            )}
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-brand-gold transition-colors">
            {show.title}
          </h2>
          <div className="flex flex-wrap gap-4 text-brand-muted text-sm mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-brand-gold" />
              {formatDate(show.showDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-brand-gold" />
              {show.venue}, {show.city}
            </span>
          </div>

          {show.ticketTypes.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-brand-border">
              <div>
                <p className="text-brand-muted text-xs mb-0.5">From</p>
                <p className="text-brand-gold text-xl font-bold">
                  {formatCurrency(lowestPrice)}
                </p>
              </div>
              {!isSoldOut ? (
                <Link href={`/events/${show.slug}`} className="btn-gold">
                  Buy Tickets
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <span className="btn-outline cursor-not-allowed opacity-50">Sold Out</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden group hover:border-brand-gold/40 transition-colors duration-300">
      <div className="relative h-40 bg-gradient-to-br from-purple-900/40 via-brand-card to-brand-dark overflow-hidden">
        {show.posterUrl ? (
          <img
            src={show.posterUrl}
            alt={show.title}
            className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Ticket size={40} className="text-brand-gold/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-card to-transparent" />
        <div className="absolute top-3 right-3">
          {isSoldOut ? (
            <span className="badge-soldout">Sold Out</span>
          ) : variant === 'limited' ? (
            <span className="badge-limited">{availLabel}</span>
          ) : (
            <span className="badge-available">Available</span>
          )}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-white text-lg mb-2 group-hover:text-brand-gold transition-colors line-clamp-1">
          {show.title}
        </h3>
        <div className="space-y-1.5 text-sm text-brand-muted mb-4">
          <p className="flex items-center gap-1.5">
            <Calendar size={13} className="text-brand-gold flex-shrink-0" />
            {formatDate(show.showDate, 'EEE, d MMM yyyy')}
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin size={13} className="text-brand-gold flex-shrink-0" />
            {show.venue}, {show.city}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-brand-border">
          {show.ticketTypes.length > 0 ? (
            <p className="text-brand-gold font-bold">
              {formatCurrency(lowestPrice)}
              <span className="text-brand-muted font-normal text-xs ml-1">from</span>
            </p>
          ) : (
            <p className="text-brand-muted text-sm">Coming Soon</p>
          )}

          <Link
            href={`/events/${show.slug}`}
            className={
              isSoldOut
                ? 'text-brand-muted text-sm font-medium cursor-not-allowed'
                : 'text-brand-gold text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all'
            }
          >
            {isSoldOut ? 'Sold Out' : 'Details'}
            {!isSoldOut && <ArrowRight size={14} />}
          </Link>
        </div>
      </div>
    </div>
  );
}
