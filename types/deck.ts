import { Card } from './database.types';

export type UserTag = 'starter' | 'extender' | 'brick' | 'engine' | 'flex' | 'defense' | null;

export interface DeckCard extends Card {
  instanceId: string;
  userTag: UserTag;
}

export interface DeckState {
  mainDeck: DeckCard[];
  extraDeck: DeckCard[];
  sideDeck: DeckCard[];
  unsavedChanges: boolean;
}
