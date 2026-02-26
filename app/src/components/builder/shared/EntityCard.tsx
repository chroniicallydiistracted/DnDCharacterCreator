import React from 'react';
import { Badge } from '../../ui/Badge';
import { formatSource } from '../../../services/data.service';

interface EntityCardProps {
  name: string;
  subtitle?: string;
  source?: [string, number][];
  badges?: { label: string; color?: 'gold' | 'crimson' | 'stone' | 'green' | 'blue' }[];
  selected?: boolean;
  onClick?: () => void;
  preview?: React.ReactNode;
  icon?: string;
}

export function EntityCard({
  name, subtitle, source, badges, selected, onClick, preview, icon,
}: EntityCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded border-2 overflow-hidden
        bg-parchment-texture
        transition-all duration-200 cursor-pointer group
        ${selected
          ? 'border-gold shadow-card-hover glow-gold'
          : 'border-gold/25 shadow-card hover:border-gold/60 hover:shadow-card-hover'}
      `}
    >
      {/* Card header strip */}
      <div className={`
        px-3 py-2
        border-b border-gold/20
        transition-colors duration-200
        ${selected ? 'bg-gold/20' : 'bg-leather/60 group-hover:bg-leather/80'}
      `}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {icon && <span className="text-lg flex-shrink-0">{icon}</span>}
            <div className="min-w-0">
              <h3 className={`
                font-display text-sm font-semibold leading-tight truncate
                ${selected ? 'text-gold' : 'text-parchment group-hover:text-gold'}
                transition-colors duration-150
              `}>
                {name}
              </h3>
              {subtitle && (
                <div className="text-[10px] text-stone/80 truncate">{subtitle}</div>
              )}
            </div>
          </div>
          {selected && (
            <span className="text-gold flex-shrink-0 text-base">✓</span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="px-3 py-2 space-y-2">
        {/* Badges */}
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {badges.map((b, i) => (
              <Badge key={i} color={b.color ?? 'gold'}>{b.label}</Badge>
            ))}
          </div>
        )}

        {/* Preview content */}
        {preview && (
          <div className="text-xs text-dark-ink/80 font-body line-clamp-3 leading-relaxed">
            {preview}
          </div>
        )}

        {/* Source */}
        {source && (
          <div className="text-[9px] font-display uppercase tracking-widest text-stone/60">
            {formatSource(source)}
          </div>
        )}
      </div>
    </div>
  );
}
