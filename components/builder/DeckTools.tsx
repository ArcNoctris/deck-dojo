'use client';

import React, { useState } from 'react';
import { useBuilderStore, SortMethod } from '@/store/builder-store';
import { Button } from '@/components/ui/Button';
import { ArrowDownAZ, ArrowDownWideNarrow, ListFilter, SlidersHorizontal } from 'lucide-react';

export const DeckTools = () => {
    const { sortDeck, sortMethod } = useBuilderStore();
    const [isOpen, setIsOpen] = useState(false);

    const handleSort = (method: SortMethod) => {
        sortDeck(method);
        setIsOpen(false);
    };

    return (
        <div className="absolute top-4 right-6 z-10 flex gap-2">
            <div className="relative">
                <Button 
                    variant="ghost" 
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 bg-navy-800/90 backdrop-blur border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500 text-xs font-mono shadow-lg transition-all"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    SORT DECK
                </Button>
                
                {isOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-navy-900/95 border border-cyan-500/30 rounded shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md py-1 flex flex-col z-20 animate-in fade-in zoom-in duration-200">
                        <div className="px-4 py-2 border-b border-navy-800 mb-1">
                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Sorting Protocol</span>
                        </div>
                        <button 
                            onClick={() => handleSort('monster-spell-trap')}
                            className={`px-4 py-3 text-left text-xs font-mono hover:bg-cyan-500/10 flex items-center gap-3 transition-colors ${sortMethod === 'monster-spell-trap' ? 'text-cyan-400 bg-cyan-500/5' : 'text-gray-400'}`}
                        >
                            <ArrowDownWideNarrow className="w-4 h-4" />
                            <div>
                                <span className="block font-bold">STANDARD</span>
                                <span className="text-[10px] opacity-60">Monster / Spell / Trap</span>
                            </div>
                        </button>
                        <button 
                            onClick={() => handleSort('alphabetical')}
                            className={`px-4 py-3 text-left text-xs font-mono hover:bg-cyan-500/10 flex items-center gap-3 transition-colors ${sortMethod === 'alphabetical' ? 'text-cyan-400 bg-cyan-500/5' : 'text-gray-400'}`}
                        >
                            <ArrowDownAZ className="w-4 h-4" />
                            <div>
                                <span className="block font-bold">ALPHABETICAL</span>
                                <span className="text-[10px] opacity-60">A - Z</span>
                            </div>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
