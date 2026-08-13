'use client';

import { useEffect, useState } from 'react';
import { useDuelStore } from '@/store/duel-store';
import { getUserDuelDecks, DuelDeckOption } from '@/app/duel/actions';

interface DeckPopupProps {
  open: boolean;
  onClose: () => void;
}

export const DeckPopup = ({ open, onClose }: DeckPopupProps) => {
  const { p1DeckId, setPlayer1Deck } = useDuelStore();
  const [decks, setDecks] = useState<DuelDeckOption[] | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    getUserDuelDecks().then(result => {
      if (!cancelled) setDecks(result);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  const pick = (deck: DuelDeckOption) => {
    setPlayer1Deck(deck);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-40 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-xl p-4 flex flex-col gap-2.5 w-[240px] max-h-[70vh]"
        onClick={e => e.stopPropagation()}
      >
        <span className="font-mono font-bold text-[11px] tracking-wide text-[var(--color-arcade-text-muted)]">SELECT DECK</span>

        {decks === null ? (
          <div className="h-[42px] grid place-items-center font-mono text-xs text-[var(--color-arcade-text-muted)]">Loading…</div>
        ) : decks.length === 0 ? (
          <div className="font-mono text-[10.5px] leading-relaxed text-[var(--color-arcade-text-muted)]">
            No saved decks yet — build one from the Decks screen first.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 overflow-y-auto thin-scroll">
            {decks.map(deck => (
              <button
                key={deck.id}
                onClick={() => pick(deck)}
                className="h-[42px] px-3 rounded-lg flex items-center font-heading font-bold text-[13px] text-[var(--color-arcade-text)] text-left"
                style={{
                  background: 'var(--color-arcade-surface)',
                  border: `1px solid ${deck.id === p1DeckId ? 'var(--color-arcade-cyan)' : 'var(--color-arcade-border)'}`,
                }}
              >
                {deck.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
