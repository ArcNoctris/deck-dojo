'use client';

import React, { useState } from 'react';
import { useBuilderStore } from '@/store/builder-store';
import { X, Layers, Box, Archive, AlertTriangle } from 'lucide-react';
import { CardContextMenu } from '../CardContextMenu';
import { UserTag } from '@/types/deck';

const TAG_COLORS: Record<string, string> = {
    starter: 'bg-green-500',
    extender: 'bg-yellow-500',
    brick: 'bg-red-500',
    engine: 'bg-purple-500',
    flex: 'bg-blue-500',
    defense: 'bg-gray-500'
};

export const StandardGrid = () => {
  const { mainDeck, extraDeck, sideDeck, removeCard, moveCard, density } = useBuilderStore();
  const [activeTab, setActiveTab] = useState<'main' | 'extra' | 'side'>('main');

  const currentDeck = activeTab === 'main' ? mainDeck : activeTab === 'extra' ? extraDeck : sideDeck;
  const maxCount = activeTab === 'main' ? 60 : 15;

  // Density Logic
  const gridClass = density === 'high' 
      ? 'grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-1' 
      : 'grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2';

  const handleDoubleClick = (instanceId: string, location: 'main' | 'extra' | 'side', type: string | null) => {
    if (location === 'main') moveCard(instanceId, 'main', 'side');
    else if (location === 'extra') moveCard(instanceId, 'extra', 'side');
    else if (location === 'side') {
        const isExtra = type && (type.includes('Fusion') || type.includes('Synchro') || type.includes('XYZ') || type.includes('Link'));
        if (isExtra) moveCard(instanceId, 'side', 'extra');
        else moveCard(instanceId, 'side', 'main');
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Tabs */}
      <div className="flex items-end gap-1 px-4 border-b border-navy-800 overflow-x-auto scrollbar-hide pt-2 shrink-0">
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
      <div className="flex-1 p-4 overflow-y-auto pb-32">
        {currentDeck.length === 0 ? (
          <EmptyState label={activeTab} />
        ) : (
          <div className={`grid ${gridClass} animate-in fade-in duration-300`}>
            {currentDeck.map((card) => (
              <CardContextMenu key={card.instanceId} instanceId={card.instanceId} location={activeTab} cardType={card.type}>
                  <div 
                    className="relative group aspect-[2/3] transform transition-transform hover:scale-105 hover:z-10"
                    onDoubleClick={() => handleDoubleClick(card.instanceId, activeTab, card.type)}
                  >
                     {/* Tag Ribbon */}
                     {card.userTag && TAG_COLORS[card.userTag] && (
                        <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden rounded-tr-sm z-20">
                            <div className={`absolute top-0 right-0 w-12 h-4 ${TAG_COLORS[card.userTag]} opacity-90 rotate-45 translate-x-[14px] translate-y-[6px] shadow-sm`} />
                        </div>
                     )}

                     <button 
                        onClick={(e) => { e.stopPropagation(); removeCard(card.instanceId, activeTab); }}
                        className="absolute -top-1 -right-1 z-30 bg-red-500 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                        aria-label="Remove card"
                     >
                        <X className="w-2 h-2" />
                     </button>
                     
                     <div className="w-full h-full rounded-sm overflow-hidden border border-navy-800 shadow-sm group-hover:border-cyan-500 group-hover:shadow-[0_0_10px_rgba(8,217,214,0.3)] transition-all bg-navy-800">
                        {card.image_url_small ? (
                            <img src={card.image_url_small} alt={card.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                            <div className="w-full h-full bg-navy-800 flex items-center justify-center text-[8px] text-gray-500 font-mono text-center p-1 leading-tight">
                                {card.name}
                            </div>
                        )}
                     </div>
                  </div>
              </CardContextMenu>
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
    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-heading font-bold tracking-wider text-sm transition-all border-t border-l border-r relative top-[1px] ${
      active 
        ? 'bg-navy-900 text-cyan-500 border-cyan-500/50 z-10' 
        : 'bg-navy-800/50 text-gray-500 border-navy-700 hover:bg-navy-800 hover:text-gray-300'
    }`}
  >
    {icon}
    {label} 
    <span className={`font-mono text-[10px] px-1.5 rounded-full ${
        count > max ? 'bg-red-500/20 text-red-500' : active ? 'bg-cyan-500/10 text-cyan-400' : 'bg-navy-900 text-gray-600'
    }`}>
      {count}/{max}
    </span>
  </button>
);

const EmptyState = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center h-48 mt-12 border-2 border-dashed border-navy-800 rounded-lg bg-navy-800/20 mx-4">
    <div className="w-16 h-16 rounded-full bg-navy-800/50 flex items-center justify-center mb-4 shadow-inner">
        <AlertTriangle className="w-8 h-8 text-navy-600" />
    </div>
    <h3 className="font-heading text-lg text-navy-600 uppercase tracking-widest">
        {label} EMPTY
    </h3>
  </div>
);
