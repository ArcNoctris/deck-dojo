'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Filter, X, Plus } from 'lucide-react';
import { DeckRow } from './DeckRow';

export interface DeckListItem {
  id: string;
  name: string;
  format: string | null;
  color: string;
  coverUrl: string | null;
  isFavorite: boolean;
  mainCount: number;
  extraCount: number;
  sideCount: number;
  versionsCount: number;
  archetype: string | null;
  winRate: number | null;
  daysAgo: number;
  warning: string | null;
}

type SortMode = 'recent' | 'winrate' | 'name';

interface DecksListClientProps {
  decks: DeckListItem[];
  createDeckAction: () => Promise<void>;
}

export const DecksListClient = ({ decks, createDeckAction }: DecksListClientProps) => {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('recent');
  const [archetypeFilters, setArchetypeFilters] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const allArchetypes = useMemo(
    () => Array.from(new Set(decks.map(d => d.archetype).filter((a): a is string => !!a))),
    [decks]
  );

  const visibleDecks = useMemo(() => {
    let list = decks;
    if (search) list = list.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
    if (archetypeFilters.length) list = list.filter(d => d.archetype && archetypeFilters.includes(d.archetype));
    list = [...list].sort((a, b) => {
      if (sort === 'winrate') return (b.winRate ?? -1) - (a.winRate ?? -1);
      if (sort === 'name') return a.name.localeCompare(b.name);
      return a.daysAgo - b.daysAgo;
    });
    return list;
  }, [decks, search, sort, archetypeFilters]);

  const toggleArchetype = (a: string) => {
    setArchetypeFilters(prev => (prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]));
  };

  return (
    <div className="min-h-screen bg-[var(--color-arcade-surface)] text-[var(--color-arcade-text)] flex flex-col">
      <div className="flex-none px-4 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-7 h-7 bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg grid place-items-center font-heading font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
          <span className="font-heading font-bold text-base tracking-wide">DECKS</span>
        </div>
        <form action={createDeckAction}>
          <button
            type="submit"
            className="h-[30px] px-3 bg-[var(--color-arcade-cyan)] clip-notch-sm flex items-center gap-1.5 text-[var(--color-arcade-bg)] font-heading font-bold text-[13px]"
          >
            <Plus className="w-3.5 h-3.5" /> NEW
          </button>
        </form>
      </div>

      <div className="flex-none px-4 pb-2.5">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search decks"
          className="w-full h-9 bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg px-3 font-mono font-semibold text-xs text-[var(--color-arcade-text)] outline-none focus:border-[var(--color-arcade-cyan)]"
        />
      </div>

      <div className="flex-none px-4 pb-2.5 flex gap-1.5">
        {(['recent', 'winrate', 'name'] as SortMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setSort(mode)}
            className={`px-2.5 py-1 rounded-md font-mono font-semibold text-[10px] tracking-wide ${
              sort === mode ? 'bg-[var(--color-arcade-inset)]' : 'bg-transparent'
            }`}
          >
            {mode === 'winrate' ? 'WIN %' : mode.toUpperCase()}
          </button>
        ))}
      </div>

      {allArchetypes.length > 0 && (
        <div className="flex-none px-4 pb-3 flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterOpen(true)}
            className="flex-none w-[30px] h-[30px] bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg grid place-items-center"
          >
            <Filter className="w-3.5 h-3.5 text-[var(--color-arcade-text-muted)]" />
          </button>
          {archetypeFilters.map(a => (
            <div
              key={a}
              className="flex items-center gap-1 bg-[rgba(25,211,206,.14)] border border-[var(--color-arcade-cyan)] rounded-full pl-2.5 pr-2 py-1"
            >
              <span className="font-mono font-semibold text-[10px] text-[var(--color-arcade-cyan)]">{a}</span>
              <button onClick={() => toggleArchetype(a)}>
                <X className="w-2.5 h-2.5 text-[var(--color-arcade-cyan)]" />
              </button>
            </div>
          ))}
        </div>
      )}

      {filterOpen && (
        <div
          className="fixed inset-0 bg-black/85 z-20 flex items-center justify-center"
          onClick={() => setFilterOpen(false)}
        >
          <div
            className="bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-xl p-4 w-[230px]"
            onClick={e => e.stopPropagation()}
          >
            <div className="font-mono font-bold text-[11px] tracking-wide text-[var(--color-arcade-text-muted)] mb-3">
              FILTER BY ARCHETYPE
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-[180px] overflow-y-auto thin-scroll">
              {allArchetypes.map(a => {
                const active = archetypeFilters.includes(a);
                return (
                  <button
                    key={a}
                    onClick={() => toggleArchetype(a)}
                    className={`px-2.5 py-1.5 rounded-lg border border-[var(--color-arcade-border)] font-heading font-semibold text-[11px] ${
                      active ? 'bg-[rgba(25,211,206,.16)] text-[var(--color-arcade-cyan)]' : 'bg-[var(--color-arcade-surface)] text-[var(--color-arcade-text)]'
                    }`}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setFilterOpen(false)}
              className="mt-3.5 w-full h-[38px] bg-[var(--color-arcade-cyan)] rounded-lg font-heading font-bold text-xs text-[var(--color-arcade-bg)]"
            >
              DONE
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto thin-scroll px-3 pb-4 flex flex-col gap-2.5">
        {visibleDecks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center text-[var(--color-arcade-text-muted)] font-mono text-sm py-16">
            {decks.length === 0 ? 'No decks yet — hit NEW to forge your first one.' : 'No decks match your filters.'}
          </div>
        ) : (
          visibleDecks.map(deck => <DeckRow key={deck.id} deck={deck} />)
        )}
      </div>
    </div>
  );
};
