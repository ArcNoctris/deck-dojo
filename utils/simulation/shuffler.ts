import { DeckCard } from '@/types/deck';

/**
 * Simulates drawing a hand from a deck using the Fisher-Yates shuffle algorithm.
 * 
 * @param deck The array of cards to shuffle and draw from.
 * @param handSize The number of cards to draw (default 5).
 * @returns An object containing the drawn hand and the remaining deck.
 */
export const drawHand = (deck: DeckCard[], handSize: number = 5): { hand: DeckCard[], remainingDeck: DeckCard[] } => {
  // Create a shallow copy of the deck to avoid mutating the original array
  const shuffledDeck = [...deck];

  // Fisher-Yates Shuffle
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }

  // Draw the hand
  const hand = shuffledDeck.slice(0, handSize);
  const remainingDeck = shuffledDeck.slice(handSize);

  return { hand, remainingDeck };
};
