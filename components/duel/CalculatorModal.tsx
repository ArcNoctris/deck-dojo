'use client';

import React, { useEffect, useState } from 'react';
import { useDuelStore } from '@/store/duel-store';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PRESETS = [100, 500, 1000, 2000];
const DIGIT_ROWS = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']];

export const CalculatorModal = () => {
    const { isCalculatorOpen, selectedPlayer, closeCalculator, adjustLp, lp1, lp2 } = useDuelStore();
    const [mode, setMode] = useState<'sub' | 'add'>('sub');
    const [pending, setPending] = useState(0);
    const [typingStr, setTypingStr] = useState<string | null>(null);

    const currentLp = selectedPlayer === 1 ? lp1 : lp2;
    const calcName = selectedPlayer === 1 ? 'YOU' : 'OPPONENT';

    useEffect(() => {
        if (isCalculatorOpen) {
            setMode('sub');
            setPending(0);
            setTypingStr(null);
        }
    }, [isCalculatorOpen]);

    if (!isCalculatorOpen) return null;

    const pressDigit = (d: string) => {
        const str = (typingStr || '') + d;
        setTypingStr(str);
        setPending(parseInt(str, 10) || 0);
    };

    const addPreset = (amount: number) => {
        setPending(prev => prev + amount);
        setTypingStr(null);
    };

    const pressHalve = () => {
        setMode('sub');
        setPending(Math.round(currentLp / 2));
        setTypingStr(null);
    };

    const clearPending = () => {
        setPending(0);
        setTypingStr(null);
    };

    const confirmCalc = () => {
        if (!selectedPlayer || pending === 0) {
            closeCalculator();
            return;
        }
        adjustLp(selectedPlayer, mode === 'sub' ? -pending : pending, 'Manual adjustment');
    };

    const signChar = mode === 'sub' ? '−' : '+';
    const result = mode === 'sub' ? Math.max(0, currentLp - pending) : currentLp + pending;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[var(--color-arcade-surface)] z-[100] flex flex-col"
            >
                <div className="flex-none px-4 pt-3.5 flex items-center justify-between">
                    <span className="font-mono font-bold text-xs tracking-wide text-[var(--color-arcade-text-muted)]">{calcName}</span>
                    <button
                        onClick={closeCalculator}
                        className="w-7 h-7 bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg grid place-items-center"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="flex-none flex flex-col items-center pt-2 pb-1">
                    <div className="font-pixel text-[44px] leading-none text-[var(--color-arcade-text)]">{currentLp}</div>
                    <div className="font-heading font-bold text-[17px] text-[var(--color-arcade-text-muted)] mt-1.5">
                        {signChar} {pending} <span>=</span> <span className="text-[var(--color-arcade-cyan)]">{result}</span>
                    </div>
                </div>

                <div className="flex-none px-4 pt-2.5 flex gap-2">
                    <button
                        onClick={() => setMode('sub')}
                        className="flex-1 h-[34px] rounded-lg font-heading font-bold text-[15px]"
                        style={{
                            background: mode === 'sub' ? 'var(--color-arcade-red)' : 'var(--color-arcade-inset)',
                            color: mode === 'sub' ? '#12060A' : 'var(--color-arcade-red)',
                        }}
                    >
                        &minus;
                    </button>
                    <button
                        onClick={() => setMode('add')}
                        className="flex-1 h-[34px] rounded-lg border border-[var(--color-arcade-border)] font-heading font-bold text-[15px]"
                        style={{
                            background: mode === 'add' ? 'var(--color-arcade-green)' : 'var(--color-arcade-inset)',
                            color: mode === 'add' ? '#04180E' : 'var(--color-arcade-green)',
                        }}
                    >
                        +
                    </button>
                </div>

                <div className="flex-none px-4 pt-2.5 grid grid-cols-4 gap-1.5">
                    {PRESETS.map(p => (
                        <button
                            key={p}
                            onClick={() => addPreset(p)}
                            className="h-8 bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-md font-heading font-semibold text-[11px] text-[var(--color-arcade-text-muted)]"
                        >
                            +{p}
                        </button>
                    ))}
                </div>

                <div className="flex-1 px-4 pt-2.5 grid grid-rows-4 gap-1.5">
                    {DIGIT_ROWS.map((row, i) => (
                        <div key={i} className="grid grid-cols-3 gap-1.5">
                            {row.map(d => (
                                <NumBtn key={d} onClick={() => pressDigit(d)}>{d}</NumBtn>
                            ))}
                        </div>
                    ))}
                    <div className="grid grid-cols-3 gap-1.5">
                        <NumBtn onClick={() => pressDigit('00')} small>00</NumBtn>
                        <NumBtn onClick={() => pressDigit('0')}>0</NumBtn>
                        <button
                            onClick={clearPending}
                            className="bg-[var(--color-arcade-inset)] border border-[var(--color-arcade-border)] rounded-lg grid place-items-center font-heading font-bold text-[13px] text-[var(--color-arcade-red)]"
                        >
                            CLR
                        </button>
                    </div>
                </div>

                <div className="flex-none px-4 pt-2.5">
                    <button
                        onClick={pressHalve}
                        className="w-full h-[34px] bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg font-heading font-bold text-xs tracking-wide text-[var(--color-arcade-amber)]"
                    >
                        &frac12; HALVE LP
                    </button>
                </div>

                <div className="flex-none px-4 py-4">
                    <button
                        onClick={confirmCalc}
                        className="w-full h-12 bg-[var(--color-arcade-cyan)] clip-notch grid place-items-center font-pixel text-[11px] text-[var(--color-arcade-bg)]"
                        style={{ boxShadow: '4px 4px 0 #06121A' }}
                    >
                        DONE
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

const NumBtn = ({ children, onClick, small }: { children: React.ReactNode; onClick: () => void; small?: boolean }) => (
    <button
        onClick={onClick}
        className={`bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg grid place-items-center font-heading font-bold text-[var(--color-arcade-text)] active:scale-95 transition-transform ${small ? 'text-[15px]' : 'text-[17px]'}`}
    >
        {children}
    </button>
);
