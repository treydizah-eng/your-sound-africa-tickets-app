'use client';

import { useState } from 'react';
import { Search, Ticket, Calendar, MapPin, QrCode, Loader2, AlertCircle } from 'lucide-react';
import { lookupOrder } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { OrderLookupResponse } from '@/types';
import type { Metadata } from 'next';

export default function MyTicketPage() {
  const [bookingRef, setBookingRef] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<OrderLookupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRef.trim() || !email.trim()) return;
    setError('');
    setLoading(true);
    setOrder(null);

    try {
      const result = await lookupOrder(bookingRef.trim().toUpperCase(), email.trim());
      setOrder(result);
    } catch {
      setError('Ticket not found. Please check your booking reference and email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <div className="w-14 h-14 bg-brand-gold/10 border border-brand-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Ticket size={28} className="text-brand-gold" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Find My Ticket</h1>
        <p className="text-brand-muted">
          Enter your booking reference and email to view your tickets.
        </p>
      </div>

      <div className="card p-6 mb-6">
        <form onSubmit={handleLookup} className="space-y-4">
          <div>
            <label className="label">Booking Reference</label>
            <input
              type="text"
              value={bookingRef}
              onChange={(e) => setBookingRef(e.target.value)}
              className="input-field font-mono tracking-wider uppercase"
              placeholder="YT-2026-00000000"
              autoCapitalize="characters"
            />
            <p className="text-brand-muted text-xs mt-1">
              Found in your confirmation email or WhatsApp message.
            </p>
          </div>
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="Email used when purchasing"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !bookingRef || !email}
            className="btn-gold w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
            {loading ? 'Searching…' : 'Find My Ticket'}
          </button>
        </form>
      </div>

      {order && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-white font-bold text-xl">{order.show.title}</h2>
                <div className="flex flex-col gap-1 mt-2">
                  <p className="text-brand-muted text-sm flex items-center gap-1.5">
                    <Calendar size={13} className="text-brand-gold" />
                    {formatDate(order.show.showDate)}
                  </p>
                  <p className="text-brand-muted text-sm flex items-center gap-1.5">
                    <MapPin size={13} className="text-brand-gold" />
                    {order.show.venue}, {order.show.city}
                  </p>
                </div>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${order.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                {order.status}
              </span>
            </div>

            <div className="bg-brand-dark rounded-xl p-4 mb-4">
              <p className="text-brand-muted text-xs mb-0.5">Booking Reference</p>
              <p className="text-brand-gold font-bold text-xl tracking-wider">{order.bookingRef}</p>
            </div>

            <div className="text-sm text-brand-muted">
              <p>Name: <span className="text-white font-medium">{order.customer.firstName} {order.customer.lastName}</span></p>
              <p className="mt-1">Total Paid: <span className="text-brand-gold font-bold">${Number(order.total).toFixed(2)}</span></p>
            </div>
          </div>

          <h3 className="text-white font-bold text-lg">Your Tickets ({order.tickets.length})</h3>

          {order.tickets.map((ticket, i) => (
            <div key={ticket.ticketCode} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-brand-muted text-xs uppercase tracking-wider mb-1">Ticket {i + 1}</p>
                  <p className="text-white font-bold font-mono tracking-wider">{ticket.ticketCode}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ticket.status === 'VALID' ? 'badge-available' : ticket.status === 'REDEEMED' ? 'badge-soldout' : 'badge-limited'}`}>
                  {ticket.status}
                </span>
              </div>

              {ticket.qrImageUrl && ticket.qrImageUrl.startsWith('data:image') ? (
                <div className="flex flex-col items-center py-4">
                  <img
                    src={ticket.qrImageUrl}
                    alt={`QR for ${ticket.ticketCode}`}
                    className="w-48 h-48 rounded-xl border border-brand-border"
                  />
                  <p className="text-brand-muted text-xs mt-3 flex items-center gap-1">
                    <QrCode size={12} /> Show this QR at the gate
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center py-6 text-brand-muted text-sm">
                  <QrCode size={16} className="mr-2" />
                  QR available in your email
                </div>
              )}
            </div>
          ))}

          <p className="text-brand-muted text-xs text-center">
            Need help? Email{' '}
            <a href="mailto:tickets@yoticketsafrica.com" className="text-brand-gold hover:underline">
              tickets@yoticketsafrica.com
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
