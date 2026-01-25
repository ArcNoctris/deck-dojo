import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { createNewDeck } from './actions';
import { DeckSummaryCard } from '@/components/dashboard/DeckSummaryCard';
import { Button } from '@/components/ui/Button';
import { Plus, Scroll } from 'lucide-react';
import { Deck } from '@/types/database.types';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: decks, error } = await supabase
    .from('decks')
    .select('*, cover_card:cards!decks_cover_card_id_fkey(image_url, image_url_small)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching decks:', error);
  }

  return (
    <div className="min-h-screen bg-navy-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="font-heading text-4xl text-white font-bold tracking-wider glow-text-sm">
                MY SCROLLS
            </h1>
            <p className="font-mono text-cyan-500 text-sm mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Tactical Decks: {decks?.length || 0}
            </p>
          </div>
          
          <form action={createNewDeck}>
            <Button variant="primary" className="flex items-center gap-2 shadow-[0_0_15px_rgba(8,217,214,0.3)] hover:shadow-[0_0_25px_rgba(8,217,214,0.5)] transition-shadow">
                <Plus className="w-5 h-5" />
                FORGE NEW DECK
            </Button>
          </form>
        </header>

        {(!decks || decks.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-navy-800 rounded-lg bg-navy-800/20 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 rounded-full bg-navy-800/50 flex items-center justify-center mb-6 shadow-inner">
                <Scroll className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="font-heading text-2xl text-gray-500 uppercase tracking-widest mb-2">
                ARCHIVE EMPTY
            </h3>
            <p className="font-mono text-gray-500 text-sm mb-8">
                No scrolls found in your arsenal.
            </p>
            <form action={createNewDeck}>
                <Button variant="ghost" className="border-cyan-500/50 text-cyan-500 hover:bg-cyan-500/10 hover:border-cyan-500 hover:glow-cyan">
                    Initiate First Protocol
                </Button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {decks.map((deck) => (
                <DeckSummaryCard key={deck.id} deck={deck as Deck} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
