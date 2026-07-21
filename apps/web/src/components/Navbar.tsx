'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ticket, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Events' },
  { href: '/my-ticket', label: 'My Ticket' },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-brand-dark/80 backdrop-blur-xl border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center">
              <Ticket size={16} className="text-black" />
            </div>
            <span className="font-extrabold text-lg tracking-tight">
              <span className="text-white">YoTickets</span>
              <span className="text-brand-gold">Africa</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-brand-gold/10 text-brand-gold'
                    : 'text-brand-muted hover:text-white hover:bg-white/5',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/events" className="btn-gold text-sm py-2 px-4">
              Buy Tickets
            </Link>
          </div>

          <button
            className="md:hidden text-brand-muted hover:text-white p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-brand-border bg-brand-card">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-brand-gold/10 text-brand-gold'
                    : 'text-brand-muted hover:text-white hover:bg-white/5',
                )}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/events"
              className="btn-gold text-sm w-full justify-center mt-3"
              onClick={() => setOpen(false)}
            >
              Buy Tickets
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
