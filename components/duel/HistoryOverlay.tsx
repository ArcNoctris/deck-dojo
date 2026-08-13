'use client';

import { X } from 'lucide-react';
import { useDuelStore } from '@/store/duel-store';
import { CombatLog } from './CombatLog';

interface HistoryOverlayProps {
  open: boolean;
  onClose: () => void;
}

export const HistoryOverlay = ({ open, onClose }: HistoryOverlayProps) => {
  const { logs, undoLast } = useDuelStore();

  if (!open) return null;

  return (
    <div className="absolute inset-0 bg-[var(--color-arcade-surface)] z-40 flex flex-col">
      <div className="flex-none px-4 pt-4 flex items-center justify-between">
        <span className="font-mono font-bold text-xs tracking-wide text-[var(--color-arcade-text-muted)]">HISTORY</span>
        <button
          onClick={onClose}
          className="w-7 h-7 bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg grid place-items-center"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-hidden mt-2">
        <CombatLog />
      </div>
      <button
        onClick={undoLast}
        disabled={logs.length === 0}
        className="flex-none mx-4 mb-4.5 h-12 bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg flex items-center justify-center font-heading font-bold text-[13px] tracking-wide text-[var(--color-arcade-text-muted)] disabled:opacity-35"
      >
        UNDO LAST STEP
      </button>
    </div>
  );
};
