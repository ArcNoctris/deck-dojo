import React, { useRef, useState } from 'react';
import { Card } from '@/types/database.types';
import { useBuilderStore } from '@/store/builder-store';
import { Check, Plus } from 'lucide-react';
import { useCardPress } from './hooks/useCardPress';

interface CardRowProps {
  card: Card;
  inDeckCount?: number;
  style?: React.CSSProperties; // For virtualizer positioning
}

export const CardRow = ({ card, inDeckCount = 0, style }: CardRowProps) => {
  const addCard = useBuilderStore((state) => state.addCard);
  const setActivePreviewCard = useBuilderStore((state) => state.setActivePreviewCard);
  const [justAdded, setJustAdded] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAdd = () => {
    let location: 'main' | 'extra' | 'side' = 'main';
    const type = card.type?.toLowerCase() || '';
    if (type.includes('fusion') || type.includes('synchro') || type.includes('xyz') || type.includes('link') || type.includes('token')) {
      location = 'extra';
    }
    addCard(card, location);

    setJustAdded(true);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setJustAdded(false), 700);
  };

  const press = useCardPress({
    onTap: handleAdd,
    onHold: () => setActivePreviewCard({ ...card, instanceId: 'preview', userTag: null }),
  });

  return (
    <div
      {...press}
      className="relative flex items-center gap-3 px-3 border-b transition-colors box-border w-full cursor-pointer select-none"
      style={{
        ...style,
        borderColor: 'var(--color-arcade-border)',
        background: justAdded ? 'rgba(53,208,127,.14)' : undefined,
      }}
    >
      {/* Thumbnail */}
      <div className="w-[42px] h-[61px] relative bg-[var(--color-arcade-surface)] overflow-hidden rounded-sm flex-shrink-0 border border-[var(--color-arcade-border)]">
          {card.image_url_small ? (
              <img src={card.image_url_small} alt={card.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
              <div className="w-full h-full bg-[var(--color-arcade-panel)] flex items-center justify-center text-[8px] text-[var(--color-arcade-text-muted)]">NO IMG</div>
          )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center h-full py-2">
        <h4 className="font-heading text-[var(--color-arcade-text)] text-sm font-semibold truncate leading-tight">{card.name}</h4>
        <div className="flex items-center gap-2 mt-0.5">
             <span className="font-mono text-[var(--color-arcade-text-muted)] text-[10px] uppercase truncate">{card.type}</span>
             {card.level && <span className="font-mono text-[var(--color-arcade-amber)] text-[10px]">LV{card.level}</span>}
        </div>
      </div>

      {/* In-deck qty badge */}
      {inDeckCount > 0 && (
        <div className="min-w-[26px] h-[22px] px-1.5 rounded-md grid place-items-center bg-[var(--color-arcade-inset)] border border-[var(--color-arcade-border)] font-heading font-bold text-[11px] text-[var(--color-arcade-text)] flex-none">
          ×{inDeckCount}
        </div>
      )}

      {/* Add indicator (whole row is tappable — hold for info) */}
      <div
        className="w-[36px] h-[36px] flex items-center justify-center shrink-0 rounded-lg transition-colors flex-none"
        style={{ background: justAdded ? 'var(--color-arcade-green)' : 'var(--color-arcade-cyan)', color: 'var(--color-arcade-bg)' }}
        aria-label={`Add ${card.name}`}
      >
        {justAdded ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      </div>
    </div>
  );
};
