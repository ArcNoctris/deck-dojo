'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useDuelStore } from '@/store/duel-store';

type RollType = 'coin' | 'd6' | '2d6' | 'd20';

const ROLL_LABELS: Record<RollType, string> = {
  coin: 'COIN',
  d6: 'D6',
  '2d6': '2D6',
  d20: 'D20',
};

function rollValueFor(type: RollType) {
  if (type === 'coin') return Math.random() < 0.5 ? 'HEADS' : 'TAILS';
  if (type === 'd6') return 1 + Math.floor(Math.random() * 6);
  if (type === '2d6') return 2 + Math.floor(Math.random() * 11);
  return 1 + Math.floor(Math.random() * 20);
}

interface RollPopupProps {
  open: boolean;
  onClose: () => void;
}

export const RollPopup = ({ open, onClose }: RollPopupProps) => {
  const { addLog } = useDuelStore();
  const [activeType, setActiveType] = useState<RollType | null>(null);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<string | number | null>(null);

  const roll = (type: RollType) => {
    onClose();
    setActiveType(type);
    setRolling(true);
    setResult(null);

    const duration = type === 'coin' ? 1500 : 1000;
    setTimeout(() => {
      const finalValue = rollValueFor(type);
      setResult(finalValue);
      setRolling(false);
      addLog(`${ROLL_LABELS[type]} rolled: ${finalValue}`, 'rng');
      setTimeout(() => {
        setActiveType(null);
        setResult(null);
      }, 1600);
    }, duration);
  };

  return (
    <>
      {activeType && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          {activeType === 'coin' ? (
            <div
              className="w-20 h-20 rounded-full border-2 flex items-center justify-center bg-[var(--color-arcade-panel)] transition-[border-color,box-shadow]"
              style={{
                borderColor: rolling ? 'var(--color-arcade-amber)' : 'var(--color-arcade-border)',
                boxShadow: rolling ? '0 0 20px rgba(255,197,61,.5)' : undefined,
              }}
            >
              <AnimatePresence mode="wait">
                {rolling ? (
                  <motion.div
                    key="flip"
                    animate={{ rotateY: 1800, scale: [1, 1.5, 1] }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    className="w-14 h-14 rounded-full border-4 flex items-center justify-center"
                    style={{ background: 'var(--color-arcade-amber)', borderColor: '#B8860B' }}
                  >
                    <span className="text-black font-bold font-heading text-[10px]">FLIP</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ scale: 0, rotateY: -180 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-16 h-16 rounded-full border-4 flex items-center justify-center"
                    style={{ background: 'var(--color-arcade-amber)', borderColor: '#B8860B' }}
                  >
                    <span className="text-black font-bold font-heading text-sm uppercase tracking-widest">
                      {result === 'HEADS' ? 'H' : 'T'}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div
              className="w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-1 bg-[var(--color-arcade-panel)] transition-[border-color,box-shadow]"
              style={{
                borderColor: rolling ? 'var(--color-arcade-cyan)' : 'var(--color-arcade-border)',
                boxShadow: rolling ? '0 0 20px rgba(25,211,206,.5)' : undefined,
              }}
            >
              <span className="font-mono font-semibold text-[8px] text-[var(--color-arcade-text-muted)]">
                {ROLL_LABELS[activeType]}
              </span>
              <AnimatePresence mode="wait">
                {rolling ? (
                  <motion.div
                    key="spin"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.5, ease: 'linear' }}
                    className="text-[var(--color-arcade-cyan)]"
                  >
                    <RotateCcw className="w-7 h-7" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="font-heading font-bold text-3xl text-[var(--color-arcade-text)]"
                  >
                    {result}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 bg-black/85 z-40 flex items-center justify-center"
          onClick={onClose}
        >
          <div
            className="bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-xl p-4 flex flex-col gap-2 w-[200px]"
            onClick={e => e.stopPropagation()}
          >
            {(['coin', 'd6', '2d6', 'd20'] as RollType[]).map(type => (
              <button
                key={type}
                onClick={() => roll(type)}
                className="h-[42px] bg-[var(--color-arcade-surface)] border border-[var(--color-arcade-border)] rounded-lg font-heading font-bold text-[13px] text-[var(--color-arcade-text)]"
              >
                {type === 'coin' ? 'COIN FLIP' : type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
