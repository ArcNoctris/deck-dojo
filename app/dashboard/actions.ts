'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function createNewDeck() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('decks')
    .insert({
      user_id: user.id,
      name: 'New Deck',
      format: 'Advanced',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating deck:', error);
    throw new Error('Failed to create deck');
  }

  redirect(`/deck/${data.id}`);
}
