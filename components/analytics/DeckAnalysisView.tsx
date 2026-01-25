'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useBuilderStore } from '@/store/builder-store';
import { getDeckVersions, getDeckCards } from '@/app/deck/[id]/actions';
import { VersionTrendChart } from './VersionTrendChart';
import { AverageHandBreakdown } from './AverageHandBreakdown';
import { DeckStats } from '@/components/simulation/DeckStats';
import { calculateProbability } from '@/utils/math/hypergeometric';
import { DeckCard, UserTag } from '@/types/deck';
import { Loader2 } from 'lucide-react';

interface DeckAnalysisViewProps {
  deckId?: string;
}

export const DeckAnalysisView = ({ deckId }: DeckAnalysisViewProps) => {
  const { mainDeck } = useBuilderStore();
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Calculate Current Stats
  const currentStats = useMemo(() => {
      // Reuse DeckStats logic or just render DeckStats component?
      // The prompt says: "Top: Current Version Audit (Big Stat Cards + Coach Advice)"
      // DeckStats component already does exactly this.
      return {}; 
  }, [mainDeck]);

  useEffect(() => {
    if (!deckId) return;

    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
            // 1. Get Versions (limit 5 for performance)
            const versions = await getDeckVersions(deckId);
            const recentVersions = versions.slice(0, 5); // Newest first

            // 2. Fetch cards for each and calculate stats
            const history = await Promise.all(recentVersions.map(async (v) => {
                const result = await getDeckCards(deckId, v.id);
                // result is { versionId, cards }
                const cards = Array.isArray(result) ? [] : result.cards; // Handle legacy return type just in case
                
                // Calculate Stats
                const deckSize = cards.length;
                // Filter by card_id/tags. 
                // Wait, result.cards has user_tag.
                const starters = cards.filter((c: any) => c.user_tag === 'starter').length;
                const bricks = cards.filter((c: any) => c.user_tag === 'brick').length;
                
                // Probabilities
                const starterProb = calculateProbability(deckSize, starters, 5, 1);
                const brickProb = calculateProbability(deckSize, bricks, 5, 1);

                return {
                    versionName: v.name,
                    starterProb,
                    brickProb,
                    date: v.created_at
                };
            }));

            setHistoryData(history);
        } catch (error) {
            console.error('Failed to load analysis history', error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    fetchHistory();
  }, [deckId]);

  return (
    <div className="space-y-8 pb-8">
        {/* Top: Current Version Audit */}
        <div>
            <h3 className="font-heading text-xl text-cyan-500 mb-6 flex items-center gap-2">
                CURRENT AUDIT
            </h3>
            <DeckStats />
        </div>

        {/* Middle: Average Hand */}
        <AverageHandBreakdown deck={mainDeck} />

        {/* Bottom: Evolution */}
        {deckId && (
            <div>
                <h3 className="font-heading text-xl text-cyan-500 mb-6 flex items-center gap-2">
                    META EVOLUTION
                </h3>
                {isLoadingHistory ? (
                    <div className="h-80 flex items-center justify-center border border-navy-800 rounded-lg bg-navy-800/20">
                        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                    </div>
                ) : (
                    <VersionTrendChart data={historyData} />
                )}
            </div>
        )}
    </div>
  );
};
