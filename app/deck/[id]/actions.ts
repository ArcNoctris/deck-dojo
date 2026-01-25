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

export async function getDeckVersions(deckId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('deck_versions')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: false });
  
  if (error) return [];
  return data;
}

export async function getDeckCards(deckId: string, versionId?: string) {
  const supabase = await createClient();
  
  let targetVersionId = versionId;
  if (!targetVersionId) {
      // Get latest version
      const { data: latest } = await supabase
        .from('deck_versions')
        .select('id')
        .eq('deck_id', deckId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (latest) {
          targetVersionId = latest.id;
      } else {
          // Fallback if migration hasn't run or something (should be handled by migration)
          return [];
      }
  }

  const { data: cardsData, error } = await supabase
    .from('version_cards')
    .select(`
      id,
      version_id,
      card_id,
      location,
      quantity,
      card:cards(*)
    `)
    .eq('version_id', targetVersionId);

  if (error) {
    console.error('Error fetching deck cards:', error);
    return [];
  }

  // Fetch tags from deck_card_tags (persistent across versions)
  const cardIds = cardsData.map(c => c.card_id);
  
  // Also get tags for cards that might not be in version_cards but are relevant? 
  // No, only need tags for cards in this version.
  let tagMap = new Map<number, UserTag>();
  if (cardIds.length > 0) {
      const { data: tagsData } = await supabase
        .from('deck_card_tags')
        .select('card_id, tag')
        .eq('deck_id', deckId)
        .in('card_id', cardIds);
      
      tagsData?.forEach(t => tagMap.set(t.card_id, t.tag as UserTag));
  }

  return cardsData.map(c => ({
      ...c,
      deck_id: deckId,
      user_tag: tagMap.get(c.card_id) || null
  }));
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

export async function createNewVersion(deckId: string, baseVersionId: string, newName: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // 1. Create new version
    const { data: newVersion, error: vError } = await supabase
        .from('deck_versions')
        .insert({ deck_id: deckId, name: newName })
        .select()
        .single();

    if (vError) throw new Error('Failed to create version');

    // 2. Copy cards
    const { data: oldCards } = await supabase
        .from('version_cards')
        .select('card_id, location, quantity')
        .eq('version_id', baseVersionId);

    if (oldCards && oldCards.length > 0) {
        const newRows = oldCards.map(c => ({
            version_id: newVersion.id,
            card_id: c.card_id,
            location: c.location,
            quantity: c.quantity
        }));
        await supabase.from('version_cards').insert(newRows);
    }

    revalidatePath(`/deck/${deckId}`);
    return { success: true, versionId: newVersion.id };
}

export async function setCardTag(deckId: string, cardId: number, tag: UserTag) {
    const supabase = await createClient();
    // Upsert tag
    const { error } = await supabase
        .from('deck_card_tags')
        .upsert({ deck_id: deckId, card_id: cardId, tag }, { onConflict: 'deck_id, card_id' });
    
    if (error) console.error('Tag error:', error);
}

export async function saveDeck(deckId: string, cards: SavedDeckCard[], versionId?: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Verify ownership
  const { data: deck } = await supabase.from('decks').select('user_id, cover_card_id').eq('id', deckId).single();
  if (!deck || deck.user_id !== user.id) throw new Error('Unauthorized');

  // Resolve Version ID
  let targetVersionId = versionId;
  if (!targetVersionId) {
      // Fallback: Latest
      const { data: latest } = await supabase.from('deck_versions').select('id').eq('deck_id', deckId).order('created_at', { ascending: false }).limit(1).single();
      
      if (latest) {
          targetVersionId = latest.id;
      } else {
          // Auto-repair: Create v1.0 if missing (migration should have handled this, but for safety)
          const { data: newV, error: createError } = await supabase
            .from('deck_versions')
            .insert({ deck_id: deckId, name: 'v1.0' })
            .select('id')
            .single();
            
          if (createError || !newV) {
              console.error('Failed to auto-create version:', createError);
              throw new Error('No version found and failed to create one');
          }
          targetVersionId = newV.id;
      }
  }

  // 1. Update version_cards (Clear and Insert)
  const { error: deleteError } = await supabase
    .from('version_cards')
    .delete()
    .eq('version_id', targetVersionId);

  if (deleteError) throw new Error('Failed to clear deck version');

  if (cards.length > 0) {
    const rows = cards.map(c => ({
      version_id: targetVersionId,
      card_id: c.card_id,
      location: c.location,
      quantity: c.quantity
    }));

    const { error: insertError } = await supabase.from('version_cards').insert(rows);
    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error('Failed to save cards');
    }

    // 2. Update deck_card_tags (Upsert)
    // We only need to update if tag is present.
    // Ideally we should process unique tags.
    const tagsToUpsert = new Map<number, string>();
    cards.forEach(c => {
        if (c.user_tag) tagsToUpsert.set(c.card_id, c.user_tag);
    });

    if (tagsToUpsert.size > 0) {
        const tagRows = Array.from(tagsToUpsert.entries()).map(([cid, tag]) => ({
            deck_id: deckId,
            card_id: cid,
            tag
        }));
        await supabase.from('deck_card_tags').upsert(tagRows, { onConflict: 'deck_id, card_id' });
    }

    // 3. Smart Cover Art Logic (unchanged mostly, but depends on deck_cards which is gone?)
    // Need to use cards array directly which we have.
    if (!deck.cover_card_id) {
        // ... (reuse logic logic from previous implementation but using local cards array)
        // I will copy the logic but adapt it if needed.
        const cardIds = cards.map(c => c.card_id);
        const { data: deckCardsDetails } = await supabase
            .from('cards')
            .select('id, archetype, type')
            .in('id', cardIds);
        
        if (deckCardsDetails && deckCardsDetails.length > 0) {
            // ... (Same logic)
             let chosenCardId: number | null = null;
             const archetypeCounts: Record<string, number> = {};
             deckCardsDetails.forEach(card => {
                 if (card.archetype) archetypeCounts[card.archetype] = (archetypeCounts[card.archetype] || 0) + 1;
             });
             let maxCount = 0;
             let bestArchetype = null;
             for (const [arch, count] of Object.entries(archetypeCounts)) {
                 if (count > maxCount) { maxCount = count; bestArchetype = arch; }
             }
             if (bestArchetype) {
                 const candidates = deckCardsDetails.filter(c => c.archetype === bestArchetype);
                 const monsters = candidates.filter(c => !c.type?.includes('Spell') && !c.type?.includes('Trap'));
                 if (monsters.length > 0) chosenCardId = monsters[0].id;
                 else if (candidates.length > 0) chosenCardId = candidates[0].id;
             }
             if (!chosenCardId) {
                 const mainDeckMonsters = deckCardsDetails.filter(c => !c.type?.includes('Spell') && !c.type?.includes('Trap')); // Simplified check
                 if (mainDeckMonsters.length > 0) chosenCardId = mainDeckMonsters[Math.floor(Math.random() * mainDeckMonsters.length)].id;
                 else chosenCardId = deckCardsDetails[0].id;
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

export async function createSnapshot(deckId: string, versionName: string, stats: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('deck_snapshots')
    .insert({
      deck_id: deckId,
      version_name: versionName,
      stats
    });

  if (error) {
    console.error('Snapshot error:', error);
    throw new Error('Failed to create snapshot');
  }

  revalidatePath(`/deck/${deckId}`);
  return { success: true };
}

export async function getSnapshots(deckId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('deck_snapshots')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching snapshots:', error);
    return [];
  }

  return data;
}
