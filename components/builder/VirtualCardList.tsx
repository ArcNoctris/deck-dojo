'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CardRow } from './CardRow';
import { CardTile } from './CardTile';
import { useBuilderStore } from '@/store/builder-store';
import { searchCards } from '@/utils/supabase/queries';
import { getOracleRecommendations } from '@/app/deck/[id]/actions';
import { computeDominantArchetypeSynergy } from '@/utils/decks/synergy';
import { Card } from '@/types/database.types';

interface CardGroup {
  key: string;
  label: string;
  color: string;
  cards: Card[];
}

export const VirtualCardList = () => {
  const { activeFilters, mainDeck, extraDeck, sideDeck, searchViewMode } = useBuilderStore();

  const countById = new Map<number, number>();
  [...mainDeck, ...extraDeck, ...sideDeck].forEach((c) => countById.set(c.id, (countById.get(c.id) || 0) + 1));

  // Server-Side Search
  const { data: filteredCards = [], isLoading, isFetching } = useQuery({
    queryKey: ['cards', activeFilters],
    queryFn: () => searchCards(activeFilters),
    staleTime: 1000 * 60 * 5, // Cache results for 5 mins
    refetchOnWindowFocus: false,
  });

  // Oracle recommendations, used to promote a "Top Picks" group
  const { data: recommendations = [] } = useQuery({
    queryKey: ['oracle', mainDeck.map(c => c.id).join(',')],
    queryFn: () => getOracleRecommendations(mainDeck),
    staleTime: 60000,
  });

  const { archetype: dominantArchetype } = computeDominantArchetypeSynergy(mainDeck);

  if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
            <div className="w-8 h-8 border-2 border-[var(--color-arcade-cyan)] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[var(--color-arcade-cyan)] font-mono text-sm animate-pulse">Scanning Database...</span>
        </div>
      );
  }

  if (filteredCards.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center px-4">
             <div className="text-[var(--color-arcade-text-muted)] font-mono text-sm mb-2">NO SIGNALS DETECTED</div>
             <p className="text-xs text-[var(--color-arcade-text-muted)] max-w-[200px]">
                 Adjust your filters to broaden the search parameters.
             </p>
        </div>
      );
  }

  // Recommend -> archetype -> normal cards, matching the design's grouped ordering.
  const oracleIds = new Set(recommendations.map(c => c.id));
  const topPicks = filteredCards.filter(c => oracleIds.has(c.id)).slice(0, 3);
  const topIds = new Set(topPicks.map(c => c.id));

  const archetypeMatches = dominantArchetype
    ? filteredCards.filter(c => !topIds.has(c.id) && c.archetype === dominantArchetype)
    : [];
  const archIds = new Set(archetypeMatches.map(c => c.id));

  const restCards = filteredCards.filter(c => !topIds.has(c.id) && !archIds.has(c.id));

  const groups: CardGroup[] = [
    { key: 'top', label: 'TOP PICKS', color: 'var(--color-arcade-amber)', cards: topPicks },
    { key: 'arch', label: `${dominantArchetype?.toUpperCase()} MATCHES`, color: 'var(--color-arcade-cyan)', cards: archetypeMatches },
    { key: 'rest', label: 'ALL CARDS', color: 'var(--color-arcade-text-muted)', cards: restCards },
  ].filter((g) => g.cards.length > 0);

  return (
    <div className="h-full w-full overflow-y-auto thin-scroll relative">
      <div className="flex flex-col gap-4 pb-4">
        {groups.map((group) => (
          <div key={group.key} className="flex flex-col gap-1.5">
            <span
              className="font-mono font-bold text-[10px] tracking-widest px-4 pt-3"
              style={{ color: group.color }}
            >
              {group.label}
            </span>
            {searchViewMode === 'list' ? (
              <div className="flex flex-col">
                {group.cards.map((card) => <CardRow key={card.id} card={card} inDeckCount={countById.get(card.id) || 0} />)}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 px-4">
                {group.cards.map((card) => <CardTile key={card.id} card={card} inDeckCount={countById.get(card.id) || 0} />)}
              </div>
            )}
          </div>
        ))}
      </div>
      {isFetching && !isLoading && (
          <div className="sticky bottom-2 float-right mr-4 text-[10px] text-[var(--color-arcade-cyan)] animate-pulse bg-[var(--color-arcade-surface)]/80 px-2 py-1 rounded z-10">
              REFRESHING...
          </div>
      )}
    </div>
  );
};
