import React, { useEffect } from 'react';

interface ModalProps {
  open?: boolean;           // defaults to true — omit when parent controls mounting
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = { 
  sm: 'max-w-sm', 
  md: 'max-w-md', 
  lg: 'max-w-2xl', 
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] w-[95vw]'
};

export function Modal({ open = true, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-shadow/80 backdrop-blur-sm" onClick={onClose} />

      {/* Scroll container */}
      <div className={`relative w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col animate-fade-in`}>
        {/* Top ornament */}
        <div className="h-2 bg-gradient-to-r from-transparent via-gold to-transparent" />

        {/* Main surface */}
        <div className="
          flex flex-col overflow-hidden
          bg-parchment-texture
          border-2 border-gold/60
          shadow-[0_20px_60px_rgba(13,6,0,0.8)]
        ">
          {/* Header */}
          {title && (
            <div className="
              flex items-center justify-between
              px-6 py-4
              bg-leather/90 border-b border-gold/40
            ">
              <h2 className="font-display text-display-sm text-gold text-shadow">{title}</h2>
              <button
                onClick={onClose}
                className="text-stone hover:text-gold transition-colors w-8 h-8 flex items-center justify-center rounded hover:bg-gold/10"
              >
                ✕
              </button>
            </div>
          )}

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-6">{children}</div>
        </div>

        {/* Bottom ornament */}
        <div className="h-2 bg-gradient-to-r from-transparent via-gold to-transparent" />
      </div>
    </div>
  );
}
