'use client';

import React, { useMemo } from 'react';
import { useBuilderStore } from '@/store/builder-store';
import { calculateProbability } from '@/utils/math/hypergeometric';
import { ArrowUp, ArrowDown, Minus, Plus } from 'lucide-react';

export const DeckStats = () => {
    const { mainDeck } = useBuilderStore();

    const stats = useMemo(() => {
        const deckSize = mainDeck.length;
        if (deckSize === 0) return null;

        const starters = mainDeck.filter(c => c.userTag === 'starter').length;
        const bricks = mainDeck.filter(c => c.userTag === 'brick').length;
        const handTraps = mainDeck.filter(c => c.userTag === 'hand-trap').length;

        // Helper to calculate odds and deltas
        const getOdds = (count: number) => {
            const current = calculateProbability(deckSize, count, 5, 1);
            
            // Delta +1 (Add a copy): Deck size + 1, Count + 1
            const plus = calculateProbability(deckSize + 1, count + 1, 5, 1);
            
            // Delta -1 (Remove a copy): Deck size - 1, Count - 1
            const minus = count > 0 ? calculateProbability(deckSize - 1, count - 1, 5, 1) : 0;

            return { current, plus, minus };
        };

        return {
            starters: { count: starters, ...getOdds(starters) },
            bricks: { count: bricks, ...getOdds(bricks) },
            defense: { count: handTraps, ...getOdds(handTraps) }
        };
    }, [mainDeck]);

    if (!stats) return (
        <div className="text-center text-gray-500 font-mono text-sm py-4">
            ADD CARDS TO ENABLE ANALYTICS
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <StatCard 
                label="OPEN STARTER" 
                data={stats.starters}
                total={mainDeck.length}
                colorClass={stats.starters.current >= 80 ? 'text-green-500' : stats.starters.current < 70 ? 'text-red-500' : 'text-yellow-500'}
            />
            <StatCard 
                label="OPEN BRICK" 
                data={stats.bricks}
                total={mainDeck.length}
                colorClass={stats.bricks.current > 20 ? 'text-red-500' : 'text-gray-400'}
                inverse // For bricks, increasing probability is bad
            />
            <StatCard 
                label="OPEN HAND TRAP" 
                data={stats.defense}
                total={mainDeck.length}
                colorClass="text-blue-400"
            />
        </div>
    );
};

interface StatData {
    count: number;
    current: number;
    plus: number;
    minus: number;
}

interface StatCardProps {
    label: string;
    data: StatData;
    total: number;
    colorClass: string;
    inverse?: boolean;
}

const StatCard = ({ label, data, total, colorClass, inverse = false }: StatCardProps) => {
    const diffPlus = data.plus - data.current;
    const diffMinus = data.minus - data.current;

    return (
        <div className="bg-navy-800/50 border border-navy-700 rounded-lg p-4 flex flex-col shadow-lg hover:border-cyan-500/30 transition-colors group">
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest group-hover:text-cyan-500 transition-colors">{label}</span>
                <span className="text-[10px] text-gray-600 font-mono bg-navy-900 px-2 py-0.5 rounded-full">
                    {data.count} / {total}
                </span>
            </div>
            
            <div className="flex items-baseline gap-1 mb-4">
                <div className={`font-heading text-4xl font-bold ${colorClass} tabular-nums tracking-tighter`}>
                    {data.current.toFixed(1)}
                </div>
                <span className="text-sm font-bold text-gray-600">%</span>
            </div>

            {/* Ratio Lab */}
            <div className="mt-auto border-t border-navy-700/50 pt-3 grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="flex flex-col gap-1">
                    <span className="text-gray-500 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> 1 COPY
                    </span>
                    <span className={`flex items-center gap-1 ${getDiffColor(diffPlus, inverse)}`}>
                        {diffPlus > 0 ? <ArrowUp className="w-3 h-3" /> : diffPlus < 0 ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {Math.abs(diffPlus).toFixed(1)}%
                    </span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                    <span className="text-gray-500 flex items-center justify-end gap-1">
                        <Minus className="w-3 h-3" /> 1 COPY
                    </span>
                    <span className={`flex items-center justify-end gap-1 ${getDiffColor(diffMinus, inverse)}`}>
                        {diffMinus > 0 ? <ArrowUp className="w-3 h-3" /> : diffMinus < 0 ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {Math.abs(diffMinus).toFixed(1)}%
                    </span>
                </div>
            </div>
        </div>
    );
};

const getDiffColor = (diff: number, inverse: boolean) => {
    if (Math.abs(diff) < 0.1) return 'text-gray-500';
    if (inverse) {
        return diff > 0 ? 'text-red-400' : 'text-green-400';
    }
    return diff > 0 ? 'text-green-400' : 'text-red-400';
};
