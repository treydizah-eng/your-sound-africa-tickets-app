'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock, Mail, MessageCircle, Ticket, Loader2, AlertCircle } from 'lucide-react';
import { lookupOrder, pollOrderStatus } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { OrderLookupResponse } from '@/types';

function SuccessContent() {
  const params = useSearchParams();
  const bookingRef = params.get('ref') || '';
  const method = params.get('method') || 'paynow_web';

  const [order, setOrder] = useState<OrderLookupResponse | null>(null);
  const [status, setStatus] = useState<'loading' | 'paid' | 'pending' | 'failed'>('loading');
  const [email, setEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [lookupError, setLookupError] = useState('');

  useEffect(() => {
    if (!bookingRef) { setStatus('failed'); return; }

    const poll = async () => {
      const result = await pollOrderStatus(bookingRef);
      if (result.status === 'PAID') setStatus('paid');
      else if (result.status === 'FAILED' || result.status === 'CANCELLED') setStatus('failed');
      else setStatus('pending');
    };

    poll();
    const interval = setInterval(poll, 5000);
    const timeout = setTimeout(() => clearInterval(interval), 120000);

    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [bookingRef]);

  const handleLookup = async () => {
    if (!emailInput.trim()) return;
    setLookupError('');
    try {
      const o = await lookupOrder(bookingRef, emailInput);
      setOrder(o);
      setEmail(emailInput);
    } catch {
      setLookupError('Order not found. Please check your email address.');
    }
  };

  if (!bookingRef) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">No booking reference found</h1>
        <Link href="/events" className="btn-gold mt-4">Browse Events</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      {status === 'loading' || (status === 'pending' && method === 'paynow_web') ? (
        <div className="card p-8 text-center">
          <Loader2 size={40} className="text-brand-gold animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Verifying Payment…</h1>
          <p className="text-brand-muted text-sm">Please wait. This usually takes a few seconds.</p>
          <p className="text-brand-muted text-xs mt-3">Booking Ref: <strong className="text-white">{bookingRef}</strong></p>
        </div>
      ) : status === 'pending' && method === 'ecocash' ? (
        <div className="space-y-4">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Check Your Phone</h1>
            <p className="text-brand-muted mb-4">An EcoCash payment prompt has been sent. Approve it on your phone to complete your purchase.</p>
            <div className="bg-brand-dark rounded-xl p-4 mb-4">
              <p className="text-brand-muted text-xs">Booking Reference</p>
              <p className="text-brand-gold font-bold text-xl tracking-wider">{bookingRef}</p>
            </div>
            <p className="text-brand-muted text-sm">Once payment is approved, your tickets will be sent to your email and WhatsApp automatically.</p>
          </div>
        </div>
      ) : status === 'paid' ? (
        <div className="space-y-4">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-brand-muted mb-4">Your tickets are on their way. Check your email and WhatsApp.</p>
            <div className="bg-brand-dark rounded-xl p-4 mb-4">
              <p className="text-brand-muted text-xs">Booking Reference</p>
              <p className="text-brand-gold font-bold text-2xl tracking-wider">{bookingRef}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-brand-dark rounded-xl p-3 flex items-center gap-2">
                <Mail size={16} className="text-brand-gold" />
                <span className="text-brand-muted">Email sent</span>
              </div>
              <div className="bg-brand-dark rounded-xl p-3 flex items-center gap-2">
                <MessageCircle size={16} className="text-brand-gold" />
                <span className="text-brand-muted">WhatsApp sent</span>
              </div>
            </div>
          </div>

          {!order && (
            <div className="card p-6">
              <h2 className="text-white font-bold mb-3">View Your Tickets</h2>
              <p className="text-brand-muted text-sm mb-4">Enter the email you used at checkout to see your ticket details.</p>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="input-field mb-3"
                placeholder="your@email.com"
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              />
              {lookupError && <p className="text-red-400 text-xs mb-3">{lookupError}</p>}
              <button onClick={handleLookup} className="btn-gold w-full justify-center">
                View Tickets
              </button>
            </div>
          )}

          {order && (
            <div className="card p-6">
              <h2 className="text-white font-bold mb-4">
                {order.show.title}
              </h2>
              <p className="text-brand-muted text-sm mb-4">
                {formatDate(order.show.showDate)} · {order.show.venue}
              </p>
              <div className="space-y-3">
                {order.tickets.map((t) => (
                  <div key={t.ticketCode} className="bg-brand-dark rounded-xl p-4 border border-brand-border">
                    <p className="text-brand-muted text-xs mb-1">Ticket Code</p>
                    <p className="text-white font-bold tracking-wider">{t.ticketCode}</p>
                    {t.qrImageUrl && t.qrImageUrl.startsWith('data:image') && (
                      <div className="mt-3 flex justify-center">
                        <img src={t.qrImageUrl} alt="QR Code" className="w-32 h-32 rounded-lg" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <Link href="/events" className="text-brand-muted text-sm hover:text-white transition-colors">
              ← Browse more events
            </Link>
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Payment Failed</h1>
          <p className="text-brand-muted mb-4">Your payment was not completed. No charges were made.</p>
          <p className="text-brand-muted text-xs mb-6">Reference: <strong className="text-white">{bookingRef}</strong></p>
          <Link href="/events" className="btn-gold">Try Again</Link>
        </div>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="text-brand-gold animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
