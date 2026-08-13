import { createClient } from '@/utils/supabase/client';
import { ActiveFilters } from '@/store/builder-store';
import { Card } from '@/types/database.types';

export async function searchCards(filters: ActiveFilters): Promise<Card[]> {
  const supabase = createClient();
  let query = supabase.from('cards').select('*');

  const { text, cardTypes, attributes, races, levels, archetypes, extraKinds, spellSubtypes, trapSubtypes } = filters;

  // 1. Text Search (Name)
  if (text && text.trim().length > 0) {
    query = query.ilike('name', `%${text.trim()}%`);
  }

  // 2. Card Type (Monster / Spell / Trap) — OR'd together, `type` holds strings like "Normal Monster", "Spell Card".
  if (cardTypes.length > 0) {
    query = query.or(cardTypes.map((t) => `type.ilike.%${t}%`).join(','));
  }

  // 3. Extra Deck kind (Fusion / Synchro / XYZ / Link) — also matched against `type`.
  if (extraKinds.length > 0) {
    query = query.or(extraKinds.map((k) => `type.ilike.%${k}%`).join(','));
  }

  // 4. Attributes
  if (attributes.length > 0) {
    query = query.in('attribute', attributes);
  }

  // 5. Race / Property — monster Type, Spell Property, and Trap Property all share
  // the same `race` column in this schema (matches the YGOProDeck source data).
  const raceValues = [...races, ...spellSubtypes, ...trapSubtypes];
  if (raceValues.length > 0) {
    query = query.in('race', raceValues);
  }

  // 6. Archetype
  if (archetypes.length > 0) {
    query = query.in('archetype', archetypes);
  }

  // 7. Level / Rank / Link Rating
  // Filtering only the `level` column is a known simplification (Pendulum scale and
  // Link rating live in separate columns) — kept consistent with the rest of the app.
  if (levels.length > 0) {
    query = query.in('level', levels);
  }

  query = query.limit(100);
  query = query.order('name', { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error('Error searching cards:', error);
    throw error;
  }

  return data || [];
}
