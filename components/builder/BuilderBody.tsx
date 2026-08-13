'use client';

import { useBuilderStore } from '@/store/builder-store';
import { DeckContentView } from './DeckContentView';
import { SearchTabView } from './SearchTabView';
import { CardPreviewDrawer } from './CardPreviewDrawer';

export const BuilderBody = () => {
  const builderTab = useBuilderStore((s) => s.builderTab);

  return (
    <div className="h-full w-full flex flex-col relative">
      {builderTab === 'deck' ? <DeckContentView /> : <SearchTabView />}
      <CardPreviewDrawer />
    </div>
  );
};
