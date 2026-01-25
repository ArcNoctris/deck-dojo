'use client';

import { useEffect } from 'react';
import { getDeckCards } from '@/app/deck/[id]/actions';
import { useBuilderStore } from '@/store/builder-store';
import { DeckCard, UserTag } from '@/types/deck';
import { Card } from '@/types/database.types';
import { toast } from 'sonner';

export const DeckManager = ({ deckId }: { deckId: string }) => {
  const loadDeck = useBuilderStore((state) => state.loadDeck);

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const result = await getDeckCards(deckId);
        
        let cardsData: any[] = [];
        let versionId: string | null = null;

        if (Array.isArray(result)) {
            cardsData = [];
        } else {
            cardsData = result.cards;
            versionId = result.versionId || null;
        }

        const mainDeck: DeckCard[] = [];
        const extraDeck: DeckCard[] = [];
        const sideDeck: DeckCard[] = [];

        cardsData.forEach((row: any) => {
          const cardData = row.card as Card;
          const count = row.quantity || 1;
          const tag = row.user_tag as UserTag;
          const location = row.location;

          for (let i = 0; i < count; i++) {
            const deckCard: DeckCard = {
              ...cardData,
              instanceId: crypto.randomUUID(),
              userTag: tag
            };

            if (location === 'main') mainDeck.push(deckCard);
            else if (location === 'extra') extraDeck.push(deckCard);
            else if (location === 'side') sideDeck.push(deckCard);
          }
        });

        loadDeck(deckId, versionId, mainDeck, extraDeck, sideDeck);
        // Optional: toast.success('Deck loaded');
      } catch (error) {
        console.error('Failed to load deck', error);
        toast.error('Failed to load deck data');
      }
    };

    fetchDeck();
  }, [deckId, loadDeck]);

  return null;
};
