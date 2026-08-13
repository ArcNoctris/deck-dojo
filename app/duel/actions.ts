'use server';

import { createClient } from '@/utils/supabase/server';
import { pickStable } from '@/utils/decks/cover-image';

export interface DuelDeckOption {
  id: string;
  name: string;
  coverImageUrl: string | null;
}

export async function getUserDuelDecks(): Promise<DuelDeckOption[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: decks } = await supabase
    .from('decks')
    .select('id, name, cover_card:cards!decks_cover_card_id_fkey(image_url)')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  if (!decks || decks.length === 0) return [];

  const deckIds = decks.map(d => d.id);
  const { data: versions } = await supabase
    .from('deck_versions')
    .select('id, deck_id, created_at')
    .in('deck_id', deckIds)
    .order('created_at', { ascending: false });

  const latestVersionByDeck = new Map<string, string>();
  (versions || []).forEach(v => {
    if (!latestVersionByDeck.has(v.deck_id)) latestVersionByDeck.set(v.deck_id, v.id);
  });

  const latestVersionIds = Array.from(latestVersionByDeck.values());
  const { data: versionCards } = latestVersionIds.length
    ? await supabase
        .from('version_cards')
        .select('version_id, location, card:cards(image_url)')
        .eq('location', 'main')
        .in('version_id', latestVersionIds)
    : { data: [] as never[] };

  const imagesByVersion = new Map<string, string[]>();
  (versionCards || []).forEach(row => {
    const card = Array.isArray(row.card) ? row.card[0] : row.card;
    if (!card?.image_url) return;
    const list = imagesByVersion.get(row.version_id) || [];
    list.push(card.image_url);
    imagesByVersion.set(row.version_id, list);
  });

  return decks.map(deck => {
    const coverCard = Array.isArray(deck.cover_card) ? deck.cover_card[0] : deck.cover_card;
    const versionId = latestVersionByDeck.get(deck.id);
    const mainImages = versionId ? imagesByVersion.get(versionId) || [] : [];
    const coverImageUrl = coverCard?.image_url || pickStable(deck.id, mainImages);
    return { id: deck.id, name: deck.name, coverImageUrl };
  });
}
