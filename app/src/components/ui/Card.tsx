import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  hoverable?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Card({ children, className = '', onClick, selected, hoverable, header, footer }: CardProps) {
  const interactive = onClick || hoverable;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <div
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`
        rounded border-2 overflow-hidden
        bg-parchment-texture surface-parchment
        transition-all duration-200
        ${selected
          ? 'border-gold shadow-card-hover glow-gold'
          : 'border-gold/30 shadow-card'}
        ${interactive
          ? 'cursor-pointer hover:border-gold/70 hover:shadow-card-hover'
          : ''}
        ${className}
      `}
    >
      {header && (
        <div className="px-4 py-2 bg-leather/80 border-b border-gold/30">
          {header}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="px-4 py-2 border-t border-gold/20 bg-aged-paper/30">
          {footer}
        </div>
      )}
    </div>
  );
}
