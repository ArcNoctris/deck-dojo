'use client';

import React, { useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { createClient } from '@/utils/supabase/client';
import { CardRow } from './CardRow';
import { Card } from '@/types/database.types';
import { useBuilderStore } from '@/store/builder-store';

const ROW_HEIGHT = 70; // Height of CardRow

export const VirtualCardList = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const { activeFilters } = useBuilderStore();

  // Fetch ALL cards (cached)
  const { data: allCards = [], isLoading } = useQuery({
    queryKey: ['allCards'],
    queryFn: async () => {
      // console.log('Fetching full card database...');
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .order('name'); 
      
      if (error) throw error;
      return data as Card[];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
  });

  // Filter locally
  const filteredCards = useMemo(() => {
    let result = allCards;
    
    // Text Filter
    if (activeFilters.text) {
        const lowerTerm = activeFilters.text.toLowerCase();
        result = result.filter(card => card.name.toLowerCase().includes(lowerTerm));
    }

    // Attribute Filter
    if (activeFilters.attributes.length > 0) {
        result = result.filter(card => 
            card.attribute && activeFilters.attributes.includes(card.attribute)
        );
    }

    // Race Filter (Type/Property)
    if (activeFilters.race) {
        result = result.filter(card => card.race === activeFilters.race);
    }

    // Archetype Filter
    if (activeFilters.archetype) {
        result = result.filter(card => card.archetype === activeFilters.archetype);
    }

    // Card Type Filter (Monster, Spell, Trap)
    if (activeFilters.cardType) {
        const type = activeFilters.cardType;
        result = result.filter(card => {
            if (!card.type) return false;
            if (type === 'monster') return card.type.includes('Monster');
            if (type === 'spell') return card.type.includes('Spell');
            if (type === 'trap') return card.type.includes('Trap');
            return false;
        });
    }

    // Level/Rank/Link Filter
    // Only apply if range is restricted or user specifically wants to filter by level
    // We assume default [0, 13] covers everything including non-level cards (treated as 0)
    // But if min > 0, we likely exclude Spells/Traps unless they have levels/scales.
    const [min, max] = activeFilters.level;
    if (min > 0 || max < 13) {
        result = result.filter(card => {
             // Treat nulls as 0
             const lvl = card.level || card.scale || card.linkval || 0;
             // If card has no level stats and is not a monster, usually it's a Spell/Trap (lvl 0).
             // If filter is 1-12, Spells (0) are excluded. This is correct behavior for "Level 1-12".
             return lvl >= min && lvl <= max;
        });
    }

    return result;
  }, [allCards, activeFilters]);

  // Virtualizer
  const rowVirtualizer = useVirtualizer({
    count: filteredCards.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  if (isLoading && allCards.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-cyan-500 font-mono text-sm animate-pulse">Initializing Database...</span>
        </div>
      );
  }

  if (filteredCards.length === 0) {
      return <div className="p-8 text-gray-500 font-mono text-center text-sm">NO RESULTS FOUND</div>;
  }

  return (
    <div 
      ref={parentRef} 
      className="h-full w-full overflow-y-auto contain-strict scrollbar-thin scrollbar-thumb-navy-800 scrollbar-track-transparent"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const card = filteredCards[virtualItem.index];
          return (
            <CardRow
              key={card.id}
              card={card}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
