import { getMatchHistory } from '@/app/arena/actions';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Trophy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { WinRateChart } from '@/components/arena/WinRateChart';
import { MatchupSpread } from '@/components/arena/MatchupSpread';

export default async function ArenaDashboard({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const deckId = params.id;
  const matchHistory = await getMatchHistory(deckId);

  // Check if we actually have a deck
  const { data: deck } = await supabase.from('decks').select('name').eq('id', deckId).single();
  if (!deck) {
    return <div>Deck not found</div>;
  }

  // Calculate Aggregates
  const totalMatches = matchHistory.length;
  const wins = matchHistory.filter(m => m.result === 'win').length;
  const losses = matchHistory.filter(m => m.result === 'loss').length;
  const draws = matchHistory.filter(m => m.result === 'draw').length;
  const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : '0.0';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href={`/deck/${deckId}`} className="text-cyan-500 hover:text-cyan-400 flex items-center gap-2 mb-2 font-mono text-sm">
            <ArrowLeft className="w-4 h-4" /> RETURN TO ARMORY
          </Link>
          <h1 className="text-4xl font-heading font-bold flex items-center gap-3">
            <Trophy className="w-8 h-8 text-focus-amber" />
            ARENA DASHBOARD: {deck.name}
          </h1>
        </div>
        <div className="bg-navy-800 p-4 rounded-xl border border-navy-700 text-center min-w-[120px]">
          <div className="text-xs font-mono text-gray-500 mb-1">WIN RATE</div>
          <div className="text-3xl font-heading font-bold text-focus-amber">{winRate}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Charts */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-navy-900 border border-navy-800 rounded-xl p-6">
            <h2 className="font-heading text-xl mb-6">PERFORMANCE OVER TIME</h2>
            {totalMatches > 0 ? (
              <WinRateChart matches={matchHistory} />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500 font-mono text-sm border border-dashed border-navy-700 rounded">
                NO MATCH DATA LOGGED YET
              </div>
            )}
          </div>

          <div className="bg-navy-900 border border-navy-800 rounded-xl p-6">
            <h2 className="font-heading text-xl mb-6">MATCHUP SPREAD</h2>
            {totalMatches > 0 ? (
              <MatchupSpread matches={matchHistory} />
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500 font-mono text-sm border border-dashed border-navy-700 rounded">
                AWAITING COMBAT DATA
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Match History */}
        <div className="bg-navy-900 border border-navy-800 rounded-xl p-6 h-[800px] flex flex-col">
          <h2 className="font-heading text-xl mb-6 shrink-0">COMBAT LOG</h2>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {matchHistory.length > 0 ? matchHistory.map((match: any) => (
              <div key={match.id} className={`p-3 rounded-lg border-l-4 ${match.result === 'win' ? 'bg-green-500/10 border-green-500' : match.result === 'loss' ? 'bg-red-500/10 border-red-500' : 'bg-gray-500/10 border-gray-500'} relative`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold">{match.opponent_deck || 'Unknown Deck'}</span>
                  <span className={`text-xs font-mono px-2 py-1 rounded ${match.result === 'win' ? 'text-green-500 bg-green-500/20' : match.result === 'loss' ? 'text-red-500 bg-red-500/20' : 'text-gray-400 bg-gray-500/20'}`}>
                    {match.result.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-gray-400 font-mono flex gap-3">
                  <span>{match.going_first ? '1st' : '2nd'}</span>
                  <span>{new Date(match.created_at).toLocaleDateString()}</span>
                  <span>{match.deck_version?.name}</span>
                </div>
                {match.notes && (
                  <div className="mt-2 text-sm text-gray-300 bg-navy-950 p-2 rounded">
                    {match.notes}
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center text-gray-500 font-mono text-sm py-12">
                Log matches to build history.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}