'use client';

import React, { useMemo } from 'react';
import { useBuilderStore } from '@/store/builder-store';
import { calculateProbability } from '@/utils/math/hypergeometric';

export const DeckStats = () => {
    const { mainDeck } = useBuilderStore();

    const stats = useMemo(() => {
        const deckSize = mainDeck.length;
        if (deckSize === 0) return null;

        const starters = mainDeck.filter(c => c.userTag === 'starter').length;
        const bricks = mainDeck.filter(c => c.userTag === 'brick').length;
        const defense = mainDeck.filter(c => c.userTag === 'defense').length;

        // Calculate probability of opening at least 1 in a 5 card hand
        const starterProb = calculateProbability(deckSize, starters, 5, 1);
        const brickProb = calculateProbability(deckSize, bricks, 5, 1);
        const defenseProb = calculateProbability(deckSize, defense, 5, 1);

        return {
            starters: { count: starters, prob: starterProb },
            bricks: { count: bricks, prob: brickProb },
            defense: { count: defense, prob: defenseProb }
        };
    }, [mainDeck]);

    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <StatCard 
                label="OPEN STARTER" 
                percent={stats.starters.prob} 
                count={stats.starters.count}
                total={stats.starters.prob > 0 || stats.starters.count > 0 ? mainDeck.length : 0} 
                colorClass={stats.starters.prob >= 80 ? 'text-green-500' : stats.starters.prob < 70 ? 'text-red-500' : 'text-yellow-500'}
            />
            <StatCard 
                label="OPEN BRICK" 
                percent={stats.bricks.prob} 
                count={stats.bricks.count}
                total={mainDeck.length}
                colorClass={stats.bricks.prob > 20 ? 'text-red-500' : 'text-gray-400'}
            />
            <StatCard 
                label="OPEN HAND TRAP" 
                percent={stats.defense.prob} 
                count={stats.defense.count}
                total={mainDeck.length}
                colorClass="text-blue-400"
            />
        </div>
    );
};

interface StatCardProps {
    label: string;
    percent: number;
    count: number;
    total: number;
    colorClass: string;
}

const StatCard = ({ label, percent, count, total, colorClass }: StatCardProps) => (
    <div className="bg-navy-800/50 border border-navy-700 rounded-lg p-4 flex flex-col items-center justify-center shadow-lg hover:border-cyan-500/30 transition-colors group">
        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1 group-hover:text-cyan-500 transition-colors">{label}</span>
        <div className={`font-heading text-4xl font-bold ${colorClass} tabular-nums tracking-tighter`}>
            {percent.toFixed(1)}<span className="text-sm align-top opacity-50">%</span>
        </div>
        <span className="text-[10px] text-gray-600 mt-2 font-mono bg-navy-900 px-2 py-0.5 rounded-full">
            {count} / {total} CARDS
        </span>
    </div>
);
