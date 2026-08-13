import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Card } from '../types/database.types';
import { DeckCard, DeckState, UserTag } from '../types/deck';
import { generateId } from '@/utils/uuid';

export interface ActiveFilters {
  text: string;
  cardTypes: string[]; // 'Monster' | 'Spell' | 'Trap', multi-select
  attributes: string[];
  races: string[]; // "Type (Race)" for monsters — multi-select
  levels: number[]; // discrete Level/Rank/Link values, multi-select
  archetypes: string[];
  extraKinds: string[]; // 'Fusion' | 'Synchro' | 'XYZ' | 'Link', multi-select
  spellSubtypes: string[]; // Normal/Quick-Play/Continuous/etc — shares the `race` column
  trapSubtypes: string[]; // Normal/Continuous/Counter — shares the `race` column
}

export type SortMethod = 'default' | 'monster-spell-trap' | 'alphabetical';
export type BuilderTab = 'deck' | 'search';
export type ListOrGrid = 'list' | 'grid';

interface BuilderActions {
  addCard: (card: Card, location: 'main' | 'extra' | 'side') => void;
  removeCard: (instanceId: string, location: 'main' | 'extra' | 'side') => void;
  setCardTag: (instanceId: string, location: 'main' | 'extra' | 'side', tag: UserTag) => void;
  moveCard: (instanceId: string, fromZone: 'main' | 'extra' | 'side', toZone: 'main' | 'extra' | 'side') => void;
  reorderGroup: (location: 'main' | 'extra' | 'side', orderedCardIds: number[]) => void;
  moveGroup: (cardId: number, fromZone: 'main' | 'extra' | 'side', toZone: 'main' | 'extra' | 'side') => void;
  clearDeck: () => void;
  loadDeck: (deckId: string, versionId: string | null, main: DeckCard[], extra: DeckCard[], side: DeckCard[]) => void;

  // Filter & Sort Actions
  setFilters: (filters: Partial<ActiveFilters>) => void;
  setSortMethod: (method: SortMethod) => void;
  sortDeck: (method: SortMethod) => void;

  // View Settings
  setBuilderTab: (tab: BuilderTab) => void;
  setDeckViewMode: (mode: ListOrGrid) => void;
  setSearchViewMode: (mode: ListOrGrid) => void;

  // Mobile UX State
  setActivePreviewCard: (card: DeckCard | null) => void;
}

type BuilderStore = DeckState & {
  activeFilters: ActiveFilters;
  sortMethod: SortMethod;
  builderTab: BuilderTab;
  deckViewMode: ListOrGrid;
  searchViewMode: ListOrGrid;
  activePreviewCard: DeckCard | null;
} & BuilderActions;

const MAX_MAIN = 60;
const MAX_EXTRA = 15;
const MAX_SIDE = 15;
const MAX_COPIES = 3;

const DEFAULT_FILTERS: ActiveFilters = {
  text: '',
  cardTypes: [],
  attributes: [],
  races: [],
  levels: [],
  archetypes: [],
  extraKinds: [],
  spellSubtypes: [],
  trapSubtypes: [],
};

export const useBuilderStore = create<BuilderStore>()(
  persist(
    (set, get) => ({
      versionId: null,
      mainDeck: [],
      extraDeck: [],
      sideDeck: [],
      unsavedChanges: false,
      activeFilters: DEFAULT_FILTERS,
      sortMethod: 'default',
      builderTab: 'deck',
      deckViewMode: 'list',
      searchViewMode: 'list',
      activePreviewCard: null,

      setActivePreviewCard: (card) => set({ activePreviewCard: card }),

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
          instanceId: generateId(),
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

      // Cards are grouped by id for display (one row per unique card + qty badge),
      // so reordering/moving acts on the whole stack rather than one instance.
      reorderGroup: (location, orderedCardIds) => {
        set((state) => {
          const key = location === 'main' ? 'mainDeck' : location === 'extra' ? 'extraDeck' : 'sideDeck';
          const list = state[key];
          const byId = new Map<number, DeckCard[]>();
          list.forEach(c => {
            const arr = byId.get(c.id) || [];
            arr.push(c);
            byId.set(c.id, arr);
          });
          const newList: DeckCard[] = [];
          orderedCardIds.forEach(id => newList.push(...(byId.get(id) || [])));
          byId.forEach((cards, id) => { if (!orderedCardIds.includes(id)) newList.push(...cards); });
          return { ...state, [key]: newList, unsavedChanges: true };
        });
      },

      moveGroup: (cardId, fromZone, toZone) => {
        set((state) => {
          const fromKey = fromZone === 'main' ? 'mainDeck' : fromZone === 'extra' ? 'extraDeck' : 'sideDeck';
          const toKey = toZone === 'main' ? 'mainDeck' : toZone === 'extra' ? 'extraDeck' : 'sideDeck';

          const moving = state[fromKey].filter(c => c.id === cardId);
          if (moving.length === 0) return state;

          const targetSize = state[toKey].length;
          const maxForTarget = toZone === 'main' ? MAX_MAIN : toZone === 'extra' ? MAX_EXTRA : MAX_SIDE;
          if (targetSize + moving.length > maxForTarget) return state;

          return {
            ...state,
            [fromKey]: state[fromKey].filter(c => c.id !== cardId),
            [toKey]: [...state[toKey], ...moving],
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

      loadDeck: (deckId, versionId, main, extra, side) => {
        set({
          versionId,
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

      setBuilderTab: (tab) => set({ builderTab: tab }),
      setDeckViewMode: (mode) => set({ deckViewMode: mode }),
      setSearchViewMode: (mode) => set({ searchViewMode: mode }),

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
      // Bumped because ActiveFilters' shape changed (single-select -> multi-select
      // arrays) — without this, browsers with the old cached shape crash on read.
      version: 1,
      // Only deck contents need to survive a refresh; filters/view-mode are
      // session-local UI state and should always start fresh.
      partialize: (state) => ({
        versionId: state.versionId,
        mainDeck: state.mainDeck,
        extraDeck: state.extraDeck,
        sideDeck: state.sideDeck,
        unsavedChanges: state.unsavedChanges,
        sortMethod: state.sortMethod,
      }),
    }
  )
);
