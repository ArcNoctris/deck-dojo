import { createClient } from '@/utils/supabase/server';

export interface RecentPerformance {
  winRateLast20: number | null;
  currentWinStreak: number;
}

/**
 * Aggregates across all of a user's matches (any deck/version), most recent first.
 * Used by the Home Hub — per-deck win rate lives in the Arena dashboard instead.
 */
export async function getRecentPerformance(userId: string): Promise<RecentPerformance> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('matches')
    .select('result, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !data || data.length === 0) {
    return { winRateLast20: null, currentWinStreak: 0 };
  }

  const wins = data.filter(m => m.result === 'win').length;
  const winRateLast20 = Math.round((wins / data.length) * 100);

  let currentWinStreak = 0;
  for (const match of data) {
    if (match.result === 'win') currentWinStreak++;
    else break;
  }

  return { winRateLast20, currentWinStreak };
}
