import React, { useRef, useState } from 'react';
import { Card } from '@/types/database.types';
import { useBuilderStore } from '@/store/builder-store';
import { Check } from 'lucide-react';
import { useCardPress } from './hooks/useCardPress';

interface CardTileProps {
  card: Card;
  inDeckCount?: number;
}

export const CardTile = ({ card, inDeckCount = 0 }: CardTileProps) => {
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
      className="relative aspect-[2/3] rounded-[7px] overflow-hidden border cursor-pointer select-none transition-[border-color]"
      style={{ borderColor: justAdded ? 'var(--color-arcade-green)' : 'var(--color-arcade-border)', background: 'var(--color-arcade-panel)' }}
    >
      {card.image_url_small ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={card.image_url_small} alt={card.name} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="p-1 font-heading font-semibold text-[9px] text-[var(--color-arcade-text)] leading-tight">{card.name}</div>
      )}

      {inDeckCount > 0 && (
        <div className="absolute top-1 left-1 min-w-[17px] h-[17px] px-1 bg-[var(--color-arcade-bg)]/90 border border-[var(--color-arcade-border)] rounded grid place-items-center font-mono font-bold text-[8px] text-[var(--color-arcade-text)]">
          ×{inDeckCount}
        </div>
      )}

      {justAdded && (
        <div className="absolute inset-0 bg-[var(--color-arcade-green)]/25 grid place-items-center">
          <div className="w-7 h-7 rounded-full bg-[var(--color-arcade-green)] grid place-items-center">
            <Check className="w-4 h-4 text-[var(--color-arcade-bg)]" />
          </div>
        </div>
      )}
    </div>
  );
};
