import React, { useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Escape key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Focus trap: focus first focusable element on mount, trap Tab key
  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const dialog = dialogRef.current;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) focusable[0].focus();

    function trapFocus(e: KeyboardEvent) {
      if (e.key !== 'Tab' || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    dialog.addEventListener('keydown', trapFocus);
    return () => dialog.removeEventListener('keydown', trapFocus);
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
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
              <h2 id={titleId} className="font-display text-display-sm text-gold text-shadow">{title}</h2>
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
    </div>,
    document.body
  );
}
