import { useMemo } from 'react';
import { useBuilderStore } from '@/store/builder-store';
import { validateDeck } from '@/utils/deck-validator';

export const useDeckValidation = () => {
    const store = useBuilderStore();
    return useMemo(() => validateDeck(store), [store.mainDeck, store.extraDeck, store.sideDeck]);
};
