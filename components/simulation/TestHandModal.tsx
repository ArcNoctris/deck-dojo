'use client';

import React, { useState, useMemo } from 'react';
import { Drawer } from 'vaul';
import { useBuilderStore } from '@/store/builder-store';
import { drawHand } from '@/utils/simulation/shuffler';
import { DeckCard } from '@/types/deck';
import { Button } from '@/components/ui/Button';
import { CyberCard } from '@/components/ui/CyberCard';
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
                <Drawer.Content className="bg-navy-900 flex flex-col rounded-t-[20px] h-[95vh] mt-24 fixed bottom-0 left-0 right-0 z-50 border-t-2 border-cyan-500 shadow-[0_-10px_40px_rgba(8,217,214,0.15)] outline-none">
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
                        </div>

                        {/* Hand Display */}
                        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-navy-950/50 rounded-lg border border-navy-800 relative overflow-hidden min-h-0">
                            {/* Playmat Grid Pattern */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(8,217,214,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(8,217,214,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

                            {mainDeck.length === 0 ? (
                                <div className="text-center text-gray-500 font-mono">
                                    DECK IS EMPTY
                                </div>
                            ) : (
                                <div className="flex flex-wrap justify-center gap-4 z-10 max-h-full overflow-y-auto w-full px-4">
                                    {hand.map((card, index) => (
                                        <div 
                                            key={`${card.instanceId}-${index}`} 
                                            className="w-48 animate-in zoom-in-50 fade-in slide-in-from-bottom-4 relative group hover:scale-105 transition-transform duration-200"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <CyberCard className="h-full">
                                                 <div className="relative aspect-[2/3] w-full rounded overflow-hidden">
                                                    <img src={card.image_url_small || ''} alt={card.name} className="w-full h-full object-cover" />
                                                    
                                                    {/* Tag indicator if exists */}
                                                    {card.userTag && (
                                                        <div className={`absolute top-0 right-0 w-4 h-4 rounded-bl-sm z-10 ${
                                                            card.userTag === 'starter' ? 'bg-green-500' :
                                                            card.userTag === 'brick' ? 'bg-red-500' :
                                                            card.userTag === 'extender' ? 'bg-yellow-500' :
                                                            'bg-gray-500'
                                                        }`} />
                                                    )}
                                                 </div>
                                                 <div className="mt-2 text-center">
                                                    <p className="font-heading text-xs text-cyan-500 truncate" title={card.name}>{card.name}</p>
                                                 </div>
                                            </CyberCard>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Stats Below Hand */}
                             <div className="mt-6 z-10 bg-navy-900/80 backdrop-blur border border-navy-700 rounded-full px-6 py-2 shadow-lg">
                                 <span className="font-mono text-sm text-gray-400">
                                    Hand Value: <span className="text-green-500 font-bold">{stats.starters} Starters</span>, <span className="text-red-500 font-bold">{stats.bricks} Bricks</span>
                                 </span>
                             </div>
                        </div>

                        {/* Controls */}
                        <div className="mt-8 flex justify-center gap-4 shrink-0">
                            <Button onClick={handleShuffle} variant="primary" className="h-14 px-10 text-xl gap-3 shadow-[0_0_20px_rgba(8,217,214,0.2)] tracking-wider">
                                <RefreshCw className="w-6 h-6" />
                                SHUFFLE & DRAW
                            </Button>
                            <Button onClick={handleDrawOne} variant="ghost" className="h-14 px-8 text-xl gap-2 border border-cyan-500/20 hover:bg-cyan-500/10 text-cyan-500" disabled={remainingDeck.length === 0}>
                                <Plus className="w-6 h-6" />
                                DRAW CARD
                            </Button>
                        </div>
                     </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};
