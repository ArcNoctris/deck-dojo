import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { createNewDeck } from '@/app/dashboard/actions';
import { DecksListClient, DeckListItem } from '@/components/dashboard/DecksListClient';
import { banLimit } from '@/utils/ban-limit';
import { pickStable } from '@/utils/decks/cover-image';

const SWATCHES = ['#19D3CE', '#7C5CFF', '#FFC53D', '#FF3DA6', '#35D07F'];
const swatchFor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return SWATCHES[hash % SWATCHES.length];
};

export default async function DecksListPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: decks } = await supabase
    .from('decks')
    .select('id, name, format, is_favorite, created_at, cover_card:cards!decks_cover_card_id_fkey(image_url)')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  if (!decks || decks.length === 0) {
    return <DecksListClient decks={[]} createDeckAction={createNewDeck} />;
  }

  const deckIds = decks.map(d => d.id);

  const [{ data: versions }, { data: matches }] = await Promise.all([
    supabase
      .from('deck_versions')
      .select('id, deck_id, created_at')
      .in('deck_id', deckIds)
      .order('created_at', { ascending: false }),
    supabase
      .from('matches')
      .select('result, deck_version:deck_versions!inner(deck_id)')
      .eq('user_id', user.id),
  ]);

  const versionsByDeck = new Map<string, { id: string; created_at: string | null }[]>();
  (versions || []).forEach(v => {
    const list = versionsByDeck.get(v.deck_id) || [];
    list.push({ id: v.id, created_at: v.created_at });
    versionsByDeck.set(v.deck_id, list);
  });

  const latestVersionIds = decks
    .map(d => versionsByDeck.get(d.id)?.[0]?.id)
    .filter((id): id is string => !!id);

  const { data: versionCards } = latestVersionIds.length
    ? await supabase
        .from('version_cards')
        .select('version_id, card_id, location, quantity, card:cards(name, archetype, ban_status, image_url)')
        .in('version_id', latestVersionIds)
    : { data: [] as never[] };

  const cardsByVersion = new Map<string, typeof versionCards>();
  (versionCards || []).forEach(row => {
    const list = cardsByVersion.get(row.version_id) || [];
    list.push(row);
    cardsByVersion.set(row.version_id, list as never);
  });

  const winStatsByDeck = new Map<string, { wins: number; total: number }>();
  (matches || []).forEach((m: { result: string | null; deck_version: { deck_id: string } | { deck_id: string }[] }) => {
    const dv = Array.isArray(m.deck_version) ? m.deck_version[0] : m.deck_version;
    if (!dv) return;
    const stat = winStatsByDeck.get(dv.deck_id) || { wins: 0, total: 0 };
    stat.total++;
    if (m.result === 'win') stat.wins++;
    winStatsByDeck.set(dv.deck_id, stat);
  });

  const items: DeckListItem[] = decks.map(deck => {
    const deckVersions = versionsByDeck.get(deck.id) || [];
    const latestVersionId = deckVersions[0]?.id;
    const rows = (latestVersionId ? cardsByVersion.get(latestVersionId) : []) || [];

    let mainCount = 0, extraCount = 0, sideCount = 0;
    const archetypeCounts: Record<string, number> = {};
    const qtyByCard = new Map<number, { qty: number; name: string; banStatus: string | null }>();
    const mainImageUrls: string[] = [];

    rows.forEach((row) => {
      const card = Array.isArray(row.card) ? row.card[0] : row.card;
      const qty = row.quantity || 0;
      if (row.location === 'main') mainCount += qty;
      else if (row.location === 'extra') extraCount += qty;
      else if (row.location === 'side') sideCount += qty;

      if (card?.archetype) archetypeCounts[card.archetype] = (archetypeCounts[card.archetype] || 0) + qty;
      if (row.location === 'main' && card?.image_url) mainImageUrls.push(card.image_url);

      const existing = qtyByCard.get(row.card_id);
      qtyByCard.set(row.card_id, {
        qty: (existing?.qty || 0) + qty,
        name: card?.name || 'Unknown card',
        banStatus: card?.ban_status ?? null,
      });
    });

    let archetype: string | null = null;
    let maxCount = 0;
    for (const [arch, count] of Object.entries(archetypeCounts)) {
      if (count > maxCount) { maxCount = count; archetype = arch; }
    }

    let warning: string | null = null;
    if (latestVersionId) {
      if (mainCount < 40) {
        warning = `${40 - mainCount} card${40 - mainCount === 1 ? '' : 's'} short of the 40-card minimum`;
      } else {
        for (const { qty, name, banStatus } of qtyByCard.values()) {
          if (qty > banLimit(banStatus)) {
            warning = `Contains an illegal count of "${name}"`;
            break;
          }
        }
      }
    }

    const stat = winStatsByDeck.get(deck.id);
    const winRate = stat && stat.total > 0 ? Math.round((stat.wins / stat.total) * 100) : null;

    const daysAgo = deck.created_at
      ? Math.max(0, Math.floor((Date.now() - new Date(deck.created_at).getTime()) / 86400000))
      : 0;

    const coverCard = Array.isArray(deck.cover_card) ? deck.cover_card[0] : deck.cover_card;
    const coverUrl = coverCard?.image_url || pickStable(deck.id, mainImageUrls);

    return {
      id: deck.id,
      name: deck.name,
      format: deck.format,
      color: swatchFor(deck.id),
      coverUrl,
      isFavorite: !!deck.is_favorite,
      mainCount,
      extraCount,
      sideCount,
      versionsCount: deckVersions.length,
      archetype,
      winRate,
      daysAgo,
      warning,
    };
  });

  return <DecksListClient decks={items} createDeckAction={createNewDeck} />;
}
