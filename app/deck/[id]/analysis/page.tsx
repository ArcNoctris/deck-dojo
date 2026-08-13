import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getDeckCards } from '../actions';
import { calculateProbability } from '@/utils/math/hypergeometric';
import { computeDominantArchetypeSynergy } from '@/utils/decks/synergy';

interface AnalysisPageProps {
  params: Promise<{ id: string }>;
}

const TYPE_COLORS: Record<string, string> = {
  Monster: 'var(--color-arcade-amber)',
  Spell: 'var(--color-arcade-green)',
  Trap: 'var(--color-arcade-magenta)',
};

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: deck } = await supabase.from('decks').select('*').eq('id', id).single();
  if (!deck || deck.user_id !== user.id) notFound();

  const result = await getDeckCards(id);
  const cards = Array.isArray(result) ? [] : result.cards;
  const mainCards = cards
    .filter((c) => c.location === 'main')
    .map((c) => ({ ...c, card: Array.isArray(c.card) ? c.card[0] : c.card }));

  const mainTotal = mainCards.reduce((sum, c) => sum + (c.quantity || 0), 0);

  const typeCounts: Record<string, number> = { Monster: 0, Spell: 0, Trap: 0 };
  mainCards.forEach((c) => {
    const t = c.card?.type || '';
    if (t.includes('Monster')) typeCounts.Monster += c.quantity;
    else if (t.includes('Spell')) typeCounts.Spell += c.quantity;
    else if (t.includes('Trap')) typeCounts.Trap += c.quantity;
  });
  const typeBreakdown = (['Monster', 'Spell', 'Trap'] as const).map((label) => ({
    label,
    count: typeCounts[label],
    pct: mainTotal > 0 ? Math.round((typeCounts[label] / mainTotal) * 100) : 0,
    color: TYPE_COLORS[label],
  }));

  const keyCards = [...mainCards]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 3)
    .map((c) => ({
      name: c.card?.name || 'Unknown card',
      pct: mainTotal > 0 ? calculateProbability(mainTotal, c.quantity, 5, 1) : 0,
    }));

  const archetypeFlat = mainCards.flatMap((c) => Array(c.quantity).fill({ archetype: c.card?.archetype ?? null }));
  const { archetype, score: synergyScore } = computeDominantArchetypeSynergy(archetypeFlat);
  const synergyLabel = synergyScore >= 70 ? 'Strong core' : synergyScore >= 40 ? 'Developing' : 'Scattered';

  return (
    <div className="min-h-screen bg-[var(--color-arcade-surface)] text-[var(--color-arcade-text)] flex flex-col">
      <div className="flex-none px-4 py-4 flex items-center gap-2.5 border-b border-[var(--color-arcade-border)]">
        <Link
          href={`/deck/${id}`}
          className="w-7 h-7 bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg grid place-items-center flex-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
        <span className="font-heading font-bold text-[15px] tracking-wide uppercase truncate">{deck.name} · Analysis</span>
      </div>

      <div className="flex-1 overflow-y-auto thin-scroll px-4 py-5 flex flex-col gap-5">
        {mainTotal === 0 ? (
          <div className="text-center text-[var(--color-arcade-text-muted)] font-mono text-sm py-16">
            Add cards to your main deck to see analysis.
          </div>
        ) : (
          <>
            <section>
              <span className="font-mono font-bold text-[10px] tracking-widest text-[var(--color-arcade-cyan)]">CARD TYPE BREAKDOWN</span>
              <div className="flex flex-col gap-2 mt-2">
                {typeBreakdown.map((t) => (
                  <div key={t.label}>
                    <div className="flex justify-between font-mono font-semibold text-[10.5px] text-[var(--color-arcade-text-muted)] mb-1">
                      <span>{t.label.toUpperCase()}</span>
                      <span>{t.count}</span>
                    </div>
                    <div className="h-[7px] bg-[var(--color-arcade-inset)] rounded-full overflow-hidden">
                      <div className="h-full" style={{ width: `${t.pct}%`, background: t.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {keyCards.length > 0 && (
              <section>
                <span className="font-mono font-bold text-[10px] tracking-widest text-[var(--color-arcade-cyan)]">OPENING-HAND ODDS (5 cards)</span>
                <div className="flex flex-col gap-2 mt-2">
                  {keyCards.map((k) => (
                    <div key={k.name} className="flex items-center justify-between bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg px-3 py-2.5">
                      <span className="font-heading font-semibold text-[13px] text-[var(--color-arcade-text)] truncate mr-2">{k.name}</span>
                      <span className="font-heading font-bold text-sm text-[var(--color-arcade-cyan)] flex-none">{k.pct}%</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <span className="font-mono font-bold text-[10px] tracking-widest text-[var(--color-arcade-cyan)]">ARCHETYPE SYNERGY</span>
              <div className="bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg p-3.5 mt-2 flex items-center gap-3.5">
                <div className="font-heading font-bold text-3xl text-[var(--color-arcade-text)]">{synergyScore}</div>
                <div>
                  <div className="font-heading font-bold text-xs text-[var(--color-arcade-cyan)]">{synergyLabel}</div>
                  <div className="font-mono font-semibold text-[9.5px] text-[var(--color-arcade-text-muted)] mt-0.5">
                    {archetype ? `Share of ${archetype} cards in the main deck` : 'No dominant archetype detected'}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        <Link
          href={`/deck/${id}`}
          className="h-11 border border-[var(--color-arcade-border)] rounded-lg grid place-items-center font-heading font-bold text-xs tracking-wide text-[var(--color-arcade-text-muted)]"
        >
          EDIT DECK
        </Link>
      </div>
    </div>
  );
}
