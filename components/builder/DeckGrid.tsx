'use client';

import React from 'react';
import { useBuilderStore } from '@/store/builder-store';
import { StandardGrid } from './views/StandardGrid';
import { ListView } from './views/ListView';
import { CompactView } from './views/CompactView';

export const DeckGrid = () => {
  const { viewMode } = useBuilderStore();

  return (
    <div className="h-full w-full max-w-7xl mx-auto flex flex-col">
        {viewMode === 'standard' && <StandardGrid />}
        {viewMode === 'list' && <ListView />}
        {viewMode === 'compact' && <CompactView />}
    </div>
  );
};
