'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { UserTag } from '@/types/deck';

export interface SavedDeckCard {
  card_id: number;
  location: 'main' | 'extra' | 'side';
  quantity: number;
  user_tag: UserTag;
}

export async function getDeckCards(deckId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('deck_cards')
    .select(`
      id,
      deck_id,
      card_id,
      location,
      quantity,
      user_tag,
      card:cards(*)
    `)
    .eq('deck_id', deckId);

  if (error) {
    console.error('Error fetching deck cards:', error);
    return [];
  }

  return data;
}

export async function saveDeck(deckId: string, cards: SavedDeckCard[]) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: deck } = await supabase.from('decks').select('user_id').eq('id', deckId).single();
  if (!deck || deck.user_id !== user.id) throw new Error('Unauthorized');

  // Transaction-like sequence
  // 1. Delete all existing cards for this deck
  const { error: deleteError } = await supabase
    .from('deck_cards')
    .delete()
    .eq('deck_id', deckId);

  if (deleteError) {
    throw new Error('Failed to clear deck');
  }

  // 2. Insert new cards
  if (cards.length > 0) {
    const rows = cards.map(c => ({
      deck_id: deckId,
      card_id: c.card_id,
      location: c.location,
      quantity: c.quantity,
      user_tag: c.user_tag
    }));

    const { error: insertError } = await supabase
      .from('deck_cards')
      .insert(rows);

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error('Failed to save cards');
    }
  }
  
  // Touch the deck's created_at to simulate "updated_at" since we lack that column? 
  // Or just revalidate.
  
  revalidatePath(`/deck/${deckId}`);
  return { success: true };
}
