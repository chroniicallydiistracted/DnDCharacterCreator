import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: `
    bg-gradient-to-b from-gold to-gold-dark
    text-shadow font-display font-semibold text-dark-ink
    border-2 border-gold-dark
    shadow-[0_3px_0_rgba(13,6,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]
    hover:from-[#D4B050] hover:to-gold
    active:shadow-none active:translate-y-px
    disabled:opacity-40 disabled:cursor-not-allowed
  `,
  secondary: `
    bg-gradient-to-b from-parchment to-aged-paper
    text-dark-ink font-display font-semibold
    border-2 border-gold/50
    shadow-[0_3px_0_rgba(13,6,0,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]
    hover:border-gold
    active:shadow-none active:translate-y-px
    disabled:opacity-40 disabled:cursor-not-allowed
  `,
  ghost: `
    bg-transparent text-gold font-display font-semibold
    border border-gold/30
    hover:bg-gold/10 hover:border-gold/60
    active:bg-gold/20
    disabled:opacity-40 disabled:cursor-not-allowed
  `,
  danger: `
    bg-gradient-to-b from-crimson-light to-crimson
    text-parchment font-display font-semibold
    border-2 border-crimson
    shadow-[0_3px_0_rgba(13,6,0,0.5)]
    hover:from-crimson hover:to-crimson
    active:shadow-none active:translate-y-px
    disabled:opacity-40 disabled:cursor-not-allowed
  `,
};

const sizeClasses: Record<Size, string> = {
  sm:  'px-3 py-1.5 text-xs gap-1.5',
  md:  'px-5 py-2.5 text-sm gap-2',
  lg:  'px-7 py-3 text-base gap-2.5',
};

export function Button({
  variant = 'primary',
  size    = 'md',
  loading = false,
  icon,
  iconRight,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center
        rounded transition-all duration-150
        select-none tracking-wide
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      ) : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
}
