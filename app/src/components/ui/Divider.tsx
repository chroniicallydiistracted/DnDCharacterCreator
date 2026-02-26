interface DividerProps { label?: string; className?: string }

export function Divider({ label, className = '' }: DividerProps) {
  if (!label) {
    return (
      <div className={`border-t border-gold/25 my-4 ${className}`} />
    );
  }
  return (
    <div className={`divider-gold ${className}`}>
      <span>{label}</span>
    </div>
  );
}
