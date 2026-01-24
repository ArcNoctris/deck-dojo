'use client';

import React, { useMemo, useState } from 'react';
import { useBuilderStore } from '@/store/builder-store';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { Card } from '@/types/database.types';
import { ChevronDown, ChevronUp, Filter, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const ATTRIBUTES = [
    { name: 'DARK', color: 'bg-purple-600', border: 'border-purple-400' },
    { name: 'LIGHT', color: 'bg-yellow-500', border: 'border-yellow-300' },
    { name: 'EARTH', color: 'bg-amber-700', border: 'border-amber-500' },
    { name: 'WATER', color: 'bg-blue-500', border: 'border-blue-400' },
    { name: 'FIRE', color: 'bg-red-500', border: 'border-red-400' },
    { name: 'WIND', color: 'bg-green-500', border: 'border-green-400' },
    { name: 'DIVINE', color: 'bg-yellow-600', border: 'border-yellow-400' },
];

export const FilterPanel = () => {
  const { activeFilters, setFilters, mainDeck, extraDeck, sideDeck } = useBuilderStore();
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  // Fetch unique data for dropdowns
  const { data: allCards = [] } = useQuery({
    queryKey: ['allCards'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cards').select('*');
      if (error) throw error;
      return data as Card[];
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  const { races, archetypes } = useMemo(() => {
      const racesSet = new Set<string>();
      const archSet = new Set<string>();
      
      allCards.forEach(c => {
          if (c.race) racesSet.add(c.race);
          if (c.archetype) archSet.add(c.archetype);
      });

      return {
          races: Array.from(racesSet).sort(),
          archetypes: Array.from(archSet).sort()
      };
  }, [allCards]);

  // Archetype logic: In-Deck vs Others
  const sortedArchetypes = useMemo(() => {
      const deckArchetypes = new Set<string>();
      [...mainDeck, ...extraDeck, ...sideDeck].forEach(c => {
          if (c.archetype) deckArchetypes.add(c.archetype);
      });

      const inDeck = archetypes.filter(a => deckArchetypes.has(a));
      const others = archetypes.filter(a => !deckArchetypes.has(a));
      
      return { inDeck, others };
  }, [archetypes, mainDeck, extraDeck, sideDeck]);

  const toggleAttribute = (attr: string) => {
      const current = activeFilters.attributes;
      if (current.includes(attr)) {
          setFilters({ attributes: current.filter(a => a !== attr) });
      } else {
          setFilters({ attributes: [...current, attr] });
      }
  };

  const clearFilters = () => {
      setFilters({
          attributes: [],
          race: null,
          archetype: null,
          level: [1, 12],
          cardType: null
      });
  };

  const activeCount = activeFilters.attributes.length + (activeFilters.race ? 1 : 0) + (activeFilters.archetype ? 1 : 0) + (activeFilters.cardType ? 1 : 0);

  return (
    <div className="w-full border-b border-navy-800">
        <div className="flex items-center justify-between px-4 py-2">
            <Button 
                variant="ghost" 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 text-xs font-mono uppercase ${isOpen ? 'text-cyan-400' : 'text-gray-400'}`}
            >
                <Filter className="w-4 h-4" />
                FILTERS {activeCount > 0 && <span className="bg-cyan-500 text-black px-1.5 rounded-full text-[10px] font-bold">{activeCount}</span>}
                {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
            {activeCount > 0 && (
                <Button variant="ghost" onClick={clearFilters} className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1">
                    <X className="w-3 h-3" /> CLEAR
                </Button>
            )}
        </div>

        {isOpen && (
            <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-4">
                    {/* Attributes */}
                    <div>
                        <label className="text-[10px] font-mono text-gray-500 uppercase mb-2 block">Attributes</label>
                        <div className="flex flex-wrap gap-2">
                            {ATTRIBUTES.map(attr => {
                                const isSelected = activeFilters.attributes.includes(attr.name);
                                return (
                                    <button
                                        key={attr.name}
                                        onClick={() => toggleAttribute(attr.name)}
                                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                                            isSelected ? `${attr.color} ${attr.border} scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]` : 'bg-navy-800 border-navy-700 opacity-60 hover:opacity-100'
                                        }`}
                                        title={attr.name}
                                    >
                                        {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Card Type & Race */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-mono text-gray-500 uppercase mb-2 block">Card Type</label>
                            <select 
                                value={activeFilters.cardType || ''} 
                                onChange={(e) => setFilters({ cardType: e.target.value as any || null })}
                                className="w-full bg-navy-900 border border-navy-700 rounded text-sm text-white p-2 focus:border-cyan-500 focus:outline-none"
                            >
                                <option value="">Any</option>
                                <option value="monster">Monster</option>
                                <option value="spell">Spell</option>
                                <option value="trap">Trap</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-mono text-gray-500 uppercase mb-2 block">Type / Property</label>
                            <select 
                                value={activeFilters.race || ''} 
                                onChange={(e) => setFilters({ race: e.target.value || null })}
                                className="w-full bg-navy-900 border border-navy-700 rounded text-sm text-white p-2 focus:border-cyan-500 focus:outline-none"
                            >
                                <option value="">Any</option>
                                {races.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Archetype */}
                    <div>
                        <label className="text-[10px] font-mono text-gray-500 uppercase mb-2 block">Archetype</label>
                        <select 
                            value={activeFilters.archetype || ''} 
                            onChange={(e) => setFilters({ archetype: e.target.value || null })}
                            className="w-full bg-navy-900 border border-navy-700 rounded text-sm text-white p-2 focus:border-cyan-500 focus:outline-none"
                        >
                            <option value="">Any Archetype</option>
                            {sortedArchetypes.inDeck.length > 0 && (
                                <optgroup label="In Your Deck" className="text-cyan-400">
                                    {sortedArchetypes.inDeck.map(a => (
                                        <option key={a} value={a} className="text-white">{a}</option>
                                    ))}
                                </optgroup>
                            )}
                            <optgroup label="All Archetypes">
                                {sortedArchetypes.others.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </optgroup>
                        </select>
                    </div>

                    {/* Level Range (Simplified as inputs for now) */}
                    <div>
                         <label className="text-[10px] font-mono text-gray-500 uppercase mb-2 block">Level / Rank / Link</label>
                         <div className="flex items-center gap-2">
                             <input 
                                type="number" 
                                min="0" max="13" 
                                value={activeFilters.level[0]}
                                onChange={(e) => setFilters({ level: [parseInt(e.target.value) || 0, activeFilters.level[1]] })}
                                className="w-full bg-navy-900 border border-navy-700 rounded p-2 text-center text-white"
                             />
                             <span className="text-gray-500">-</span>
                             <input 
                                type="number" 
                                min="0" max="13" 
                                value={activeFilters.level[1]}
                                onChange={(e) => setFilters({ level: [activeFilters.level[0], parseInt(e.target.value) || 13] })}
                                className="w-full bg-navy-900 border border-navy-700 rounded p-2 text-center text-white"
                             />
                         </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
