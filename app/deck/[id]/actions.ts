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

export async function updateDeckMetadata(deckId: string, name: string, format: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('decks')
    .update({ name, format })
    .eq('id', deckId)
    .eq('user_id', user.id);

  if (error) throw new Error('Failed to update deck metadata');
  
  revalidatePath(`/deck/${deckId}`);
  return { success: true };
}

export async function saveDeck(deckId: string, cards: SavedDeckCard[]) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: deck } = await supabase.from('decks').select('user_id, cover_card_id').eq('id', deckId).single();
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

    // 3. Smart Cover Art Logic
    if (!deck.cover_card_id) {
      const cardIds = cards.map(c => c.card_id);
      const { data: deckCardsDetails } = await supabase
          .from('cards')
          .select('id, archetype, type')
          .in('id', cardIds);
      
      if (deckCardsDetails && deckCardsDetails.length > 0) {
          let chosenCardId: number | null = null;

          // Count Archetypes
          const archetypeCounts: Record<string, number> = {};
          deckCardsDetails.forEach(card => {
              if (card.archetype) {
                  archetypeCounts[card.archetype] = (archetypeCounts[card.archetype] || 0) + 1;
              }
          });

          // Find most frequent archetype
          let maxCount = 0;
          let bestArchetype = null;
          for (const [arch, count] of Object.entries(archetypeCounts)) {
              if (count > maxCount) {
                  maxCount = count;
                  bestArchetype = arch;
              }
          }

          if (bestArchetype) {
              const candidates = deckCardsDetails.filter(c => c.archetype === bestArchetype);
              // Prefer monsters if possible, else any
              const monsters = candidates.filter(c => !c.type?.includes('Spell') && !c.type?.includes('Trap'));
              if (monsters.length > 0) {
                  chosenCardId = monsters[0].id;
              } else if (candidates.length > 0) {
                  chosenCardId = candidates[0].id;
              }
          }

          // Fallback: Random Main Deck Monster
          if (!chosenCardId) {
             const mainDeckMonsters = deckCardsDetails.filter(c => 
                 !c.type?.includes('Fusion') && 
                 !c.type?.includes('Synchro') && 
                 !c.type?.includes('XYZ') && 
                 !c.type?.includes('Link') &&
                 !c.type?.includes('Token') &&
                 !c.type?.includes('Skill') &&
                 !c.type?.includes('Spell') &&
                 !c.type?.includes('Trap')
             );

             if (mainDeckMonsters.length > 0) {
                 chosenCardId = mainDeckMonsters[Math.floor(Math.random() * mainDeckMonsters.length)].id;
             } else {
                 // Absolute fallback: just the first card
                 chosenCardId = deckCardsDetails[0].id;
             }
          }

          if (chosenCardId) {
              await supabase.from('decks').update({ cover_card_id: chosenCardId }).eq('id', deckId);
          }
      }
    }
  }
  
  revalidatePath(`/deck/${deckId}`);
  return { success: true };
}
