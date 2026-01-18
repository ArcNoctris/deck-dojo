'use client';

import React, { useState } from 'react';
import { useBuilderStore } from '@/store/builder-store';
import { X, Layers, Box, Archive, AlertTriangle } from 'lucide-react';

export const DeckGrid = () => {
  const { mainDeck, extraDeck, sideDeck, removeCard } = useBuilderStore();
  const [activeTab, setActiveTab] = useState<'main' | 'extra' | 'side'>('main');

  const currentDeck = activeTab === 'main' ? mainDeck : activeTab === 'extra' ? extraDeck : sideDeck;
  const maxCount = activeTab === 'main' ? 60 : 15;

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto">
      {/* Tabs */}
      <div className="flex items-end gap-1 px-4 border-b border-navy-800 overflow-x-auto scrollbar-hide pt-2">
        <TabButton 
            active={activeTab === 'main'} 
            onClick={() => setActiveTab('main')} 
            label="MAIN" 
            count={mainDeck.length} 
            max={60}
            icon={<Layers className="w-4 h-4" />}
        />
        <TabButton 
            active={activeTab === 'extra'} 
            onClick={() => setActiveTab('extra')} 
            label="EXTRA" 
            count={extraDeck.length} 
            max={15}
            icon={<Box className="w-4 h-4" />}
        />
        <TabButton 
            active={activeTab === 'side'} 
            onClick={() => setActiveTab('side')} 
            label="SIDE" 
            count={sideDeck.length} 
            max={15}
            icon={<Archive className="w-4 h-4" />}
        />
      </div>

      {/* Grid Area */}
      <div className="flex-1 p-4 overflow-y-auto pb-32 min-h-[500px]">
        {currentDeck.length === 0 ? (
          <EmptyState label={activeTab} />
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 animate-in fade-in duration-300">
            {currentDeck.map((card) => (
              <div key={card.instanceId} className="relative group aspect-[2/3] transform transition-transform hover:scale-105 hover:z-10">
                 {/* Remove Button - Visible on hover or touch */}
                 <button 
                    onClick={() => removeCard(card.instanceId, activeTab)}
                    className="absolute -top-2 -right-2 z-20 bg-red-500 text-white rounded-full p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(255,46,99,0.5)] hover:bg-red-600"
                    aria-label="Remove card"
                 >
                    <X className="w-3 h-3" />
                 </button>
                 
                 {/* Card Image */}
                 <div className="w-full h-full rounded-sm overflow-hidden border border-navy-800 shadow-md group-hover:border-cyan-500 group-hover:shadow-[0_0_15px_rgba(8,217,214,0.3)] transition-all">
                    {card.image_url_small ? (
                        <img src={card.image_url_small} alt={card.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                        <div className="w-full h-full bg-navy-800 flex items-center justify-center text-[10px] text-gray-500 font-mono text-center p-1">
                            {card.name}
                        </div>
                    )}
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, label, count, max, icon }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-heading font-bold tracking-wider text-sm transition-all border-t border-l border-r relative top-[1px] ${
      active 
        ? 'bg-navy-900 text-cyan-500 border-cyan-500/50 z-10 shadow-[0_-4px_10px_rgba(8,217,214,0.1)]' 
        : 'bg-navy-800/50 text-gray-500 border-navy-700 hover:bg-navy-800 hover:text-gray-300'
    }`}
  >
    {icon}
    {label} 
    <span className={`font-mono text-xs px-1.5 py-0.5 rounded-full ${
        count > max ? 'bg-red-500/20 text-red-500' : active ? 'bg-cyan-500/10 text-cyan-400' : 'bg-navy-900 text-gray-600'
    }`}>
      {count}/{max}
    </span>
  </button>
);

const EmptyState = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center h-64 mt-12 border-2 border-dashed border-navy-800 rounded-lg bg-navy-800/20 mx-4">
    <div className="w-20 h-20 rounded-full bg-navy-800/50 flex items-center justify-center mb-4 shadow-inner">
        <AlertTriangle className="w-10 h-10 text-navy-600" />
    </div>
    <h3 className="font-heading text-xl text-navy-600 uppercase tracking-widest">
        {label} SECTOR EMPTY
    </h3>
    <p className="font-mono text-xs text-navy-600 mt-2">Initialize cards via the Armory Database.</p>
  </div>
);
