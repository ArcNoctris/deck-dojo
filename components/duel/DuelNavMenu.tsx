'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { useDuelStore } from '@/store/duel-store';

interface DuelNavMenuProps {
  onShare: () => void;
  onLog: () => void;
  onDecks: () => void;
}

export const DuelNavMenu = ({ onShare, onLog, onDecks }: DuelNavMenuProps) => {
  const [open, setOpen] = useState(false);
  const { logs } = useDuelStore();

  const pick = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="absolute bottom-3 right-2.5 w-8 h-8 bg-[var(--color-arcade-panel)]/90 border border-[var(--color-arcade-border)] rounded-lg grid place-items-center z-20"
      >
        <Menu className="w-4 h-4 text-[var(--color-arcade-text-muted)]" />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/85 z-40 flex items-center justify-center" onClick={() => setOpen(false)}>
          <div
            className="bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-xl p-2.5 flex flex-col gap-1.5 w-[200px]"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => pick(onShare)}
              className="h-11 bg-[var(--color-arcade-surface)] border border-[var(--color-arcade-border)] rounded-lg flex items-center px-3.5 font-heading font-bold text-[13px] tracking-wide text-[var(--color-arcade-text)]"
            >
              SHARE / SESSION
            </button>
            <button
              onClick={() => pick(onLog)}
              className="h-11 bg-[var(--color-arcade-surface)] border border-[var(--color-arcade-border)] rounded-lg flex items-center px-3.5 font-heading font-bold text-[13px] tracking-wide text-[var(--color-arcade-text)]"
            >
              LOG · {logs.length}
            </button>
            <button
              onClick={() => pick(onDecks)}
              className="h-11 bg-[var(--color-arcade-surface)] border border-[var(--color-arcade-border)] rounded-lg flex items-center px-3.5 font-heading font-bold text-[13px] tracking-wide text-[var(--color-arcade-text)]"
            >
              DECKS
            </button>
          </div>
        </div>
      )}
    </>
  );
};
