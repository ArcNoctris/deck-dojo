import { DeckGrid } from '@/components/builder/DeckGrid';
import { CardDrawer } from '@/components/builder/CardDrawer';
import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';

interface DeckPageProps {
  params: Promise<{ id: string }>;
}

export default async function DeckBuilderPage({ params }: DeckPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch Deck Metadata
  const { data: deck, error } = await supabase
    .from('decks')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !deck) {
    console.error('Deck fetch error:', error);
    notFound();
  }

  if (deck.user_id !== user.id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col overflow-hidden fixed inset-0">
      {/* Fixed Header */}
      <header className="border-b border-navy-800 bg-navy-900/95 backdrop-blur-sm z-30 shrink-0">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div>
                <h1 className="font-heading text-2xl text-cyan-500 tracking-wider font-bold glow-text-sm uppercase">
                    {deck.name}
                </h1>
                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                    {deck.format || 'UNKNOWN'} OPERATION
                </span>
            </div>
            
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="font-mono text-xs text-gray-500">ONLINE</span>
            </div>
        </div>
      </header>

      {/* Scrollable Workspace */}
      <main className="flex-1 overflow-hidden relative w-full">
        <DeckGrid />
      </main>

      {/* Floating Action Button & Drawer */}
      <CardDrawer />
    </div>
  );
}
