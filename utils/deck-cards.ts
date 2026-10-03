import { DeckCard, UserTag } from '@/types/deck';
import { Card } from '@/types/database.types';
import type { SavedDeckCard } from '@/app/deck/[id]/actions';
import { generateId } from '@/utils/uuid';

/** Expand `version_cards` rows (with joined card) into per-copy deck zones. */
export function rowsToDeck(rows: any[]) {
  const main: DeckCard[] = [];
  const extra: DeckCard[] = [];
  const side: DeckCard[] = [];

  rows.forEach((row) => {
    const card = row.card as Card;
    const count = row.quantity || 1;
    const tag = row.user_tag as UserTag;
    const zone = row.location === 'main' ? main : row.location === 'extra' ? extra : row.location === 'side' ? side : null;
    if (!zone) return;
    for (let i = 0; i < count; i++) {
      zone.push({ ...card, instanceId: generateId(), userTag: tag });
    }
  });

  return { main, extra, side };
}

/** Collapse deck zones into quantity rows for `saveDeck`. */
export function toSavedCards(main: DeckCard[], extra: DeckCard[], side: DeckCard[]): SavedDeckCard[] {
  const grouped = new Map<string, SavedDeckCard>();
  const add = (cards: DeckCard[], location: SavedDeckCard['location']) => {
    cards.forEach((card) => {
      const key = `${card.id}-${location}-${card.userTag || 'null'}`;
      const existing = grouped.get(key);
      if (existing) existing.quantity++;
      else grouped.set(key, { card_id: card.id, location, quantity: 1, user_tag: card.userTag });
    });
  };
  add(main, 'main');
  add(extra, 'extra');
  add(side, 'side');
  return Array.from(grouped.values());
}
