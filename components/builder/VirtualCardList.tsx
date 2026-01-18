'use client';

import React, { useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { createClient } from '@/utils/supabase/client';
import { CardRow } from './CardRow';
import { Card } from '@/types/database.types';

const ROW_HEIGHT = 70; // Height of CardRow

export const VirtualCardList = ({ searchTerm }: { searchTerm: string }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Fetch ALL cards (cached)
  const { data: allCards = [], isLoading } = useQuery({
    queryKey: ['allCards'],
    queryFn: async () => {
      console.log('Fetching full card database...');
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .order('name'); 
      
      if (error) throw error;
      return data as Card[];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (static data mostly)
    refetchOnWindowFocus: false,
  });

  // Filter locally
  const filteredCards = useMemo(() => {
    if (!searchTerm) return allCards;
    const lowerTerm = searchTerm.toLowerCase();
    // Simple name search. Can be expanded to type/attribute etc.
    return allCards.filter(card => 
      card.name.toLowerCase().includes(lowerTerm)
    );
  }, [allCards, searchTerm]);

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
