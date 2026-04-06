'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBuilderStore } from '@/store/builder-store';
import { getOracleRecommendations } from '@/app/deck/[id]/actions';
import { CyberCard } from '@/components/ui/CyberCard';
import { Sparkles, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export const OracleRecommendations = () => {
  const { mainDeck, addCard } = useBuilderStore();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['oracle', mainDeck.map(c => c.id).join(',')],
    queryFn: () => getOracleRecommendations(mainDeck),
    staleTime: 60000,
  });

  const handleAdd = (card: any) => {
    addCard(card, 'main');
    toast.success(`${card.name} added to Main Deck`, {
        icon: <Sparkles className="w-4 h-4 text-focus-amber" />,
        style: { background: '#0B0C10', borderColor: '#F9ED69', color: '#F9ED69' }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-focus-amber">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <span className="font-heading tracking-widest animate-pulse">ORACLE IS ANALYZING...</span>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-500 font-mono text-sm">
        <Sparkles className="w-12 h-12 text-navy-800 mb-4" />
        ADD MORE CARDS TO YOUR DECK FOR THE ORACLE TO FIND PATTERNS
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 custom-scrollbar">
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {recommendations.map((card) => (
          <div key={card.id} className="relative group aspect-[2/3]">
            <button
                onClick={() => handleAdd(card)}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]"
            >
                <div className="bg-focus-amber text-black p-2 rounded-full mb-2 transform scale-75 group-hover:scale-100 transition-transform">
                    <Plus className="w-6 h-6" />
                </div>
                <span className="font-heading text-focus-amber font-bold tracking-wider text-sm shadow-black drop-shadow-md">ADD TO MAIN</span>
            </button>

            <div className="w-full h-full rounded-sm overflow-hidden border border-navy-800 shadow-sm group-hover:border-focus-amber group-hover:shadow-[0_0_15px_rgba(249,237,105,0.4)] transition-all bg-navy-800">
              {card.image_url_small ? (
                  <img src={card.image_url_small} alt={card.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                  <div className="w-full h-full bg-navy-800 flex items-center justify-center text-[10px] text-gray-500 font-mono text-center p-2 leading-tight">
                      {card.name}
                  </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};