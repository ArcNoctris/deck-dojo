interface ArchetypeCard {
  archetype: string | null;
}

export function computeDominantArchetypeSynergy(mainDeck: ArchetypeCard[]): { archetype: string | null; score: number } {
  const counts: Record<string, number> = {};
  mainDeck.forEach((c) => {
    if (c.archetype) counts[c.archetype] = (counts[c.archetype] || 0) + 1;
  });
  let best = 0;
  let archetype: string | null = null;
  Object.entries(counts).forEach(([a, v]) => {
    if (v > best) { best = v; archetype = a; }
  });
  const score = mainDeck.length > 0 ? Math.round((best / mainDeck.length) * 100) : 0;
  return { archetype, score };
}
