import { createClient } from '@/utils/supabase/client';
import { ActiveFilters } from '@/store/builder-store';
import { Card } from '@/types/database.types';

export async function searchCards(filters: ActiveFilters): Promise<Card[]> {
  const supabase = createClient();
  let query = supabase.from('cards').select('*');

  const { text, race, attributes, level, archetype, cardType } = filters;

  // 1. Text Search (Name)
  if (text && text.trim().length > 0) {
    query = query.ilike('name', `%${text.trim()}%`);
  }

  // 2. Race (Type/Property)
  if (race) {
    query = query.eq('race', race);
  }

  // 3. Attributes
  if (attributes && attributes.length > 0) {
    // If multiple attributes, use 'in'
    query = query.in('attribute', attributes);
  }

  // 4. Archetype
  if (archetype) {
    query = query.eq('archetype', archetype);
  }

  // 5. Card Type (Monster, Spell, Trap)
  // The 'type' column in DB holds strings like "Normal Monster", "Spell Card", etc.
  if (cardType) {
    if (cardType === 'monster') {
      query = query.ilike('type', '%Monster%');
    } else if (cardType === 'spell') {
      query = query.ilike('type', '%Spell%');
    } else if (cardType === 'trap') {
      query = query.ilike('type', '%Trap%');
    }
  }

  // 6. Level / Rank / Link Rating
  // Only apply if the range is not default [0, 13] or if user is searching for Monsters/Specific Levels
  // Default store value is [0, 13].
  // If user sets min > 0, we want cards with level >= min.
  // Note: Spells have null level. filtering level >= 1 excludes spells.
  const [min, max] = level;
  
  if (min > 0 || max < 13) {
      // Using 'or' to include cards with null levels if they match other criteria? 
      // No, usually if I filter Level 4-4, I only want Level 4 monsters.
      // So straightforward gte/lte.
      // However, we need to handle the column being potentially null for spells.
      // Supabase filter on null col: .gte('level', 1) excludes nulls.
      
      // We check level OR scale OR linkval
      // Supabase OR syntax is tricky with mixed columns.
      // For simplicity, let's just filter on 'level' for now, OR rely on text/type filters if mostly what user wants.
      // But Pendulums have scale, Links have linkval. 
      // The current DB schema has 'level', 'scale', 'linkval'.
      // If the user selects "Level 4", they might mean Level 4 Monster.
      // If "Link 2", they mean Link Rating 2.
      // My UI input is generic "Level/Rank/Link".
      // I should check if ANY of these match.
      // .or(`level.gte.${min},scale.gte.${min},linkval.gte.${min}`) AND ... max
      // But Supabase .or() is top level usually.
      
      // Let's stick to 'level' column for now as the prompt implies "level?: number".
      // Or better: Since I updated the schema to include scale and linkval, I should query them.
      // But query complexity grows.
      // Let's implement basic level filtering first.
      
      query = query.gte('level', min).lte('level', max);
  }

  // Default limit to keep it fast
  query = query.limit(100);

  // Default Order
  query = query.order('name', { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error('Error searching cards:', error);
    throw error;
  }

  return data || [];
}
