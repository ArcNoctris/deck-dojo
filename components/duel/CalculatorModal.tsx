'use client';

import React, { useState, useEffect } from 'react';
import { useDuelStore } from '@/store/duel-store';
import { Calculator, X, Minus, Plus, Delete } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CalculatorModal = () => {
    const { isCalculatorOpen, selectedPlayer, closeCalculator, adjustLp, halveLp, lp1, lp2 } = useDuelStore();
    const [inputValue, setInputValue] = useState('');
    const [operation, setOperation] = useState<'-' | '+' | null>('-');

    const currentLp = selectedPlayer === 1 ? lp1 : lp2;

    // Reset when opened
    useEffect(() => {
        if (isCalculatorOpen) {
            setInputValue('');
            setOperation('-');
        }
    }, [isCalculatorOpen]);

    if (!isCalculatorOpen) return null;

    const handleNumberClick = (num: string) => {
        if (inputValue.length < 5) {
            setInputValue(prev => prev + num);
        }
    };

    const handleDelete = () => {
        setInputValue(prev => prev.slice(0, -1));
    };

    const handleEnter = () => {
        if (!inputValue || !selectedPlayer) return;
        
        const amount = parseInt(inputValue, 10);
        if (isNaN(amount) || amount === 0) return;

        const finalAmount = operation === '-' ? -amount : amount;
        adjustLp(selectedPlayer, finalAmount, 'Manual adjustment');
    };

    const handlePreset = (val: number) => {
        if (!selectedPlayer) return;
        const finalAmount = operation === '-' ? -val : val;
        adjustLp(selectedPlayer, finalAmount, 'Preset action');
    };

    const handleHalve = () => {
        if (selectedPlayer) halveLp(selectedPlayer);
    };

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center"
            >
                <motion.div 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="w-full max-w-md bg-navy-900 border-t sm:border border-cyan-500/30 rounded-t-3xl sm:rounded-2xl p-6 shadow-[0_-10px_40px_rgba(8,217,214,0.15)] sm:shadow-[0_0_40px_rgba(8,217,214,0.15)]"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="font-heading text-xl text-cyan-500 tracking-widest uppercase glow-text-sm">
                                PLAYER {selectedPlayer}
                            </h2>
                            <p className="font-mono text-gray-400 text-sm">CURRENT: {currentLp}</p>
                        </div>
                        <button onClick={closeCalculator} className="p-2 text-gray-500 hover:text-white rounded-full hover:bg-navy-800 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Display Screen */}
                    <div className="bg-navy-950 border border-navy-800 rounded-xl p-4 mb-6 flex items-center justify-between shadow-inner">
                        <button 
                            onClick={() => setOperation(operation === '-' ? '+' : '-')}
                            className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 text-2xl font-bold transition-all ${
                                operation === '-' 
                                    ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(255,0,0,0.3)]' 
                                    : 'bg-green-500/20 border-green-500 text-green-500 shadow-[0_0_15px_rgba(0,255,0,0.3)]'
                            }`}
                        >
                            {operation === '-' ? <Minus /> : <Plus />}
                        </button>
                        
                        <div className="font-heading text-5xl tracking-wider text-white text-right flex-1 select-none overflow-hidden">
                            {inputValue || '0'}
                        </div>
                    </div>

                    {/* Presets */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                        <PresetBtn onClick={() => handlePreset(1000)}>1000</PresetBtn>
                        <PresetBtn onClick={() => handlePreset(500)}>500</PresetBtn>
                        <PresetBtn onClick={() => handlePreset(100)}>100</PresetBtn>
                        <button onClick={handleHalve} className="bg-purple-500/20 border border-purple-500 text-purple-400 font-mono text-sm rounded-lg py-2 hover:bg-purple-500 hover:text-white transition-all">
                            1/2
                        </button>
                    </div>

                    {/* Numpad */}
                    <div className="grid grid-cols-3 gap-3">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                            <NumBtn key={num} onClick={() => handleNumberClick(num)}>{num}</NumBtn>
                        ))}
                        <NumBtn onClick={() => handleNumberClick('0')}>0</NumBtn>
                        <NumBtn onClick={() => handleNumberClick('00')}>00</NumBtn>
                        <button 
                            onClick={handleDelete}
                            className="bg-navy-800 border border-navy-700 rounded-xl flex items-center justify-center text-gray-400 hover:bg-navy-700 hover:text-white transition-colors active:scale-95 py-4"
                        >
                            <Delete className="w-6 h-6" />
                        </button>
                    </div>

                    <button 
                        onClick={handleEnter}
                        className="w-full mt-6 bg-cyan-500 hover:bg-cyan-400 text-black font-heading font-bold text-2xl py-4 rounded-xl shadow-[0_0_20px_rgba(8,217,214,0.4)] transition-all active:scale-95 tracking-widest"
                    >
                        ENTER
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const PresetBtn = ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className="bg-navy-800 border border-navy-700 text-gray-300 font-mono text-sm rounded-lg py-2 hover:border-cyan-500 hover:text-cyan-400 transition-colors active:bg-cyan-500/20"
    >
        {children}
    </button>
);

const NumBtn = ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className="bg-navy-800 border border-navy-700 rounded-xl text-3xl font-heading text-white py-4 hover:bg-navy-700 hover:border-cyan-500/50 transition-colors active:scale-95"
    >
        {children}
    </button>
);