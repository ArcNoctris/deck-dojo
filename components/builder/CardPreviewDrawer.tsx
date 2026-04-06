'use client';

import React from 'react';
import { Drawer } from 'vaul';
import { useBuilderStore } from '@/store/builder-store';

export const CardPreviewDrawer = () => {
  const { activePreviewCard, setActivePreviewCard } = useBuilderStore();

  const isOpen = activePreviewCard !== null;
  const card = activePreviewCard;

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && setActivePreviewCard(null)}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
        <Drawer.Content className="bg-navy-900 flex flex-col rounded-t-[20px] fixed bottom-0 left-0 right-0 z-[101] border-t border-cyan-500/30 outline-none max-h-[85vh]">
          <div className="mx-auto w-16 h-1.5 flex-shrink-0 rounded-full bg-navy-800 mt-4 mb-2" />
          
          {card && (
            <div className="flex flex-col md:flex-row gap-6 p-6 overflow-y-auto">
              <div className="shrink-0 mx-auto md:mx-0 w-48 md:w-64">
                <img 
                    src={card.image_url || card.image_url_small || ''} 
                    alt={card.name} 
                    className="w-full h-auto rounded-lg shadow-[0_0_20px_rgba(8,217,214,0.2)]" 
                />
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-white mb-1 glow-text-sm">{card.name}</h2>
                  <div className="text-xs font-mono text-cyan-500 tracking-wider">
                    {card.type} {card.attribute ? `| ${card.attribute}` : ''} {card.level ? `| Level/Rank ${card.level}` : ''}
                  </div>
                </div>
                
                {(card.atk !== null || card.def !== null) && (
                  <div className="flex gap-4 font-mono text-sm border-y border-navy-800 py-2">
                    {card.atk !== null && <div><span className="text-gray-500">ATK/</span> <span className="text-red-400 font-bold">{card.atk}</span></div>}
                    {card.def !== null && <div><span className="text-gray-500">DEF/</span> <span className="text-blue-400 font-bold">{card.def}</span></div>}
                  </div>
                )}
                
                <div className="bg-navy-950 p-4 rounded-lg border border-navy-800">
                  <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap text-gray-300">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};