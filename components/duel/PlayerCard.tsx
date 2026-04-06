'use client';

import React from 'react';
import { useDuelStore } from '@/store/duel-store';

interface PlayerCardProps {
    player: 1 | 2;
    inverted?: boolean;
}

export const PlayerCard = ({ player, inverted = false }: PlayerCardProps) => {
    const { lp1, lp2, openCalculator } = useDuelStore();
    const lp = player === 1 ? lp1 : lp2;

    const isCritical = lp <= 2000;
    const isWarning = lp <= 4000 && !isCritical;

    // Colors
    const textGlow = isCritical 
        ? 'text-red-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]' 
        : isWarning 
            ? 'text-yellow-500 drop-shadow-[0_0_10px_rgba(255,200,0,0.6)]' 
            : 'text-cyan-500 drop-shadow-[0_0_15px_rgba(8,217,214,0.6)]';

    return (
        <button 
            onClick={() => openCalculator(player)}
            className={`
                relative flex-1 w-full flex flex-col items-center justify-center 
                bg-navy-900 border-2 transition-all duration-200 active:scale-95 overflow-hidden
                ${isCritical ? 'border-red-500/50 bg-red-950/20' : isWarning ? 'border-yellow-500/30' : 'border-cyan-500/20 hover:border-cyan-500'}
                ${inverted ? 'rotate-180' : ''}
            `}
        >
            {/* Decorative Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

            <div className="z-10 text-center">
                <span className="font-mono text-gray-500 text-sm tracking-[0.3em] uppercase mb-2 block">
                    PLAYER {player}
                </span>
                
                {/* Big Number */}
                <div className={`font-heading font-bold text-[5rem] md:text-[8rem] leading-none tracking-wider ${textGlow} transition-colors duration-500`}>
                    {lp.toString().padStart(4, '0')}
                </div>
            </div>

            {/* Corner Accents */}
            <div className={`absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 ${isCritical ? 'border-red-500' : 'border-cyan-500/50'}`} />
            <div className={`absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 ${isCritical ? 'border-red-500' : 'border-cyan-500/50'}`} />
        </button>
    );
};