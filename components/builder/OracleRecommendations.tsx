'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBuilderStore } from '@/store/builder-store';
import { getOracleRecommendations } from '@/app/deck/[id]/actions';
import { Sparkles, Loader2, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/types/database.types';

export const OracleRecommendations = () => {
  const { mainDeck, extraDeck, sideDeck, addCard } = useBuilderStore();
  const [justAddedId, setJustAddedId] = useState<number | null>(null);

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['oracle', mainDeck.map(c => c.id).join(',')],
    queryFn: () => getOracleRecommendations(mainDeck),
    staleTime: 60000,
  });

  const countById = new Map<number, number>();
  [...mainDeck, ...extraDeck, ...sideDeck].forEach((c) => countById.set(c.id, (countById.get(c.id) || 0) + 1));

  const handleAdd = (card: Card) => {
    addCard(card, 'main');
    toast.success(`${card.name} added to Main Deck`, {
        icon: <Sparkles className="w-4 h-4 text-[var(--color-arcade-amber)]" />,
        style: { background: '#0B0C10', borderColor: '#F9ED69', color: '#F9ED69' }
    });
    setJustAddedId(card.id);
    setTimeout(() => setJustAddedId((cur) => (cur === card.id ? null : cur)), 700);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--color-arcade-amber)]">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <span className="font-heading tracking-widest animate-pulse">ORACLE IS ANALYZING...</span>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-[var(--color-arcade-text-muted)] font-mono text-sm">
        <Sparkles className="w-12 h-12 text-navy-800 mb-4" />
        ADD MORE CARDS TO YOUR DECK FOR THE ORACLE TO FIND PATTERNS
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 custom-scrollbar">
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {recommendations.map((card) => {
          const inDeckCount = countById.get(card.id) || 0;
          const justAdded = justAddedId === card.id;
          return (
            <div key={card.id} className="relative group aspect-[2/3]">
              <button
                  onClick={() => handleAdd(card)}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]"
              >
                  <div className="bg-[var(--color-arcade-amber)] text-black p-2 rounded-full mb-2 transform scale-75 group-hover:scale-100 transition-transform">
                      <Plus className="w-6 h-6" />
                  </div>
                  <span className="font-heading text-[var(--color-arcade-amber)] font-bold tracking-wider text-sm shadow-black drop-shadow-md">ADD TO MAIN</span>
              </button>

              {inDeckCount > 0 && (
                <div className="absolute top-1 left-1 z-10 min-w-[17px] h-[17px] px-1 bg-[var(--color-arcade-bg)]/90 border border-[var(--color-arcade-border)] rounded grid place-items-center font-mono font-bold text-[8px] text-[var(--color-arcade-text)]">
                  ×{inDeckCount}
                </div>
              )}

              {justAdded && (
                <div className="absolute inset-0 z-30 bg-[var(--color-arcade-green)]/25 grid place-items-center">
                  <div className="w-7 h-7 rounded-full bg-[var(--color-arcade-green)] grid place-items-center">
                    <Check className="w-4 h-4 text-[var(--color-arcade-bg)]" />
                  </div>
                </div>
              )}

              <div
                className="w-full h-full rounded-sm overflow-hidden border shadow-sm transition-all bg-[var(--color-arcade-panel)]"
                style={{ borderColor: justAdded ? 'var(--color-arcade-green)' : 'var(--color-arcade-border)' }}
              >
                {card.image_url_small ? (
                    <img src={card.image_url_small} alt={card.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                    <div className="w-full h-full bg-[var(--color-arcade-panel)] flex items-center justify-center text-[10px] text-[var(--color-arcade-text-muted)] font-mono text-center p-2 leading-tight">
                        {card.name}
                    </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
