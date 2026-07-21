'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, User, CreditCard, Minus, Plus, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getShow, createOrder } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Show, OrderItem } from '@/types';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  country: z.string().min(1, 'Required'),
  company: z.string().optional(),
  paymentMethod: z.enum(['paynow_web', 'ecocash']),
  ecocashNumber: z.string().optional(),
  promoCode: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [show, setShow] = useState<Show | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [step, setStep] = useState<'tickets' | 'details'>('tickets');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: 'paynow_web', country: 'Zimbabwe' },
  });

  const paymentMethod = watch('paymentMethod');

  useEffect(() => {
    getShow(slug)
      .then((s) => { setShow(s); setLoading(false); })
      .catch(() => { setLoading(false); router.push('/events'); });
  }, [slug]);

  const updateQty = (id: string, delta: number) => {
    setQuantities((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta);
      return { ...prev, [id]: next };
    });
  };

  const orderItems: OrderItem[] = show
    ? show.ticketTypes
        .filter((tt) => (quantities[tt.id] || 0) > 0)
        .map((tt) => ({ ticketTypeId: tt.id, quantity: quantities[tt.id] }))
    : [];

  const subtotal = show
    ? show.ticketTypes.reduce(
        (sum, tt) => sum + tt.price * (quantities[tt.id] || 0),
        0,
      )
    : 0;

  const totalTickets = Object.values(quantities).reduce((s, v) => s + v, 0);

  const onSubmit = async (data: FormData) => {
    if (orderItems.length === 0) {
      setError('Please select at least one ticket.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const result = await createOrder({
        showId: show!.id,
        items: orderItems,
        customer: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          country: data.country,
          company: data.company,
        },
        paymentMethod: data.paymentMethod,
        ecocashNumber: data.ecocashNumber,
        promoCode: data.promoCode,
      });

      if (data.paymentMethod === 'paynow_web' && result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        router.push(`/checkout/success?ref=${result.bookingRef}&method=ecocash`);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="text-brand-gold animate-spin" />
      </div>
    );
  }

  if (!show) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href={`/events/${slug}`} className="inline-flex items-center gap-2 text-brand-muted hover:text-white text-sm mb-8 transition-colors">
        <ArrowLeft size={14} /> Back to Event
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{show.title}</h1>
        <p className="text-brand-muted mt-1">{formatDate(show.showDate)} · {show.venue}, {show.city}</p>
      </div>

      <div className="flex gap-4 mb-8">
        {['tickets', 'details'].map((s, i) => (
          <div key={s} className={`flex items-center gap-2 text-sm font-semibold ${step === s ? 'text-brand-gold' : 'text-brand-muted'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${step === s ? 'bg-brand-gold text-black border-brand-gold' : i < ['tickets', 'details'].indexOf(step) ? 'bg-brand-gold/20 text-brand-gold border-brand-gold/40' : 'border-brand-border text-brand-muted'}`}>{i + 1}</span>
            {s === 'tickets' ? 'Select Tickets' : 'Your Details'}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {step === 'tickets' && (
              <div className="card p-6">
                <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                  <ShoppingCart size={18} className="text-brand-gold" /> Select Tickets
                </h2>
                <div className="space-y-4">
                  {show.ticketTypes.map((tt) => {
                    const remaining = tt.totalQty - tt.soldQty;
                    const qty = quantities[tt.id] || 0;
                    const isSoldOut = remaining <= 0;
                    return (
                      <div key={tt.id} className={`flex items-center justify-between p-4 rounded-xl border ${isSoldOut ? 'border-brand-border opacity-50' : 'border-brand-border hover:border-brand-gold/40'} transition-colors`}>
                        <div>
                          <div className="flex items-center gap-2">
                            {tt.color && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tt.color }} />}
                            <p className="text-white font-semibold">{tt.name}</p>
                          </div>
                          <p className="text-brand-gold font-bold text-lg">{formatCurrency(tt.price)}</p>
                          {!isSoldOut && <p className="text-brand-muted text-xs">{remaining} remaining</p>}
                          {isSoldOut && <p className="text-red-400 text-xs">Sold Out</p>}
                        </div>
                        {!isSoldOut && (
                          <div className="flex items-center gap-3">
                            <button type="button" onClick={() => updateQty(tt.id, -1)} disabled={qty === 0} className="w-8 h-8 rounded-full border border-brand-border flex items-center justify-center text-white hover:border-brand-gold hover:text-brand-gold disabled:opacity-30 transition-colors">
                              <Minus size={14} />
                            </button>
                            <span className="text-white font-bold w-6 text-center tabular-nums">{qty}</span>
                            <button type="button" onClick={() => updateQty(tt.id, 1)} disabled={qty >= Math.min(remaining, 10)} className="w-8 h-8 rounded-full border border-brand-border flex items-center justify-center text-white hover:border-brand-gold hover:text-brand-gold disabled:opacity-30 transition-colors">
                              <Plus size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6">
                  <button type="button" disabled={totalTickets === 0} onClick={() => setStep('details')} className="btn-gold w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed">
                    Continue — {totalTickets} ticket{totalTickets !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            )}

            {step === 'details' && (
              <>
                <div className="card p-6">
                  <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                    <User size={18} className="text-brand-gold" /> Your Details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">First Name *</label>
                      <input {...register('firstName')} className="input-field" placeholder="e.g. John" />
                      {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
                    </div>
                    <div>
                      <label className="label">Last Name *</label>
                      <input {...register('lastName')} className="input-field" placeholder="e.g. Doe" />
                      {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
                    </div>
                    <div>
                      <label className="label">Email Address *</label>
                      <input {...register('email')} type="email" className="input-field" placeholder="you@example.com" />
                      {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="label">Phone Number *</label>
                      <input {...register('phone')} className="input-field" placeholder="+263 77 123 4567" />
                      {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                    </div>
                    <div>
                      <label className="label">Country *</label>
                      <input {...register('country')} className="input-field" placeholder="Zimbabwe" />
                    </div>
                    <div>
                      <label className="label">Company (optional)</label>
                      <input {...register('company')} className="input-field" placeholder="Organisation name" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">Promo Code (optional)</label>
                      <input {...register('promoCode')} className="input-field" placeholder="Enter promo code" />
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                    <CreditCard size={18} className="text-brand-gold" /> Payment Method
                  </h2>
                  <div className="space-y-3">
                    {[
                      { value: 'paynow_web', label: 'PayNow (Web)', desc: 'Card, ZimSwitch, Visa, Mastercard' },
                      { value: 'ecocash', label: 'EcoCash', desc: 'Pay via EcoCash mobile money' },
                    ].map((opt) => (
                      <label key={opt.value} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === opt.value ? 'border-brand-gold bg-brand-gold/5' : 'border-brand-border hover:border-brand-gold/40'}`}>
                        <input type="radio" value={opt.value} {...register('paymentMethod')} className="accent-brand-gold" />
                        <div>
                          <p className="text-white font-semibold text-sm">{opt.label}</p>
                          <p className="text-brand-muted text-xs">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {paymentMethod === 'ecocash' && (
                    <div className="mt-4">
                      <label className="label">EcoCash Number *</label>
                      <input {...register('ecocashNumber')} className="input-field" placeholder="077 123 4567" />
                      <p className="text-brand-muted text-xs mt-1">You will receive a prompt on this number.</p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep('tickets')} className="btn-outline flex-1 justify-center">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="submit" disabled={submitting} className="btn-gold flex-1 justify-center">
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Pay Now'}
                    {!submitting && ` — ${formatCurrency(subtotal)}`}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ─── Order Summary ─── */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-24">
              <h3 className="text-white font-bold mb-4">Order Summary</h3>
              {orderItems.length === 0 ? (
                <p className="text-brand-muted text-sm">No tickets selected yet.</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {show.ticketTypes.filter((tt) => (quantities[tt.id] || 0) > 0).map((tt) => (
                    <div key={tt.id} className="flex justify-between text-sm">
                      <span className="text-brand-muted">{tt.name} ×{quantities[tt.id]}</span>
                      <span className="text-white font-semibold">{formatCurrency(tt.price * quantities[tt.id])}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t border-brand-border pt-4">
                <div className="flex justify-between font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-brand-gold text-lg">{formatCurrency(subtotal)}</span>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-xs text-brand-muted">
                <p>✓ Tickets delivered instantly</p>
                <p>✓ Secure PayNow payment</p>
                <p>✓ QR code valid at gate</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
