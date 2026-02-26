import { formatSource } from '../../../services/data.service';

interface TraitBlockProps {
  trait?: string;
  source?: [string, number][];
  className?: string;
}

export function TraitBlock({ trait, source, className = '' }: TraitBlockProps) {
  if (!trait) return null;

  // Split on bullet characters or newlines with "•"
  const lines = trait
    .split(/\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const [heading, ...rest] = lines;

  return (
    <div className={`font-body text-sm text-dark-ink leading-relaxed ${className}`}>
      {source && (
        <div className="text-[10px] font-display uppercase tracking-wider text-stone mb-2">
          {formatSource(source)}
        </div>
      )}
      {heading && !heading.startsWith('•') && (
        <div className="font-semibold text-leather mb-1">{heading}</div>
      )}
      <ul className="space-y-1.5">
        {(heading?.startsWith('•') ? lines : rest).map((line, i) => {
          const isBullet = line.startsWith('•');
          const text     = isBullet ? line.slice(1).trim() : line;

          // Bold text before colon in bullet points
          const colonIdx = text.indexOf(':');
          const name     = colonIdx > 0 ? text.slice(0, colonIdx) : null;
          const desc     = colonIdx > 0 ? text.slice(colonIdx + 1).trim() : text;

          return isBullet ? (
            <li key={i} className="flex gap-2">
              <span className="text-gold mt-0.5 flex-shrink-0">◆</span>
              <span>
                {name && <strong className="text-leather-light">{name}:</strong>}
                {' '}{desc}
              </span>
            </li>
          ) : (
            <li key={i} className="list-none">{text}</li>
          );
        })}
      </ul>
    </div>
  );
}
