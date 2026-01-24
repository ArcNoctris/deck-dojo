'use client';

import React from 'react';
import { useBuilderStore } from '@/store/builder-store';
import { DeckCard, UserTag } from '@/types/deck';
import { X, Layers, Box, Archive } from 'lucide-react';
import { CardContextMenu } from '../CardContextMenu';

const getTypeColor = (type: string | null) => {
    if (!type) return 'bg-gray-500';
    if (type.includes('Spell')) return 'bg-green-500';
    if (type.includes('Trap')) return 'bg-pink-500';
    if (type.includes('Monster')) return 'bg-orange-500';
    return 'bg-gray-500';
};

const TAG_BADGES: Record<string, string> = {
    starter: 'bg-green-500/20 text-green-400 border-green-500/50',
    extender: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    brick: 'bg-red-500/20 text-red-400 border-red-500/50',
    engine: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    flex: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    defense: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
};

interface GroupedRowProps {
    card: DeckCard;
    count: number;
    tag: UserTag;
    instanceId: string; // One instance for context menu
    onRemove: () => void;
    location: 'main' | 'extra' | 'side';
}

const GroupedRow = ({ card, count, tag, instanceId, onRemove, location }: GroupedRowProps) => {
    const { moveCard } = useBuilderStore();

    const handleDoubleClick = () => {
        if (location === 'main') moveCard(instanceId, 'main', 'side');
        else if (location === 'extra') moveCard(instanceId, 'extra', 'side');
        else if (location === 'side') {
            const isExtra = card.type && (card.type.includes('Fusion') || card.type.includes('Synchro') || card.type.includes('XYZ') || card.type.includes('Link'));
            if (isExtra) moveCard(instanceId, 'side', 'extra');
            else moveCard(instanceId, 'side', 'main');
        }
    };

    return (
        <CardContextMenu instanceId={instanceId} location={location} cardType={card.type}>
            <div 
                className="flex items-center gap-3 bg-navy-900 border border-navy-800 p-2 rounded mb-1 relative group hover:border-cyan-500/50 transition-colors select-none"
                onDoubleClick={handleDoubleClick}
            >
                <div className={`w-1 self-stretch rounded-full ${getTypeColor(card.type)}`} />
                
                <div className="w-10 h-14 bg-navy-800 rounded overflow-hidden shrink-0">
                    {card.image_url_small && <img src={card.image_url_small} alt={card.name} className="w-full h-full object-cover" />}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white truncate">{card.name}</h4>
                        {tag && TAG_BADGES[tag] && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono uppercase ${TAG_BADGES[tag]}`}>
                                {tag}
                            </span>
                        )}
                    </div>
                    <div className="text-[10px] font-mono text-gray-500 flex gap-2">
                        <span className="uppercase">{card.race || 'Card'}</span>
                        {(card.atk !== null || card.def !== null) && (
                            <span className="text-gray-400">ATK/{card.atk} DEF/{card.def}</span>
                        )}
                    </div>
                </div>

                <div className="text-xl font-heading font-bold text-cyan-500 w-8 text-center">
                    {count}x
                </div>
                
                {/* Remove Button */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded transition-all absolute right-2 bg-navy-900"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </CardContextMenu>
    );
};

const Section = ({ title, cards, icon, onRemove, location }: { title: string, cards: DeckCard[], icon: any, onRemove: (id: string) => void, location: 'main' | 'extra' | 'side' }) => {
    // Group by ID AND Tag
    const grouped = new Map<string, { card: DeckCard, count: number, instanceIds: string[], tag: UserTag }>();
    
    cards.forEach(c => {
        const key = `${c.id}-${c.userTag || ''}`;
        if (!grouped.has(key)) {
            grouped.set(key, { card: c, count: 0, instanceIds: [], tag: c.userTag });
        }
        const entry = grouped.get(key)!;
        entry.count++;
        entry.instanceIds.push(c.instanceId);
    });
    
    const rows = Array.from(grouped.values());

    if (rows.length === 0) return null;

    return (
        <div className="mb-6">
            <h3 className="flex items-center gap-2 font-heading text-lg text-cyan-500 border-b border-navy-800 pb-2 mb-3">
                {icon} {title} <span className="text-gray-500 text-sm">({cards.length})</span>
            </h3>
            <div>
                {rows.map(row => (
                    <GroupedRow 
                        key={`${row.card.id}-${row.tag}`} 
                        card={row.card} 
                        count={row.count}
                        tag={row.tag}
                        instanceId={row.instanceIds[0]} 
                        onRemove={() => onRemove(row.instanceIds[0])}
                        location={location}
                    />
                ))}
            </div>
        </div>
    );
};

export const ListView = () => {
    const { mainDeck, extraDeck, sideDeck, removeCard } = useBuilderStore();

    const hasCards = mainDeck.length > 0 || extraDeck.length > 0 || sideDeck.length > 0;

    if (!hasCards) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 font-mono text-sm">
                NO DATA LOGGED
            </div>
        );
    }

    return (
        <div className="p-4 overflow-y-auto h-full pb-32">
             <Section title="MAIN DECK" cards={mainDeck} icon={<Layers className="w-4 h-4"/>} onRemove={(id) => removeCard(id, 'main')} location="main" />
             <Section title="EXTRA DECK" cards={extraDeck} icon={<Box className="w-4 h-4"/>} onRemove={(id) => removeCard(id, 'extra')} location="extra" />
             <Section title="SIDE DECK" cards={sideDeck} icon={<Archive className="w-4 h-4"/>} onRemove={(id) => removeCard(id, 'side')} location="side" />
        </div>
    );
};
