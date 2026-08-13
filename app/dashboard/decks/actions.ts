'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { createNewVersion, updateDeckMetadata } from '@/app/deck/[id]/actions';

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  return { supabase, user };
}

export async function toggleFavoriteDeck(deckId: string, isFavorite: boolean) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from('decks')
    .update({ is_favorite: isFavorite })
    .eq('id', deckId)
    .eq('user_id', user.id);

  if (error) throw new Error('Failed to update favorite');
  revalidatePath('/dashboard/decks');
}

export async function renameDeck(deckId: string, name: string) {
  const { supabase, user } = await requireUser();
  const { data: deck } = await supabase
    .from('decks')
    .select('format')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .single();
  if (!deck) throw new Error('Deck not found');

  await updateDeckMetadata(deckId, name, deck.format || 'Advanced');
  revalidatePath('/dashboard/decks');
}

export async function archiveDeck(deckId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from('decks')
    .update({ is_archived: true })
    .eq('id', deckId)
    .eq('user_id', user.id);

  if (error) throw new Error('Failed to archive deck');
  revalidatePath('/dashboard/decks');
}

export async function deleteDeck(deckId: string) {
  const { supabase, user } = await requireUser();

  const { data: owned } = await supabase
    .from('decks')
    .select('id')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .single();
  if (!owned) throw new Error('Deck not found');

  const { data: versions } = await supabase
    .from('deck_versions')
    .select('id')
    .eq('deck_id', deckId);
  const versionIds = (versions || []).map(v => v.id);

  if (versionIds.length > 0) {
    await supabase.from('version_cards').delete().in('version_id', versionIds);
  }
  await supabase.from('deck_versions').delete().eq('deck_id', deckId);
  await supabase.from('deck_card_tags').delete().eq('deck_id', deckId);

  const { error } = await supabase.from('decks').delete().eq('id', deckId);
  if (error) throw new Error('Failed to delete deck');

  revalidatePath('/dashboard/decks');
}

export async function duplicateDeck(deckId: string) {
  const { supabase, user } = await requireUser();

  const { data: source } = await supabase
    .from('decks')
    .select('name, format, cover_card_id')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .single();
  if (!source) throw new Error('Deck not found');

  const { data: newDeck, error: insertError } = await supabase
    .from('decks')
    .insert({
      user_id: user.id,
      name: `${source.name} (Copy)`,
      format: source.format,
      cover_card_id: source.cover_card_id,
    })
    .select('id')
    .single();
  if (insertError || !newDeck) throw new Error('Failed to duplicate deck');

  const { data: latestVersion } = await supabase
    .from('deck_versions')
    .select('id')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (latestVersion) {
    await createNewVersion(newDeck.id, latestVersion.id, 'v1.0');

    const { data: tags } = await supabase
      .from('deck_card_tags')
      .select('card_id, tag')
      .eq('deck_id', deckId);
    if (tags && tags.length > 0) {
      await supabase.from('deck_card_tags').insert(
        tags.map(t => ({ deck_id: newDeck.id, card_id: t.card_id, tag: t.tag }))
      );
    }
  }

  revalidatePath('/dashboard/decks');
  return { id: newDeck.id };
}
