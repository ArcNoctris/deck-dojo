'use client';

import React, { useState, useMemo } from 'react';
import { Drawer } from 'vaul';
import { useBuilderStore } from '@/store/builder-store';
import { drawHand } from '@/utils/simulation/shuffler';
import { DeckCard } from '@/types/deck';
import { Button } from '@/components/ui/Button';
import { FlaskConical, RefreshCw, Plus } from 'lucide-react';

export const TestHandModal = () => {
    const { mainDeck } = useBuilderStore();
    const [hand, setHand] = useState<DeckCard[]>([]);
    const [remainingDeck, setRemainingDeck] = useState<DeckCard[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Stats
    const stats = useMemo(() => {
        let starters = 0;
        let bricks = 0;
        hand.forEach(card => {
            if (card.userTag === 'starter') starters++;
            if (card.userTag === 'brick') bricks++;
        });
        return { starters, bricks };
    }, [hand]);

    const handleShuffle = () => {
        if (mainDeck.length === 0) return;
        const result = drawHand(mainDeck, 5);
        setHand(result.hand);
        setRemainingDeck(result.remainingDeck);
    };

    const handleDrawOne = () => {
        if (remainingDeck.length === 0) return;
        const nextCard = remainingDeck[0];
        setHand(prev => [...prev, nextCard]);
        setRemainingDeck(prev => prev.slice(1));
    };

    return (
        <Drawer.Root 
            open={isOpen} 
            onOpenChange={(open) => {
                setIsOpen(open);
                if (open) {
                    // Slight delay to allow animation to start smoothly or just ensuring logic runs
                    setTimeout(handleShuffle, 0);
                }
            }}
        >
            <Drawer.Trigger asChild>
                 <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-gray-500 hover:text-cyan-400"
                    title="Test Hand Simulation"
                >
                    <FlaskConical className="w-4 h-4" />
                </Button>
            </Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
                <Drawer.Content className="bg-navy-900 flex flex-col rounded-t-[20px] h-[90vh] mt-24 fixed bottom-0 left-0 right-0 z-50 border-t-2 border-cyan-500 shadow-[0_-10px_40px_rgba(8,217,214,0.15)] outline-none">
                     <div className="mx-auto w-16 h-1.5 flex-shrink-0 rounded-full bg-navy-800 mt-4 mb-2" />
                     
                     <div className="flex-1 p-6 flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-8 shrink-0">
                             <div>
                                <h2 className="font-heading text-2xl text-cyan-500 tracking-widest uppercase flex items-center gap-2 glow-text-sm">
                                    <FlaskConical className="w-6 h-6" /> BATTLE SIMULATION
                                </h2>
                                <p className="font-mono text-xs text-gray-500 mt-1">
                                    Opening Hand Simulator
                                </p>
                             </div>
                             
                             <div className="flex gap-4">
                                 <div className="bg-navy-800 border border-navy-700 rounded px-4 py-2 flex items-center gap-4">
                                     <div className="flex flex-col">
                                         <span className="text-[10px] font-mono text-gray-500 uppercase">Starters</span>
                                         <span className={`font-heading text-xl ${stats.starters > 0 ? 'text-green-500' : 'text-gray-600'}`}>
                                            {stats.starters}
                                         </span>
                                     </div>
                                      <div className="w-px h-8 bg-navy-700"></div>
                                      <div className="flex flex-col">
                                         <span className="text-[10px] font-mono text-gray-500 uppercase">Bricks</span>
                                         <span className={`font-heading text-xl ${stats.bricks > 0 ? 'text-red-500' : 'text-gray-600'}`}>
                                            {stats.bricks}
                                         </span>
                                     </div>
                                 </div>
                             </div>
                        </div>

                        {/* Hand Display */}
                        <div className="flex-1 flex items-center justify-center p-8 bg-navy-950/50 rounded-lg border border-navy-800 relative overflow-hidden min-h-0">
                            {/* Playmat Grid Pattern */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(8,217,214,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(8,217,214,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

                            {mainDeck.length === 0 ? (
                                <div className="text-center text-gray-500 font-mono">
                                    DECK IS EMPTY
                                </div>
                            ) : (
                                <div className="flex flex-wrap justify-center gap-4 z-10 max-h-full overflow-y-auto w-full">
                                    {hand.map((card, index) => (
                                        <div 
                                            key={`${card.instanceId}-${index}`} 
                                            className="w-32 aspect-[2/3] rounded bg-navy-800 border border-navy-700 shadow-xl hover:scale-110 transition-transform duration-200 cursor-pointer animate-in zoom-in-50 fade-in slide-in-from-bottom-4 relative group"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <img src={card.image_url_small || ''} alt={card.name} className="w-full h-full object-cover rounded" />
                                            {/* Tag indicator if exists */}
                                            {card.userTag && (
                                                <div className={`absolute top-0 right-0 w-3 h-3 rounded-bl-sm z-10 ${
                                                    card.userTag === 'starter' ? 'bg-green-500' :
                                                    card.userTag === 'brick' ? 'bg-red-500' :
                                                    card.userTag === 'extender' ? 'bg-yellow-500' :
                                                    'bg-gray-500'
                                                }`} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="mt-8 flex justify-center gap-4 shrink-0">
                            <Button onClick={handleShuffle} variant="primary" className="h-12 px-8 text-lg gap-2 shadow-[0_0_20px_rgba(8,217,214,0.2)]">
                                <RefreshCw className="w-5 h-5" />
                                SHUFFLE & DRAW
                            </Button>
                            <Button onClick={handleDrawOne} variant="ghost" className="h-12 px-8 text-lg gap-2 border border-cyan-500/20 hover:bg-cyan-500/10 text-cyan-500" disabled={remainingDeck.length === 0}>
                                <Plus className="w-5 h-5" />
                                DRAW CARD
                            </Button>
                        </div>
                     </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};
