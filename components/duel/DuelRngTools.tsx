'use client';

import React, { useState } from 'react';
import { useDuelStore } from '@/store/duel-store';
import { Dice1, CircleDot, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DiceTool = () => {
    const { addLog } = useDuelStore();
    const [isRolling, setIsRolling] = useState(false);
    const [diceResult, setDiceResult] = useState<number | null>(null);

    const rollDice = () => {
        setIsRolling(true);
        setDiceResult(null);
        setTimeout(() => {
            const res = Math.floor(Math.random() * 6) + 1;
            setDiceResult(res);
            setIsRolling(false);
            addLog(`Dice Rolled: ${res}`, 'rng');
        }, 1000); // 1s animation
    };

    return (
        <div className="relative shadow-[0_0_20px_rgba(0,0,0,0.5)] rounded-xl bg-navy-900 pointer-events-auto">
            <button
                onClick={rollDice}
                disabled={isRolling}
                className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all bg-navy-800 ${
                    isRolling ? 'border-cyan-500 shadow-[0_0_20px_rgba(8,217,214,0.5)]' : 'border-navy-700 hover:border-cyan-500/50 hover:bg-navy-700'
                }`}
            >
                <AnimatePresence mode="wait">
                    {isRolling ? (
                        <motion.div
                            key="rolling"
                            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
                            className="text-cyan-500"
                        >
                            <RotateCcw className="w-8 h-8" />
                        </motion.div>
                    ) : diceResult ? (
                        <motion.div
                            key="result"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="font-heading font-bold text-3xl text-focus-amber tracking-wider"
                        >
                            {diceResult}
                        </motion.div>
                    ) : (
                        <motion.div key="idle" className="text-gray-400">
                            <Dice1 className="w-8 h-8" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>
        </div>
    );
};

export const CoinTool = () => {
    const { addLog } = useDuelStore();
    const [isFlipping, setIsFlipping] = useState(false);
    const [coinResult, setCoinResult] = useState<'HEADS' | 'TAILS' | null>(null);

    const flipCoin = () => {
        setIsFlipping(true);
        setCoinResult(null);
        setTimeout(() => {
            const res = Math.random() > 0.5 ? 'HEADS' : 'TAILS';
            setCoinResult(res);
            setIsFlipping(false);
            addLog(`Coin Flipped: ${res}`, 'rng');
        }, 1500); // 1.5s animation
    };

    return (
        <div className="relative shadow-[0_0_20px_rgba(0,0,0,0.5)] rounded-full bg-navy-900 pointer-events-auto">
            <button
                onClick={flipCoin}
                disabled={isFlipping}
                className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all bg-navy-800 ${
                    isFlipping ? 'border-focus-amber shadow-[0_0_20px_rgba(249,237,105,0.5)]' : 'border-navy-700 hover:border-focus-amber/50 hover:bg-navy-700'
                }`}
            >
                <AnimatePresence mode="wait">
                    {isFlipping ? (
                        <motion.div
                            key="flipping"
                            animate={{ rotateY: 1800, scale: [1, 1.5, 1] }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="w-12 h-12 rounded-full bg-focus-amber border-4 border-yellow-600 flex items-center justify-center shadow-lg"
                        >
                            <span className="text-black font-bold font-heading text-[10px]">FLIP</span>
                        </motion.div>
                    ) : coinResult ? (
                        <motion.div
                            key="result"
                            initial={{ scale: 0, rotateY: -180 }}
                            animate={{ scale: 1, rotateY: 0 }}
                            transition={{ type: 'spring', damping: 15 }}
                            className="w-14 h-14 rounded-full bg-focus-amber border-4 border-yellow-600 flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
                        >
                            <span className="text-black font-bold font-heading text-xs uppercase tracking-widest">{coinResult === 'HEADS' ? 'H' : 'T'}</span>
                        </motion.div>
                    ) : (
                        <motion.div key="idle" className="text-gray-400">
                            <CircleDot className="w-8 h-8" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>
        </div>
    );
};