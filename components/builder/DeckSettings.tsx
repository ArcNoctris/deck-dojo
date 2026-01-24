'use client';

import React, { useState } from 'react';
import { useBuilderStore, SortMethod, ViewMode, Density } from '@/store/builder-store';
import { Button } from '@/components/ui/Button';
import { 
    Eye, 
    LayoutGrid, 
    List, 
    Grid3X3, 
    Layers, 
    ArrowDownAZ, 
    ArrowDownWideNarrow, 
    Maximize2, 
    Minimize2,
    Check
} from 'lucide-react';

export const DeckSettings = () => {
    const { 
        viewMode, setViewMode, 
        sortMethod, sortDeck, 
        isStacked, toggleStacked,
        density, setDensity
    } = useBuilderStore();
    
    const [isOpen, setIsOpen] = useState(false);

    const handleSort = (method: SortMethod) => {
        sortDeck(method);
    };

    return (
        <div className="relative">
            <Button 
                variant="ghost" 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 h-10 px-4 rounded-md border text-xs font-mono transition-all ${isOpen ? 'bg-navy-800 border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-cyan-400 hover:bg-navy-800'}`}
            >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">VIEW</span>
            </Button>
            
            {isOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-navy-900/95 border border-cyan-500/30 rounded shadow-[0_0_30px_rgba(0,0,0,0.6)] backdrop-blur-md flex flex-col z-20 animate-in fade-in zoom-in duration-200 p-2 gap-4">
                        
                        {/* View Mode */}
                        <div>
                            <div className="px-2 py-1 mb-2">
                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Layout</span>
                            </div>
                            <div className="flex bg-navy-950 p-1 rounded border border-navy-800">
                                <button 
                                    onClick={() => setViewMode('standard')}
                                    className={`flex-1 flex items-center justify-center py-2 rounded text-xs transition-colors ${viewMode === 'standard' ? 'bg-navy-800 text-cyan-400 shadow-sm' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => setViewMode('list')}
                                    className={`flex-1 flex items-center justify-center py-2 rounded text-xs transition-colors ${viewMode === 'list' ? 'bg-navy-800 text-cyan-400 shadow-sm' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => setViewMode('compact')}
                                    className={`flex-1 flex items-center justify-center py-2 rounded text-xs transition-colors ${viewMode === 'compact' ? 'bg-navy-800 text-cyan-400 shadow-sm' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Compact Options */}
                        {viewMode === 'compact' && (
                            <div className="bg-navy-950/50 p-2 rounded border border-navy-800/50">
                                <button 
                                    onClick={toggleStacked}
                                    className="w-full flex items-center justify-between text-xs font-mono text-gray-300 hover:text-white"
                                >
                                    <span className="flex items-center gap-2"><Layers className="w-3 h-3" /> Stack Duplicates</span>
                                    <div className={`w-8 h-4 rounded-full relative transition-colors ${isStacked ? 'bg-cyan-500' : 'bg-navy-700'}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${isStacked ? 'left-4.5' : 'left-0.5'}`} style={{ left: isStacked ? '18px' : '2px' }} />
                                    </div>
                                </button>
                            </div>
                        )}

                        {/* Density */}
                        {viewMode === 'standard' && (
                             <div>
                                <div className="px-2 py-1 mb-1">
                                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Density</span>
                                </div>
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => setDensity('standard')}
                                        className={`flex-1 px-3 py-2 text-xs font-mono border rounded flex items-center justify-center gap-2 ${density === 'standard' ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10' : 'border-navy-700 text-gray-500 hover:border-gray-600'}`}
                                    >
                                        <Maximize2 className="w-3 h-3" /> Standard
                                    </button>
                                    <button 
                                        onClick={() => setDensity('high')}
                                        className={`flex-1 px-3 py-2 text-xs font-mono border rounded flex items-center justify-center gap-2 ${density === 'high' ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10' : 'border-navy-700 text-gray-500 hover:border-gray-600'}`}
                                    >
                                        <Minimize2 className="w-3 h-3" /> High
                                    </button>
                                </div>
                             </div>
                        )}

                        {/* Sorting */}
                        <div>
                            <div className="px-2 py-1 mb-1 border-t border-navy-800 pt-2">
                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Sorting</span>
                            </div>
                            <div className="space-y-1">
                                <button 
                                    onClick={() => handleSort('monster-spell-trap')}
                                    className={`w-full px-3 py-2 text-left text-xs font-mono rounded flex items-center justify-between ${sortMethod === 'monster-spell-trap' ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-400 hover:bg-navy-800'}`}
                                >
                                    <span className="flex items-center gap-2"><ArrowDownWideNarrow className="w-3 h-3" /> Standard (Type)</span>
                                    {sortMethod === 'monster-spell-trap' && <Check className="w-3 h-3" />}
                                </button>
                                <button 
                                    onClick={() => handleSort('alphabetical')}
                                    className={`w-full px-3 py-2 text-left text-xs font-mono rounded flex items-center justify-between ${sortMethod === 'alphabetical' ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-400 hover:bg-navy-800'}`}
                                >
                                    <span className="flex items-center gap-2"><ArrowDownAZ className="w-3 h-3" /> Alphabetical</span>
                                    {sortMethod === 'alphabetical' && <Check className="w-3 h-3" />}
                                </button>
                            </div>
                        </div>

                    </div>
                )}
        </div>
    );
};
