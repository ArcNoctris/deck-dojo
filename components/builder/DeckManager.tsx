'use client';

import { useEffect } from 'react';
import { getDeckCards } from '@/app/deck/[id]/actions';
import { useBuilderStore } from '@/store/builder-store';
import { toast } from 'sonner';
import { rowsToDeck } from '@/utils/deck-cards';

export const DeckManager = ({ deckId }: { deckId: string }) => {
  const loadDeck = useBuilderStore((state) => state.loadDeck);

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const result = await getDeckCards(deckId);
        const rows = Array.isArray(result) ? [] : result.cards;
        const versionId = Array.isArray(result) ? null : result.versionId || null;
        const { main, extra, side } = rowsToDeck(rows);
        loadDeck(deckId, versionId, main, extra, side);
      } catch (error) {
        console.error('Failed to load deck', error);
        toast.error('Failed to load deck data');
      }
    };

    fetchDeck();
  }, [deckId, loadDeck]);

  return null;
};
