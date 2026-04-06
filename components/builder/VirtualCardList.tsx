'use client';

import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CardRow } from './CardRow';
import { useBuilderStore } from '@/store/builder-store';
import { searchCards } from '@/utils/supabase/queries';
import { getOracleRecommendations } from '@/app/deck/[id]/actions';
import { Sparkles, Plus } from 'lucide-react';
import { toast } from 'sonner';

const ROW_HEIGHT = 70; // Height of CardRow

export const VirtualCardList = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const { activeFilters, mainDeck, addCard } = useBuilderStore();

  // Server-Side Search
  const { data: filteredCards = [], isLoading, isFetching } = useQuery({
    queryKey: ['cards', activeFilters],
    queryFn: () => searchCards(activeFilters),
    staleTime: 1000 * 60 * 5, // Cache results for 5 mins
    refetchOnWindowFocus: false,
  });

  // Top 3 Oracle Cards
  const { data: recommendations = [] } = useQuery({
    queryKey: ['oracle', mainDeck.map(c => c.id).join(',')],
    queryFn: () => getOracleRecommendations(mainDeck),
    staleTime: 60000,
  });

  const top3Oracle = recommendations.slice(0, 3);
  
  // Has active filter? If yes, maybe hide oracle
  const isSearchActive = activeFilters.text.length > 0 || activeFilters.attributes.length > 0 || activeFilters.race || activeFilters.archetype || activeFilters.cardType;

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
    <div className="h-full w-full flex flex-col">
      {/* Top 3 Oracle Recommendations (Only show if no search is active) */}
      {!isSearchActive && top3Oracle.length > 0 && (
          <div className="shrink-0 p-4 border-b border-navy-800 bg-navy-950/50">
              <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-focus-amber" />
                  <span className="font-heading text-xs tracking-widest text-focus-amber uppercase">Oracle Top Picks</span>
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                  {top3Oracle.map((card) => (
                      <div key={`oracle-${card.id}`} className="relative group shrink-0 w-16 md:w-20 aspect-[2/3]">
                         <button
                             onClick={() => {
                                addCard(card, 'main');
                                toast.success(`${card.name} added to Main Deck`, {
                                    icon: <Sparkles className="w-4 h-4 text-focus-amber" />,
                                    style: { background: '#0B0C10', borderColor: '#F9ED69', color: '#F9ED69' }
                                });
                             }}
                             className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]"
                         >
                             <Plus className="w-6 h-6 text-focus-amber" />
                         </button>
                         <div className="w-full h-full rounded-sm overflow-hidden border border-focus-amber/30 group-hover:border-focus-amber shadow-sm bg-navy-800">
                           {card.image_url_small ? (
                               <img src={card.image_url_small} alt={card.name} className="w-full h-full object-cover" loading="lazy" />
                           ) : (
                               <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-500 font-mono text-center p-1 leading-tight">
                                   {card.name}
                               </div>
                           )}
                         </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      <div 
        ref={parentRef} 
        className="flex-1 w-full overflow-y-auto contain-strict scrollbar-thin scrollbar-thumb-navy-800 scrollbar-track-transparent"
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
            <div className="absolute bottom-2 right-4 text-[10px] text-cyan-500 animate-pulse bg-navy-900/80 px-2 rounded z-10">
                REFRESHING...
            </div>
        )}
      </div>
    </div>
  );
};
