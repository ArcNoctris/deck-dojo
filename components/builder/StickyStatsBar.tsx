'use client';

import React from 'react';
import { useBuilderStore } from '@/store/builder-store';

export const StickyStatsBar = () => {
  const { mainDeck, extraDeck, sideDeck } = useBuilderStore();

  const mainCount = mainDeck.length;
  const extraCount = extraDeck.length;
  const sideCount = sideDeck.length;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-navy-950/90 backdrop-blur-md border-t border-navy-800 p-3 md:hidden flex justify-between items-center shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col items-center flex-1">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Main</span>
            <span className={`font-heading font-bold text-lg ${mainCount < 40 || mainCount > 60 ? 'text-strike-red' : 'text-cyan-500'}`}>
                {mainCount}<span className="text-gray-600 text-sm">/60</span>
            </span>
        </div>
        <div className="w-px h-8 bg-navy-800 mx-2" />
        <div className="flex flex-col items-center flex-1">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Extra</span>
            <span className={`font-heading font-bold text-lg ${extraCount > 15 ? 'text-strike-red' : 'text-gray-300'}`}>
                {extraCount}<span className="text-gray-600 text-sm">/15</span>
            </span>
        </div>
        <div className="w-px h-8 bg-navy-800 mx-2" />
        <div className="flex flex-col items-center flex-1">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Side</span>
            <span className={`font-heading font-bold text-lg ${sideCount > 15 ? 'text-strike-red' : 'text-gray-300'}`}>
                {sideCount}<span className="text-gray-600 text-sm">/15</span>
            </span>
        </div>
    </div>
  );
};