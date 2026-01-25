'use client';

import React, { useMemo } from 'react';
import { DeckCard } from '@/types/deck';
import { Swords, AlertTriangle, Shield } from 'lucide-react';

export const AverageHandBreakdown = ({ deck }: { deck: DeckCard[] }) => {
    const stats = useMemo(() => {
        const deckSize = deck.length;
        if (deckSize === 0) return null;

        const starters = deck.filter(c => c.userTag === 'starter').length;
        const bricks = deck.filter(c => c.userTag === 'brick').length;
        const handTraps = deck.filter(c => c.userTag === 'hand-trap').length;

        const handSize = 5;

        return {
            starters: (starters / deckSize) * handSize,
            bricks: (bricks / deckSize) * handSize,
            handTraps: (handTraps / deckSize) * handSize
        };
    }, [deck]);

    if (!stats) return null;

    return (
        <div className="bg-navy-800/50 border border-navy-700 rounded-lg p-6">
            <h3 className="font-heading text-sm text-cyan-500 uppercase tracking-widest mb-4">Average Opening Hand</h3>
            <div className="grid grid-cols-3 gap-8">
                <div className="flex flex-col items-center p-3 bg-navy-900/50 rounded border border-navy-800">
                    <span className="text-gray-500 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Swords className="w-3 h-3" /> Starters
                    </span>
                    <span className="text-2xl font-bold text-white font-mono">{stats.starters.toFixed(1)}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-navy-900/50 rounded border border-navy-800">
                    <span className="text-gray-500 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Bricks
                    </span>
                    <span className="text-2xl font-bold text-white font-mono">{stats.bricks.toFixed(1)}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-navy-900/50 rounded border border-navy-800">
                    <span className="text-gray-500 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Hand Traps
                    </span>
                    <span className="text-2xl font-bold text-white font-mono">{stats.handTraps.toFixed(1)}</span>
                </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4 font-mono">
                *Expected Value (EV) based on 5-card draw
            </p>
        </div>
    );
};
