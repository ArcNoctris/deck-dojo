import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Card } from '../types/database.types';
import { DeckCard, DeckState, UserTag } from '../types/deck';

interface BuilderActions {
  addCard: (card: Card, location: 'main' | 'extra' | 'side') => void;
  removeCard: (instanceId: string, location: 'main' | 'extra' | 'side') => void;
  setCardTag: (instanceId: string, location: 'main' | 'extra' | 'side', tag: UserTag) => void;
  clearDeck: () => void;
  loadDeck: (main: DeckCard[], extra: DeckCard[], side: DeckCard[]) => void;
}

type BuilderStore = DeckState & BuilderActions;

const MAX_MAIN = 60;
const MAX_EXTRA = 15;
const MAX_SIDE = 15;
const MAX_COPIES = 3;

export const useBuilderStore = create<BuilderStore>()(
  persist(
    (set, get) => ({
      mainDeck: [],
      extraDeck: [],
      sideDeck: [],
      unsavedChanges: false,

      addCard: (card, location) => {
        const state = get();
        const { mainDeck, extraDeck, sideDeck } = state;

        // Check bounds
        if (location === 'main' && mainDeck.length >= MAX_MAIN) return;
        if (location === 'extra' && extraDeck.length >= MAX_EXTRA) return;
        if (location === 'side' && sideDeck.length >= MAX_SIDE) return;

        // Check copies (Global count across all zones)
        const allCards = [...mainDeck, ...extraDeck, ...sideDeck];
        const copies = allCards.filter((c) => c.id === card.id).length;
        if (copies >= MAX_COPIES) return;

        const newCard: DeckCard = {
          ...card,
          instanceId: crypto.randomUUID(),
          userTag: null,
        };

        set((state) => {
           const deckKey = location === 'main' ? 'mainDeck' : location === 'extra' ? 'extraDeck' : 'sideDeck';
           return {
             ...state,
             [deckKey]: [...state[deckKey], newCard],
             unsavedChanges: true,
           };
        });
      },

      removeCard: (instanceId, location) => {
        set((state) => {
          const deckKey = location === 'main' ? 'mainDeck' : location === 'extra' ? 'extraDeck' : 'sideDeck';
          return {
            ...state,
            [deckKey]: state[deckKey].filter((c) => c.instanceId !== instanceId),
            unsavedChanges: true,
          };
        });
      },

      setCardTag: (instanceId, location, tag) => {
        set((state) => {
          const deckKey = location === 'main' ? 'mainDeck' : location === 'extra' ? 'extraDeck' : 'sideDeck';
          return {
            ...state,
            [deckKey]: state[deckKey].map((c) =>
              c.instanceId === instanceId ? { ...c, userTag: tag } : c
            ),
            unsavedChanges: true,
          };
        });
      },

      clearDeck: () => {
        set({
          mainDeck: [],
          extraDeck: [],
          sideDeck: [],
          unsavedChanges: false,
        });
      },

      loadDeck: (main, extra, side) => {
        set({
          mainDeck: main,
          extraDeck: extra,
          sideDeck: side,
          unsavedChanges: false,
        });
      },
    }),
    {
      name: 'deckdojo-builder-draft',
    }
  )
);
