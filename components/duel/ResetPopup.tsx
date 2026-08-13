'use client';

import { useDuelStore } from '@/store/duel-store';

interface ResetPopupProps {
  open: boolean;
  onClose: () => void;
}

export const ResetPopup = ({ open, onClose }: ResetPopupProps) => {
  const { logs, setTimer, toggleTimer, timerRunning, undoLast, newMatch, addLog } = useDuelStore();

  if (!open) return null;

  const handleResetTimer = () => {
    setTimer(50 * 60);
    if (timerRunning) toggleTimer();
    addLog('Timer reset to 50:00.', 'system');
    onClose();
  };

  const handleRevert = () => {
    if (logs.length === 0) return;
    undoLast();
    onClose();
  };

  const handleResetMatch = () => {
    if (!window.confirm('Reset LP, round, and win count for this match?')) return;
    newMatch();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-40 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-xl p-4 flex flex-col gap-2 w-[210px]"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={handleResetTimer}
          className="h-[42px] bg-[var(--color-arcade-surface)] border border-[var(--color-arcade-border)] rounded-lg font-heading font-bold text-xs tracking-wide text-[var(--color-arcade-text)]"
        >
          RESET TIMER
        </button>
        <button
          onClick={handleRevert}
          disabled={logs.length === 0}
          className="h-[42px] bg-[var(--color-arcade-surface)] border border-[var(--color-arcade-border)] rounded-lg font-heading font-bold text-xs tracking-wide text-[var(--color-arcade-text)] disabled:opacity-35"
        >
          REVERT LAST STEP
        </button>
        <button
          onClick={handleResetMatch}
          className="h-[42px] bg-[var(--color-arcade-surface)] border border-[var(--color-arcade-red)] rounded-lg font-heading font-bold text-xs tracking-wide text-[var(--color-arcade-red)]"
        >
          RESET MATCH
        </button>
      </div>
    </div>
  );
};
