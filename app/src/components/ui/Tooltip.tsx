import React, { useState, useId } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

const sideClasses = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
};

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const [show, setShow] = useState(false);
  const tooltipId = useId();

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      aria-describedby={show ? tooltipId : undefined}
    >
      {children}
      {show && (
        <span
          id={tooltipId}
          role="tooltip"
          className={`
          absolute z-50 ${sideClasses[side]}
          w-max max-w-xs
          px-3 py-2 rounded
          bg-shadow border border-gold/30
          text-parchment text-xs font-body
          shadow-[0_4px_16px_rgba(13,6,0,0.6)]
          pointer-events-none animate-fade-in
        `}>
          {content}
        </span>
      )}
    </span>
  );
}
