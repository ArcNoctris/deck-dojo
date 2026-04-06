'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface MatchData {
  deck_id: string; // Added for revalidation
  deck_version_id: string;
  opponent_deck: string;
  result: 'win' | 'loss' | 'draw';
  going_first: boolean;
  notes?: string;
}

export async function logMatch(data: MatchData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('matches')
    .insert({
      user_id: user.id,
      deck_version_id: data.deck_version_id,
      opponent_deck: data.opponent_deck,
      result: data.result,
      going_first: data.going_first,
      notes: data.notes
    });

  if (error) {
    console.error('Error logging match:', error);
    throw new Error('Failed to log match');
  }

  revalidatePath(`/deck/${data.deck_id}`);
  return { success: true };
}

export async function getMatchHistory(deckId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Join matches with deck_versions to filter by deck_id
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      deck_version:deck_versions!inner(deck_id, name)
    `)
    .eq('deck_version.deck_id', deckId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching match history:', error);
    return [];
  }

  return data;
}

export async function getMetaReport() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('matches')
    .select('opponent_deck, result');

  if (error || !data) {
    console.error('Error fetching meta report:', error);
    return [];
  }

  const stats: Record<string, { total: number, wins: number }> = {};
  
  data.forEach(match => {
    const deck = match.opponent_deck || 'Unknown';
    if (!stats[deck]) stats[deck] = { total: 0, wins: 0 };
    stats[deck].total++;
    // We are looking at "how many times did our users beat this deck"
    // So 'win' means the user won against it, so the meta-deck lost.
    // If we want the meta deck's win rate, we count 'loss'.
    if (match.result === 'loss') stats[deck].wins++;
  });

  return Object.entries(stats)
    .map(([deck, d]) => ({
      deck,
      total: d.total,
      // Win rate of the opponent deck against the users
      winRate: Number(((d.wins / d.total) * 100).toFixed(1))
    }))
    .sort((a, b) => b.total - a.total);
}


