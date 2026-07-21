'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  targetDate: string | Date;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(targetDate: Date): TimeLeft {
  const diff = targetDate.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Digit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-brand-card border border-brand-border rounded-xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
        <span className="text-brand-gold font-extrabold text-xl sm:text-2xl tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-brand-muted text-xs mt-1.5 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export function CountdownTimer({ targetDate, className }: CountdownTimerProps) {
  const target = new Date(targetDate);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(target));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(target));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className={`flex items-center gap-3 ${className || ''}`}>
        {['Days', 'Hrs', 'Min', 'Sec'].map((l) => (
          <Digit key={l} value={0} label={l} />
        ))}
      </div>
    );
  }

  const isPast = target.getTime() < Date.now();
  if (isPast) {
    return (
      <span className="text-brand-muted text-sm font-medium">This event has passed</span>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      <Digit value={timeLeft.days} label="Days" />
      <span className="text-brand-gold text-xl font-bold pb-5">:</span>
      <Digit value={timeLeft.hours} label="Hrs" />
      <span className="text-brand-gold text-xl font-bold pb-5">:</span>
      <Digit value={timeLeft.minutes} label="Min" />
      <span className="text-brand-gold text-xl font-bold pb-5">:</span>
      <Digit value={timeLeft.seconds} label="Sec" />
    </div>
  );
}
