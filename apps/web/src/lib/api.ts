import type { CreateOrderPayload, CreateOrderResponse, OrderLookupResponse, Show } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(8000),
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || `API error: ${res.status}`);
  }
  return data as T;
}

export async function getShows(): Promise<Show[]> {
  return apiFetch<Show[]>('/shows');
}

export async function getShow(slug: string): Promise<Show> {
  return apiFetch<Show>(`/shows/${slug}`);
}

export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
  return apiFetch<CreateOrderResponse>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function lookupOrder(bookingRef: string, email: string): Promise<OrderLookupResponse> {
  return apiFetch<OrderLookupResponse>(
    `/orders/lookup?ref=${encodeURIComponent(bookingRef)}&email=${encodeURIComponent(email)}`,
  );
}

export async function pollOrderStatus(bookingRef: string): Promise<{ status: string }> {
  return apiFetch<{ status: string }>(`/payments/poll?ref=${encodeURIComponent(bookingRef)}`);
}
