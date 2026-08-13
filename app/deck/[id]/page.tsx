import { DeckManager } from '@/components/builder/DeckManager';
import { DeckHeader } from '@/components/builder/DeckHeader';
import { BuilderBody } from '@/components/builder/BuilderBody';
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
    <div className="min-h-screen bg-[var(--color-arcade-surface)] text-[var(--color-arcade-text)] flex flex-col overflow-hidden fixed inset-0">
      <DeckManager deckId={id} />
      <DeckHeader deckId={id} name={deck.name} format={deck.format || 'Advanced'} />
      <main className="flex-1 overflow-hidden relative w-full">
        <BuilderBody />
      </main>
    </div>
  );
}
