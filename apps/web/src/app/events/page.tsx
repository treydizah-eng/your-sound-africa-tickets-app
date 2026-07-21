'use client';

import { useEffect, useState } from 'react';
import { Ticket } from 'lucide-react';
import { EventCard } from '@/components/EventCard';
import { getShows } from '@/lib/api';
import type { Show } from '@/types';

export default function EventsPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShows()
      .then(setShows)
      .catch(() => setShows([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-brand-gold text-sm font-semibold uppercase tracking-wider mb-2">
          All Events
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Upcoming Shows
        </h1>
        <p className="text-brand-muted">
          {loading
            ? 'Loading events...'
            : shows.length > 0
            ? `${shows.length} event${shows.length !== 1 ? 's' : ''} available`
            : 'No events currently scheduled'}
        </p>
      </div>

      {loading ? (
        <div className="card p-16 text-center">
          <div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-brand-muted text-sm">Loading events...</p>
        </div>
      ) : shows.length === 0 ? (
        <div className="card p-16 text-center">
          <Ticket size={48} className="text-brand-muted mx-auto mb-4" />
          <h2 className="text-white font-semibold text-xl mb-2">No Events Yet</h2>
          <p className="text-brand-muted text-sm max-w-sm mx-auto">
            New shows are published regularly. Check back soon or follow Michael Mahendere
            on social media for announcements.
          </p>
        </div>
      ) : (
        <>
          {shows.slice(0, 1).length > 0 && (
            <div className="mb-8">
              <EventCard show={shows[0]} featured />
            </div>
          )}
          {shows.length > 1 && (
            <>
              <h2 className="text-white font-bold text-xl mb-5 mt-10">More Events</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {shows.slice(1).map((show) => (
                  <EventCard key={show.id} show={show} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
