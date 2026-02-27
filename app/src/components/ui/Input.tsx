import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, hint, error, icon, className = '', id: userProvidedId, ...props }: InputProps) {
  const autoId = useId();
  const id = userProvidedId ?? autoId;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-display uppercase tracking-wider text-stone">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone">
            {icon}
          </span>
        )}
        <input
          id={id}
          className={`
            w-full px-3 py-2 rounded
            bg-aged-paper border-2
            font-body text-dark-ink placeholder:text-stone/50
            transition-colors duration-150
            ${error ? 'border-crimson' : 'border-gold/40 focus:border-gold'}
            focus:outline-none
            ${icon ? 'pl-9' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-crimson">{error}</p>}
      {hint && !error && <p className="text-xs text-stone">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export function Textarea({ label, hint, className = '', id: userProvidedId, ...props }: TextareaProps) {
  const autoId = useId();
  const id = userProvidedId ?? autoId;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-display uppercase tracking-wider text-stone">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`
          w-full px-3 py-2 rounded
          bg-aged-paper border-2 border-gold/40
          font-body text-dark-ink placeholder:text-stone/50
          focus:border-gold focus:outline-none
          resize-y min-h-[80px]
          transition-colors duration-150
          ${className}
        `}
        {...props}
      />
      {hint && <p className="text-xs text-stone">{hint}</p>}
    </div>
  );
}
