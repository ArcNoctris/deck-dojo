'use client';

import React from 'react';
import { useBuilderStore } from '@/store/builder-store';
import { DeckCard, UserTag } from '@/types/deck';
import { X, Layers, Box, Archive } from 'lucide-react';
import { CardContextMenu } from '../CardContextMenu';

const TAG_COLORS: Record<string, string> = {
    starter: 'bg-green-500',
    extender: 'bg-yellow-500',
    brick: 'bg-red-500',
    engine: 'bg-purple-500',
    flex: 'bg-blue-500',
    defense: 'bg-gray-500'
};

const TagRibbon = ({ tag }: { tag: UserTag }) => {
    if (!tag || !TAG_COLORS[tag]) return null;
    return (
        <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden rounded-tr-sm z-20">
            <div className={`absolute top-0 right-0 w-12 h-4 ${TAG_COLORS[tag]} opacity-90 rotate-45 translate-x-[14px] translate-y-[6px] shadow-sm`} />
        </div>
    );
};

const StackedCard = ({ card, count, onRemove, location }: { card: DeckCard, count: number, onRemove: () => void, location: 'main' | 'extra' | 'side' }) => {
  const { moveCard } = useBuilderStore();

  const handleDoubleClick = () => {
        if (location === 'main') moveCard(card.instanceId, 'main', 'side');
        else if (location === 'extra') moveCard(card.instanceId, 'extra', 'side');
        else if (location === 'side') {
            const isExtra = card.type && (card.type.includes('Fusion') || card.type.includes('Synchro') || card.type.includes('XYZ') || card.type.includes('Link'));
            if (isExtra) moveCard(card.instanceId, 'side', 'extra');
            else moveCard(card.instanceId, 'side', 'main');
        }
  };

  return (
    <CardContextMenu instanceId={card.instanceId} location={location} cardType={card.type}>
        <div 
            className="relative aspect-[2/3] group w-full select-none"
            onDoubleClick={handleDoubleClick}
        >
        {/* Stack Layers */}
        {count > 1 && (
            <div className="absolute top-0 left-0 w-full h-full bg-navy-800 rounded-sm border border-navy-700 translate-x-1 translate-y-1 z-0" />
        )}
        {count > 2 && (
            <div className="absolute top-0 left-0 w-full h-full bg-navy-800 rounded-sm border border-navy-700 translate-x-2 translate-y-2 z-0" />
        )}

        {/* Main Card */}
        <div className="absolute top-0 left-0 w-full h-full z-10 hover:z-20 transition-all hover:-translate-y-1">
            <TagRibbon tag={card.userTag} />
            
            <button 
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
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
    </CardContextMenu>
  );
};

const Section = ({ title, cards, isStacked, onRemove, location }: { title: string, cards: DeckCard[], isStacked: boolean, onRemove: (id: string, loc: any) => void, location: 'main' | 'extra' | 'side' }) => {
    if (cards.length === 0) return null;

    let items: React.ReactNode[] = [];
    const { moveCard } = useBuilderStore();

    if (isStacked) {
        const grouped = new Map<string, { card: DeckCard, count: number, instanceIds: string[] }>();
        cards.forEach(c => {
            const key = `${c.id}-${c.userTag || ''}`;
            if (!grouped.has(key)) {
                grouped.set(key, { card: c, count: 0, instanceIds: [] });
            }
            const entry = grouped.get(key)!;
            entry.count++;
            entry.instanceIds.push(c.instanceId);
        });
        
        items = Array.from(grouped.values()).map(row => (
            <StackedCard 
                key={`${row.card.id}-${row.card.userTag}`} 
                card={row.card} 
                count={row.count} 
                location={location}
                onRemove={() => onRemove(row.instanceIds[0], location)}
            />
        ));
    } else {
        items = cards.map(card => {
            const handleDoubleClick = () => {
                if (location === 'main') moveCard(card.instanceId, 'main', 'side');
                else if (location === 'extra') moveCard(card.instanceId, 'extra', 'side');
                else if (location === 'side') {
                    const isExtra = card.type && (card.type.includes('Fusion') || card.type.includes('Synchro') || card.type.includes('XYZ') || card.type.includes('Link'));
                    if (isExtra) moveCard(card.instanceId, 'side', 'extra');
                    else moveCard(card.instanceId, 'side', 'main');
                }
            };

            return (
                <CardContextMenu key={card.instanceId} instanceId={card.instanceId} location={location} cardType={card.type}>
                    <div 
                        className="relative group aspect-[2/3] select-none"
                        onDoubleClick={handleDoubleClick}
                    >
                        <TagRibbon tag={card.userTag} />
                        <button 
                            onClick={(e) => { e.stopPropagation(); onRemove(card.instanceId, location); }}
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
                </CardContextMenu>
            );
        });
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
