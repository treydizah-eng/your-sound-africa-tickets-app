import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = 'EEEE, d MMMM yyyy') {
  return format(new Date(date), fmt);
}

export function formatTime(date: string | Date) {
  return format(new Date(date), 'h:mm a');
}

export function formatCurrency(amount: number | string | { toString(): string }, currency = 'USD') {
  const n = Number(amount);
  if (currency === 'USD') return `$${n.toFixed(2)}`;
  return `${currency} ${n.toFixed(2)}`;
}

export function getAvailabilityInfo(totalQty: number, soldQty: number) {
  const remaining = totalQty - soldQty;
  const pct = (soldQty / totalQty) * 100;

  if (remaining <= 0) return { label: 'Sold Out', variant: 'soldout' as const, remaining: 0 };
  if (pct >= 85) return { label: `Only ${remaining} left!`, variant: 'limited' as const, remaining };
  return { label: 'Available', variant: 'available' as const, remaining };
}

export function relativeTime(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
