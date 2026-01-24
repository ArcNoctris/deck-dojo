'use client';

import React from 'react';
import { useBuilderStore } from '@/store/builder-store';
import { DeckCard } from '@/types/deck';
import { X, Layers, Box, Archive } from 'lucide-react';

const StackedCard = ({ card, count, onRemove }: { card: DeckCard, count: number, onRemove: () => void }) => {
  return (
    <div className="relative aspect-[2/3] group w-full">
      {/* Stack Layers */}
      {count > 1 && (
        <div className="absolute top-0 left-0 w-full h-full bg-navy-800 rounded-sm border border-navy-700 translate-x-1 translate-y-1 z-0" />
      )}
      {count > 2 && (
        <div className="absolute top-0 left-0 w-full h-full bg-navy-800 rounded-sm border border-navy-700 translate-x-2 translate-y-2 z-0" />
      )}

      {/* Main Card */}
      <div className="absolute top-0 left-0 w-full h-full z-10 hover:z-20 transition-all hover:-translate-y-1">
         <button 
            onClick={onRemove}
            className="absolute -top-1 -right-1 z-30 bg-red-500 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
            aria-label="Remove card"
         >
            <X className="w-2 h-2" />
         </button>

         <div className="w-full h-full rounded-sm overflow-hidden border border-navy-800 shadow-sm group-hover:border-cyan-500 group-hover:shadow-[0_0_10px_rgba(8,217,214,0.3)] bg-navy-800 relative">
            {card.image_url_small ? (
                <img src={card.image_url_small} alt={card.name} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-[6px] text-center p-1 font-mono text-gray-500">
                    {card.name}
                </div>
            )}
            
            {/* Count Badge */}
            <div className="absolute bottom-0 right-0 bg-cyan-500 text-navy-900 font-bold text-[10px] px-1 rounded-tl-sm">
                x{count}
            </div>
         </div>
      </div>
    </div>
  );
};

const Section = ({ title, cards, isStacked, onRemove, location }: { title: string, cards: DeckCard[], isStacked: boolean, onRemove: (id: string, loc: any) => void, location: string }) => {
    if (cards.length === 0) return null;

    let items: React.ReactNode[] = [];

    if (isStacked) {
        const grouped = new Map<number, { card: DeckCard, count: number, instanceIds: string[] }>();
        cards.forEach(c => {
            if (!grouped.has(c.id)) {
                grouped.set(c.id, { card: c, count: 0, instanceIds: [] });
            }
            const entry = grouped.get(c.id)!;
            entry.count++;
            entry.instanceIds.push(c.instanceId);
        });
        
        items = Array.from(grouped.values()).map(row => (
            <StackedCard 
                key={row.card.id} 
                card={row.card} 
                count={row.count} 
                onRemove={() => onRemove(row.instanceIds[0], location)}
            />
        ));
    } else {
        items = cards.map(card => (
            <div key={card.instanceId} className="relative group aspect-[2/3]">
                 <button 
                    onClick={() => onRemove(card.instanceId, location)}
                    className="absolute -top-1 -right-1 z-20 bg-red-500 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                    aria-label="Remove card"
                 >
                    <X className="w-2 h-2" />
                 </button>
                 <div className="w-full h-full rounded-sm overflow-hidden border border-navy-800 shadow-sm group-hover:border-cyan-500 transition-all bg-navy-800">
                    {card.image_url_small ? (
                        <img src={card.image_url_small} alt={card.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[6px] text-center p-1 font-mono text-gray-500">
                            {card.name}
                        </div>
                    )}
                 </div>
            </div>
        ));
    }

    return (
        <div className="mb-4">
            <h4 className="font-heading text-xs text-cyan-500 border-b border-navy-800 mb-2 uppercase tracking-widest">{title}</h4>
            <div className="grid grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                {items}
            </div>
        </div>
    );
};

export const CompactView = () => {
  const { mainDeck, extraDeck, sideDeck, isStacked, removeCard } = useBuilderStore();
  const hasCards = mainDeck.length > 0 || extraDeck.length > 0 || sideDeck.length > 0;

  if (!hasCards) {
      return <div className="p-8 text-center text-gray-500 font-mono text-xs">NO CARDS</div>;
  }

  return (
    <div className="p-4 overflow-y-auto h-full pb-32">
        <Section title="Main Deck" cards={mainDeck} isStacked={isStacked} onRemove={removeCard} location="main" />
        <Section title="Extra Deck" cards={extraDeck} isStacked={isStacked} onRemove={removeCard} location="extra" />
        <Section title="Side Deck" cards={sideDeck} isStacked={isStacked} onRemove={removeCard} location="side" />
    </div>
  );
};
