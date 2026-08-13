'use client';

import React, { useMemo, useState } from 'react';
import { useBuilderStore, ActiveFilters } from '@/store/builder-store';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { Card } from '@/types/database.types';
import { Filter, X } from 'lucide-react';
import { MultiSelectDropdown } from './MultiSelectDropdown';

const ATTRIBUTES = ['DARK', 'LIGHT', 'EARTH', 'WATER', 'FIRE', 'WIND', 'DIVINE'];
const CARD_TYPES = ['Monster', 'Spell', 'Trap'];
const EXTRA_KINDS = ['Fusion', 'Synchro', 'XYZ', 'Link'];

type MultiKey = 'cardTypes' | 'attributes' | 'races' | 'levels' | 'archetypes' | 'extraKinds' | 'spellSubtypes' | 'trapSubtypes';

export const FilterPanel = () => {
  const { activeFilters, setFilters, mainDeck, extraDeck, sideDeck } = useBuilderStore();
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  const { data: allCards = [] } = useQuery({
    queryKey: ['allCards'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cards').select('*');
      if (error) throw error;
      return data as Card[];
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  const { monsterRaces, spellSubtypeOptions, trapSubtypeOptions, archetypeOptions, levelOptions } = useMemo(() => {
    const monsterRacesSet = new Set<string>();
    const spellSet = new Set<string>();
    const trapSet = new Set<string>();
    const archSet = new Set<string>();
    const levelSet = new Set<number>();

    allCards.forEach((c) => {
      if (c.type?.includes('Monster')) {
        if (c.race) monsterRacesSet.add(c.race);
        if (c.level) levelSet.add(c.level);
      } else if (c.type?.includes('Spell')) {
        if (c.race) spellSet.add(c.race);
      } else if (c.type?.includes('Trap')) {
        if (c.race) trapSet.add(c.race);
      }
      if (c.archetype) archSet.add(c.archetype);
    });

    return {
      monsterRaces: Array.from(monsterRacesSet).sort(),
      spellSubtypeOptions: Array.from(spellSet).sort(),
      trapSubtypeOptions: Array.from(trapSet).sort(),
      archetypeOptions: Array.from(archSet).sort(),
      levelOptions: Array.from(levelSet).sort((a, b) => a - b),
    };
  }, [allCards]);

  const sortedArchetypes = useMemo(() => {
    const deckArchetypes = new Set<string>();
    [...mainDeck, ...extraDeck, ...sideDeck].forEach((c) => {
      if (c.archetype) deckArchetypes.add(c.archetype);
    });
    return {
      inDeck: archetypeOptions.filter((a) => deckArchetypes.has(a)),
      others: archetypeOptions.filter((a) => !deckArchetypes.has(a)),
    };
  }, [archetypeOptions, mainDeck, extraDeck, sideDeck]);

  const toggle = (key: MultiKey, value: string | number) => {
    const current = activeFilters[key] as (string | number)[];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setFilters({ [key]: next } as Partial<ActiveFilters>);
  };

  const clearAll = () => setFilters({
    cardTypes: [], attributes: [], races: [], levels: [], archetypes: [], extraKinds: [], spellSubtypes: [], trapSubtypes: [],
  });

  const activeCount = activeFilters.cardTypes.length + activeFilters.attributes.length + activeFilters.races.length
    + activeFilters.levels.length + activeFilters.archetypes.length + activeFilters.extraKinds.length
    + activeFilters.spellSubtypes.length + activeFilters.trapSubtypes.length;

  const showMonster = activeFilters.cardTypes.length === 0 || activeFilters.cardTypes.includes('Monster');
  const showSpell = (activeFilters.cardTypes.length === 0 || activeFilters.cardTypes.includes('Spell')) && spellSubtypeOptions.length > 0;
  const showTrap = (activeFilters.cardTypes.length === 0 || activeFilters.cardTypes.includes('Trap')) && trapSubtypeOptions.length > 0;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex-none w-9 h-9 bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg grid place-items-center"
      >
        <Filter className="w-3.5 h-3.5 text-[var(--color-arcade-text-muted)]" />
        {activeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-[var(--color-arcade-cyan)] rounded-full grid place-items-center font-mono font-bold text-[9px] text-[var(--color-arcade-bg)]">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-[var(--color-arcade-bg)] z-40 flex flex-col">
          <div className="flex-none px-4 pt-4 flex items-center justify-between">
            <span className="font-mono font-bold text-xs tracking-widest text-[var(--color-arcade-text-muted)]">FILTERS · {activeCount}</span>
            <button onClick={() => setIsOpen(false)} className="w-7 h-7 bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg grid place-items-center">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto thin-scroll px-4 py-3.5 flex flex-col gap-4">
            <ChipSection label="CARD TYPE" options={CARD_TYPES} selected={activeFilters.cardTypes} onToggle={(v) => toggle('cardTypes', v)} />

            {showMonster && (
              <>
                <ChipSection label="ATTRIBUTE" options={ATTRIBUTES} selected={activeFilters.attributes} onToggle={(v) => toggle('attributes', v)} />
                {levelOptions.length > 0 && (
                  <ChipSection label="LEVEL / RANK / LINK" options={levelOptions} selected={activeFilters.levels} onToggle={(v) => toggle('levels', v)} square />
                )}
                {monsterRaces.length > 0 && (
                  <MultiSelectDropdown
                    label="TYPE (RACE)"
                    options={monsterRaces}
                    selected={activeFilters.races as string[]}
                    onChange={(next) => setFilters({ races: next })}
                  />
                )}
                <ChipSection label="EXTRA DECK" options={EXTRA_KINDS} selected={activeFilters.extraKinds} onToggle={(v) => toggle('extraKinds', v)} />
              </>
            )}

            {showSpell && (
              <ChipSection label="SPELL TYPE" options={spellSubtypeOptions} selected={activeFilters.spellSubtypes} onToggle={(v) => toggle('spellSubtypes', v)} />
            )}
            {showTrap && (
              <ChipSection label="TRAP TYPE" options={trapSubtypeOptions} selected={activeFilters.trapSubtypes} onToggle={(v) => toggle('trapSubtypes', v)} />
            )}

            {(sortedArchetypes.inDeck.length > 0 || sortedArchetypes.others.length > 0) && (
              <MultiSelectDropdown
                label="ARCHETYPE"
                options={[...sortedArchetypes.inDeck, ...sortedArchetypes.others]}
                selected={activeFilters.archetypes}
                onChange={(next) => setFilters({ archetypes: next })}
              />
            )}
          </div>

          <div className="flex-none px-4 py-3.5 flex gap-2">
            <button onClick={clearAll} className="flex-1 h-[42px] border border-[var(--color-arcade-border)] rounded-lg font-heading font-bold text-xs tracking-wide text-[var(--color-arcade-text-muted)]">
              CLEAR
            </button>
            <button onClick={() => setIsOpen(false)} className="flex-[2] h-[42px] bg-[var(--color-arcade-cyan)] rounded-lg font-heading font-bold text-xs tracking-wide text-[var(--color-arcade-bg)]">
              APPLY
            </button>
          </div>
        </div>
      )}
    </>
  );
};

interface ChipSectionProps {
  label: string;
  options: (string | number)[];
  selected: (string | number)[];
  onToggle: (value: string | number) => void;
  square?: boolean;
}

const ChipSection = ({ label, options, selected, onToggle, square }: ChipSectionProps) => (
  <div>
    <span className="font-mono font-bold text-[9.5px] tracking-widest text-[var(--color-arcade-cyan)]">{label}</span>
    <div className="flex flex-wrap gap-1.5 mt-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={`rounded-lg border font-heading font-semibold ${square ? 'w-8 h-8 grid place-items-center text-[11.5px]' : 'px-3 py-1.5 text-[11.5px]'}`}
            style={{
              borderColor: active ? 'var(--color-arcade-cyan)' : 'var(--color-arcade-border)',
              background: active ? 'rgba(25,211,206,.16)' : 'var(--color-arcade-surface)',
              color: active ? 'var(--color-arcade-cyan)' : 'var(--color-arcade-text)',
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  </div>
);
