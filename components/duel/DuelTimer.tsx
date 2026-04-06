'use client';

import React, { useEffect } from 'react';
import { useDuelStore } from '@/store/duel-store';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export const DuelTimer = () => {
    const { timer, timerRunning, tickTimer, toggleTimer, setTimer, addLog } = useDuelStore();
    
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timerRunning && timer > 0) {
            interval = setInterval(() => {
                tickTimer();
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerRunning, timer, tickTimer]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleReset = () => {
        if (confirm("Reset the 40:00 match timer?")) {
            setTimer(40 * 60);
            if (timerRunning) toggleTimer();
            addLog("Timer reset to 40:00.", "system");
        }
    };

    const isCritical = timer <= 300; // 5 minutes

    return (
        <Popover className="relative z-50">
            <Popover.Button 
                className={`flex items-center justify-center px-6 py-2 bg-navy-950/90 backdrop-blur-md border border-navy-800 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all outline-none hover:border-cyan-500/50 ${isCritical ? 'border-red-500/50 bg-red-950/50 shadow-[0_0_15px_rgba(255,0,0,0.3)]' : ''}`}
            >
                <div className={`font-mono text-3xl md:text-4xl font-bold tracking-widest ${isCritical ? 'text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]' : 'text-white'}`}>
                    {formatTime(timer)}
                </div>
            </Popover.Button>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1 scale-95"
                enterTo="opacity-100 translate-y-0 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0 scale-100"
                leaveTo="opacity-0 translate-y-1 scale-95"
            >
                <Popover.Panel className="absolute left-1/2 -translate-x-1/2 mt-4 w-48 bg-navy-900 border border-cyan-500/30 rounded-2xl p-4 shadow-2xl origin-top flex flex-col items-center">
                    <span className="text-[10px] font-mono text-gray-500 tracking-[0.2em] mb-4">TIMER CONTROLS</span>
                    <div className="flex gap-6">
                        <button 
                            onClick={toggleTimer}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                                timerRunning 
                                    ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 hover:bg-yellow-500 hover:text-black' 
                                    : 'bg-green-500/20 text-green-500 border border-green-500/50 hover:bg-green-500 hover:text-black'
                            }`}
                        >
                            {timerRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                        </button>
                        <button 
                            onClick={handleReset}
                            className="w-14 h-14 rounded-full bg-navy-800 text-gray-400 border border-navy-700 flex items-center justify-center hover:bg-strike-red hover:text-white hover:border-strike-red transition-colors shadow-lg"
                        >
                            <RotateCcw className="w-6 h-6" />
                        </button>
                    </div>
                </Popover.Panel>
            </Transition>
        </Popover>
    );
};