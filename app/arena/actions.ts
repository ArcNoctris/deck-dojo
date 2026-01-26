'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface MatchData {
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
