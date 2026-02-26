import React from 'react';

type BadgeColor = 'gold' | 'crimson' | 'stone' | 'green' | 'blue';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}

const colors: Record<BadgeColor, string> = {
  gold:    'bg-gold/15 border-gold/40 text-gold-dark',
  crimson: 'bg-crimson/15 border-crimson/40 text-crimson-light',
  stone:   'bg-stone/15 border-stone/30 text-stone',
  green:   'bg-emerald-900/20 border-emerald-700/40 text-emerald-400',
  blue:    'bg-blue-900/20 border-blue-700/40 text-blue-300',
};

export function Badge({ children, color = 'gold', className = '' }: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center px-2 py-0.5
      text-[10px] font-display uppercase tracking-wider
      rounded border ${colors[color]} ${className}
    `}>
      {children}
    </span>
  );
}
