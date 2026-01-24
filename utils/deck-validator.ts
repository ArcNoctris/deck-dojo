import { DeckState, DeckCard } from '@/types/deck';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  erroredCardIds: number[]; // IDs of cards causing errors
}

export function validateDeck(state: DeckState): ValidationResult {
  const { mainDeck, extraDeck, sideDeck } = state;
  const errors: string[] = [];
  const warnings: string[] = [];
  const erroredCardIds: number[] = [];

  // 1. Deck Sizes
  if (mainDeck.length < 40) errors.push(`Main Deck too small (${mainDeck.length}/40)`);
  if (mainDeck.length > 60) errors.push(`Main Deck too large (${mainDeck.length}/60)`);
  if (extraDeck.length > 15) errors.push(`Extra Deck too large (${extraDeck.length}/15)`);
  if (sideDeck.length > 15) errors.push(`Side Deck too large (${sideDeck.length}/15)`);

  // 2. Card Limits & Banlist
  const allCards = [...mainDeck, ...extraDeck, ...sideDeck];
  const counts = new Map<number, number>();
  const cardMap = new Map<number, DeckCard>();

  allCards.forEach(c => {
    counts.set(c.id, (counts.get(c.id) || 0) + 1);
    cardMap.set(c.id, c);
  });

  counts.forEach((count, id) => {
    const card = cardMap.get(id)!;
    const name = card.name;
    const status = card.ban_status; // 'Banned', 'Limited', 'Semi-Limited', 'Unlimited' (or null)

    let limit = 3;
    if (status === 'Banned') limit = 0;
    else if (status === 'Limited') limit = 1;
    else if (status === 'Semi-Limited') limit = 2;

    if (count > limit) {
      errors.push(`Illegal count for "${name}": ${count}/${limit} (${status || 'Unlimited'})`);
      erroredCardIds.push(id);
    }
  });

  // 3. Warnings (Tactical)
  const starters = mainDeck.filter(c => c.userTag === 'starter').length;
  if (starters === 0) {
    warnings.push("No 'Starter' cards identified in Main Deck.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    erroredCardIds
  };
}
