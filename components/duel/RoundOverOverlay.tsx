'use client';

import { useDuelStore } from '@/store/duel-store';

export const RoundOverOverlay = () => {
  const { roundOver, round, wins, nextRound, newMatch } = useDuelStore();

  if (roundOver === null) return null;

  const winnerLabel = roundOver === 1 ? `YOU WIN GAME ${round}` : `OPPONENT WINS GAME ${round}`;

  return (
    <div className="absolute inset-0 bg-black/92 z-40 flex flex-col items-center justify-center gap-[18px] px-6">
      <div
        className="font-pixel text-[11px] text-center leading-loose"
        style={{ color: 'var(--color-arcade-amber)' }}
      >
        {winnerLabel}
      </div>
      <div className="flex gap-4 font-heading font-bold text-[13px] text-[var(--color-arcade-text-muted)]">
        WINS · {wins[0]} — {wins[1]}
      </div>
      <div className="flex gap-2.5">
        <button
          onClick={nextRound}
          className="px-5 py-3.5 bg-[var(--color-arcade-cyan)] clip-notch-sm font-heading font-bold text-[13px] text-[var(--color-arcade-bg)]"
        >
          NEXT ROUND
        </button>
        <button
          onClick={() => window.confirm('Start a new match? This resets the win count.') && newMatch()}
          className="px-5 py-3.5 border border-[var(--color-arcade-border)] rounded-lg font-heading font-bold text-[13px] text-[var(--color-arcade-text)]"
        >
          NEW MATCH
        </button>
      </div>
    </div>
  );
};
