'use client';

import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CardRow } from './CardRow';
import { useBuilderStore } from '@/store/builder-store';
import { searchCards } from '@/utils/supabase/queries';

const ROW_HEIGHT = 70; // Height of CardRow

export const VirtualCardList = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const { activeFilters } = useBuilderStore();

  // Server-Side Search
  const { data: filteredCards = [], isLoading, isFetching } = useQuery({
    queryKey: ['cards', activeFilters],
    queryFn: () => searchCards(activeFilters),
    staleTime: 1000 * 60 * 5, // Cache results for 5 mins
    refetchOnWindowFocus: false,
  });

  // Virtualizer
  const rowVirtualizer = useVirtualizer({
    count: filteredCards.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-cyan-500 font-mono text-sm animate-pulse">Scanning Database...</span>
        </div>
      );
  }

  if (filteredCards.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center px-4">
             <div className="text-gray-500 font-mono text-sm mb-2">NO SIGNALS DETECTED</div>
             <p className="text-xs text-gray-600 max-w-[200px]">
                 Adjust your filters to broaden the search parameters.
             </p>
        </div>
      );
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
      {isFetching && !isLoading && (
          <div className="absolute bottom-2 right-4 text-[10px] text-cyan-500 animate-pulse bg-navy-900/80 px-2 rounded">
              REFRESHING...
          </div>
      )}
    </div>
  );
};
