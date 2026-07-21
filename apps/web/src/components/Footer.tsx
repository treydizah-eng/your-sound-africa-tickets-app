import Link from 'next/link';
import { Ticket, Mail, MessageCircle } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-border bg-brand-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center">
                <Ticket size={16} className="text-black" />
              </div>
              <span className="font-extrabold text-lg">
                <span className="text-white">YoTickets</span>
                <span className="text-brand-gold">Africa</span>
              </span>
            </Link>
            <p className="text-brand-muted text-sm leading-relaxed">
              Official ticketing for Michael Mahendere & Friends. Secure. Instant. Trusted.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/events', label: 'All Events' },
                { href: '/my-ticket', label: 'Find My Ticket' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-brand-muted text-sm hover:text-brand-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:tickets@yoticketsafrica.com"
                  className="flex items-center gap-2 text-brand-muted text-sm hover:text-brand-gold transition-colors"
                >
                  <Mail size={14} />
                  tickets@yoticketsafrica.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/263000000000"
                  className="flex items-center gap-2 text-brand-muted text-sm hover:text-brand-gold transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={14} />
                  WhatsApp Support
                </a>
              </li>
            </ul>
            <div className="mt-4 p-3 rounded-xl bg-brand-dark border border-brand-border">
              <p className="text-xs text-brand-muted">
                <span className="text-emerald-400 font-medium">✓ Secure payments</span> by PayNow Zimbabwe.
                All transactions encrypted.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-brand-muted text-sm">
            © {year} YoTicketsAfrica. All rights reserved.
          </p>
          <p className="text-brand-muted text-xs">
            Powered by{' '}
            <span className="text-brand-gold font-medium">Your Sound Africa</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
