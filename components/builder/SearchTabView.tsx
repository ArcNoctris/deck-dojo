'use client';

import React, { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { Search, Sparkles, Database, List, LayoutGrid } from 'lucide-react';
import { useBuilderStore } from '@/store/builder-store';
import { FilterPanel } from './FilterPanel';
import { VirtualCardList } from './VirtualCardList';
import { OracleRecommendations } from './OracleRecommendations';

export const SearchTabView = () => {
  const [localSearch, setLocalSearch] = useState('');
  const [debouncedSearch] = useDebounce(localSearch, 500);
  const { setFilters, searchViewMode, setSearchViewMode } = useBuilderStore();
  const [subTab, setSubTab] = useState<'search' | 'oracle'>('search');

  useEffect(() => {
    setFilters({ text: debouncedSearch });
  }, [debouncedSearch, setFilters]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none px-4 pt-3 pb-2 flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-arcade-text-muted)]" />
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search cards"
            className="w-full h-9 pl-9 pr-3 bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg font-mono font-semibold text-xs text-[var(--color-arcade-text)] outline-none focus:border-[var(--color-arcade-cyan)]"
          />
        </div>
        {subTab === 'search' && <FilterPanel />}
      </div>

      <div className="flex-none px-4 pb-2 flex items-center justify-between">
        <div className="flex gap-4">
          <button
            onClick={() => setSubTab('search')}
            className="flex items-center gap-1.5 font-heading font-bold text-[13px] tracking-wide uppercase"
            style={{ color: subTab === 'search' ? 'var(--color-arcade-cyan)' : 'var(--color-arcade-text-muted)' }}
          >
            <Database className="w-3.5 h-3.5" /> Search
          </button>
          <button
            onClick={() => setSubTab('oracle')}
            className="flex items-center gap-1.5 font-heading font-bold text-[13px] tracking-wide uppercase"
            style={{ color: subTab === 'oracle' ? 'var(--color-arcade-amber)' : 'var(--color-arcade-text-muted)' }}
          >
            <Sparkles className="w-3.5 h-3.5" /> Oracle
          </button>
        </div>
        {subTab === 'search' && (
          <div className="flex gap-1.5">
            <button
              onClick={() => setSearchViewMode('list')}
              className="w-[26px] h-[26px] rounded-md border border-[var(--color-arcade-border)] grid place-items-center text-[var(--color-arcade-text-muted)]"
              style={{ background: searchViewMode === 'list' ? 'var(--color-arcade-inset)' : 'var(--color-arcade-panel)' }}
            >
              <List className="w-3 h-3" />
            </button>
            <button
              onClick={() => setSearchViewMode('grid')}
              className="w-[26px] h-[26px] rounded-md border border-[var(--color-arcade-border)] grid place-items-center text-[var(--color-arcade-text-muted)]"
              style={{ background: searchViewMode === 'grid' ? 'var(--color-arcade-inset)' : 'var(--color-arcade-panel)' }}
            >
              <LayoutGrid className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 border-t border-[var(--color-arcade-border)]">
        {subTab === 'search' ? <VirtualCardList /> : <OracleRecommendations />}
      </div>
    </div>
  );
};
