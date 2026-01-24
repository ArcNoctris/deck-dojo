import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Card } from '../types/database.types';
import { DeckCard, DeckState, UserTag } from '../types/deck';

export interface ActiveFilters {
  text: string;
  attributes: string[];
  race: string | null;
  level: [number, number];
  archetype: string | null;
  cardType: 'monster' | 'spell' | 'trap' | null; 
}

export type SortMethod = 'default' | 'monster-spell-trap' | 'alphabetical';
export type ViewMode = 'standard' | 'list' | 'compact';
export type Density = 'standard' | 'high';

interface BuilderActions {
  addCard: (card: Card, location: 'main' | 'extra' | 'side') => void;
  removeCard: (instanceId: string, location: 'main' | 'extra' | 'side') => void;
  setCardTag: (instanceId: string, location: 'main' | 'extra' | 'side', tag: UserTag) => void;
  moveCard: (instanceId: string, fromZone: 'main' | 'extra' | 'side', toZone: 'main' | 'extra' | 'side') => void;
  clearDeck: () => void;
  loadDeck: (main: DeckCard[], extra: DeckCard[], side: DeckCard[]) => void;
  
  // New Filter & Sort Actions
  setFilters: (filters: Partial<ActiveFilters>) => void;
  setSortMethod: (method: SortMethod) => void;
  sortDeck: (method: SortMethod) => void;
  
  // View Settings
  setViewMode: (mode: ViewMode) => void;
  toggleStacked: () => void;
  setDensity: (density: Density) => void;
}

type BuilderStore = DeckState & {
  activeFilters: ActiveFilters;
  sortMethod: SortMethod;
  viewMode: ViewMode;
  isStacked: boolean;
  density: Density;
} & BuilderActions;

const MAX_MAIN = 60;
const MAX_EXTRA = 15;
const MAX_SIDE = 15;
const MAX_COPIES = 3;

const DEFAULT_FILTERS: ActiveFilters = {
  text: '',
  attributes: [],
  race: null,
  level: [0, 13], // 0 covers Spells/Traps, 13 covers Max Rank
  archetype: null,
  cardType: null,
};

export const useBuilderStore = create<BuilderStore>()(
  persist(
    (set, get) => ({
      mainDeck: [],
      extraDeck: [],
      sideDeck: [],
      unsavedChanges: false,
      activeFilters: DEFAULT_FILTERS,
      sortMethod: 'default',
      viewMode: 'standard',
      isStacked: false,
      density: 'standard',

      addCard: (card, location) => {
        const state = get();
        const { mainDeck, extraDeck, sideDeck } = state;

        if (location === 'main' && mainDeck.length >= MAX_MAIN) return;
        if (location === 'extra' && extraDeck.length >= MAX_EXTRA) return;
        if (location === 'side' && sideDeck.length >= MAX_SIDE) return;

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
           // Find the card definition ID first
           const allCards = [...state.mainDeck, ...state.extraDeck, ...state.sideDeck];
           const targetCard = allCards.find(c => c.instanceId === instanceId);
           
           if (!targetCard) return state;
           
           const cardId = targetCard.id;

           // Helper to update list
           const updateList = (list: DeckCard[]) => list.map(c => 
             c.id === cardId ? { ...c, userTag: tag } : c
           );

           return {
             ...state,
             mainDeck: updateList(state.mainDeck),
             extraDeck: updateList(state.extraDeck),
             sideDeck: updateList(state.sideDeck),
             unsavedChanges: true,
           };
        });
      },

      moveCard: (instanceId, fromZone, toZone) => {
        set((state) => {
            const fromKey = fromZone === 'main' ? 'mainDeck' : fromZone === 'extra' ? 'extraDeck' : 'sideDeck';
            const toKey = toZone === 'main' ? 'mainDeck' : toZone === 'extra' ? 'extraDeck' : 'sideDeck';
            
            const card = state[fromKey].find(c => c.instanceId === instanceId);
            if (!card) return state;

            const targetDeck = state[toKey];
            if (toZone === 'main' && targetDeck.length >= MAX_MAIN) return state;
            if (toZone === 'extra' && targetDeck.length >= MAX_EXTRA) return state;
            if (toZone === 'side' && targetDeck.length >= MAX_SIDE) return state;

            return {
                ...state,
                [fromKey]: state[fromKey].filter(c => c.instanceId !== instanceId),
                [toKey]: [...targetDeck, card],
                unsavedChanges: true
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

      setFilters: (filters) => {
        set((state) => ({
          activeFilters: { ...state.activeFilters, ...filters }
        }));
      },

      setSortMethod: (method) => {
        set({ sortMethod: method });
      },
      
      setViewMode: (mode) => set({ viewMode: mode }),
      toggleStacked: () => set((state) => ({ isStacked: !state.isStacked })),
      setDensity: (density) => set({ density }),

      sortDeck: (method) => {
        set((state) => {
          const sortFn = (a: DeckCard, b: DeckCard) => {
            if (method === 'alphabetical') {
              return a.name.localeCompare(b.name);
            }
            if (method === 'monster-spell-trap') {
              // Priority: Monster > Spell > Trap
              // But 'type' field strings vary. "Normal Monster", "Spell Card", "Trap Card"
              const getTypePriority = (type: string | null) => {
                if (!type) return 99;
                if (type.includes('Monster')) return 1;
                if (type.includes('Spell')) return 2;
                if (type.includes('Trap')) return 3;
                return 4; // Token etc.
              };
              
              const pA = getTypePriority(a.type);
              const pB = getTypePriority(b.type);
              
              if (pA !== pB) return pA - pB;
              
              // Then Level (descending for monsters)
              if (pA === 1) {
                  const levelA = a.level || a.scale || a.linkval || 0;
                  const levelB = b.level || b.scale || b.linkval || 0;
                  if (levelA !== levelB) return levelB - levelA;
              }
              
              // Finally Name
              return a.name.localeCompare(b.name);
            }
            return 0; // Default (insertion order usually, or unchanged)
          };

          return {
            mainDeck: [...state.mainDeck].sort(sortFn),
            extraDeck: [...state.extraDeck].sort(sortFn),
            sideDeck: [...state.sideDeck].sort(sortFn),
            unsavedChanges: true,
            sortMethod: method
          };
        });
      }
    }),
    {
      name: 'deckdojo-builder-draft',
    }
  )
);
