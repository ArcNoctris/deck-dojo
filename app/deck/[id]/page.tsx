import { DeckGrid } from '@/components/builder/DeckGrid';
import { CardDrawer } from '@/components/builder/CardDrawer';
import { DeckManager } from '@/components/builder/DeckManager';
import { DeckHeader } from '@/components/builder/DeckHeader';
import { DeckConsole } from '@/components/builder/DeckConsole';
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
      <DeckManager deckId={id} />
      <DeckHeader deckId={id} name={deck.name} format={deck.format || 'Advanced'} />

      {/* Scrollable Workspace */}
      <main className="flex-1 overflow-hidden relative w-full">
        <DeckGrid />
      </main>

      {/* Floating Action Button & Drawer */}
      <CardDrawer />
      <DeckConsole />
    </div>
  );
}
