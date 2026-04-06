'use client';

import React from 'react';
import { useBuilderStore } from '@/store/builder-store';
import { StandardGrid } from './views/StandardGrid';
import { ListView } from './views/ListView';
import { CompactView } from './views/CompactView';
import { StickyStatsBar } from './StickyStatsBar';

export const DeckGrid = () => {
  const { viewMode } = useBuilderStore();

  return (
    <div className="h-full w-full max-w-7xl mx-auto flex flex-col relative">
        {viewMode === 'standard' && <StandardGrid />}
        {viewMode === 'list' && <ListView />}
        {viewMode === 'compact' && <CompactView />}
        
        <StickyStatsBar />
    </div>
  );
};
