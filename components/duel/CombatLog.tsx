'use client';

import React, { useRef, useEffect } from 'react';
import { useDuelStore } from '@/store/duel-store';
import { ShieldAlert, Dices, Terminal } from 'lucide-react';

export const CombatLog = () => {
    const { logs } = useDuelStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new log
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const formatTime = (ts: number) => {
        const d = new Date(ts);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col h-full bg-navy-950 border-l border-navy-800 shadow-inner w-full lg:w-80">
            <div className="px-4 py-3 border-b border-navy-800 flex items-center justify-between shrink-0">
                <span className="font-heading text-sm text-cyan-500 tracking-widest flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> COMBAT LOG
                </span>
            </div>

            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar flex flex-col-reverse"
            >
                {logs.length === 0 ? (
                    <div className="text-center text-gray-600 font-mono text-[10px] mt-10">AWAITING ENGAGEMENT...</div>
                ) : (
                    logs.map((log) => {
                        const isRng = log.type === 'rng';
                        const isSystem = log.type === 'system';
                        
                        let Icon = ShieldAlert;
                        let colorClass = 'text-cyan-400';
                        let bgClass = 'bg-cyan-500/10 border-cyan-500/20';

                        if (isRng) {
                            Icon = Dices;
                            colorClass = 'text-focus-amber';
                            bgClass = 'bg-focus-amber/10 border-focus-amber/20';
                        } else if (isSystem) {
                            Icon = Terminal;
                            colorClass = 'text-gray-400';
                            bgClass = 'bg-navy-800 border-navy-700';
                        } else if (log.message.includes('-')) {
                            colorClass = 'text-strike-red';
                            bgClass = 'bg-strike-red/10 border-strike-red/20';
                        } else if (log.message.includes('+')) {
                            colorClass = 'text-green-500';
                            bgClass = 'bg-green-500/10 border-green-500/20';
                        }

                        return (
                            <div key={log.id} className={`p-3 rounded-lg border flex gap-3 items-start animate-in fade-in slide-in-from-right-4 duration-300 ${bgClass}`}>
                                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${colorClass}`} />
                                <div className="flex-1">
                                    <div className="text-xs font-mono text-gray-500 mb-1">{formatTime(log.timestamp)}</div>
                                    <div className={`text-sm font-mono leading-relaxed ${colorClass}`}>
                                        {log.message}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};