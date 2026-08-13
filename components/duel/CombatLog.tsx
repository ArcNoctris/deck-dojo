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
        <div className="flex flex-col h-full bg-[var(--color-arcade-surface)] border-l border-[var(--color-arcade-border)] shadow-inner w-full lg:w-80">
            <div className="px-4 py-3 border-b border-[var(--color-arcade-border)] flex items-center justify-between shrink-0">
                <span className="font-heading text-sm text-[var(--color-arcade-cyan)] tracking-widest flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> COMBAT LOG
                </span>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 thin-scroll flex flex-col-reverse"
            >
                {logs.length === 0 ? (
                    <div className="text-center text-[var(--color-arcade-text-muted)] font-mono text-[10px] mt-10">AWAITING ENGAGEMENT...</div>
                ) : (
                    logs.map((log) => {
                        const isRng = log.type === 'rng';
                        const isSystem = log.type === 'system';

                        let Icon = ShieldAlert;
                        let colorClass = 'text-[var(--color-arcade-cyan)]';
                        let bgClass = 'bg-[var(--color-arcade-cyan)]/10 border-[var(--color-arcade-cyan)]/20';

                        if (isRng) {
                            Icon = Dices;
                            colorClass = 'text-[var(--color-arcade-amber)]';
                            bgClass = 'bg-[var(--color-arcade-amber)]/10 border-[var(--color-arcade-amber)]/20';
                        } else if (isSystem) {
                            Icon = Terminal;
                            colorClass = 'text-[var(--color-arcade-text-muted)]';
                            bgClass = 'bg-[var(--color-arcade-panel)] border-[var(--color-arcade-border)]';
                        } else if (log.message.includes('-')) {
                            colorClass = 'text-[var(--color-arcade-red)]';
                            bgClass = 'bg-[var(--color-arcade-red)]/10 border-[var(--color-arcade-red)]/20';
                        } else if (log.message.includes('+')) {
                            colorClass = 'text-[var(--color-arcade-green)]';
                            bgClass = 'bg-[var(--color-arcade-green)]/10 border-[var(--color-arcade-green)]/20';
                        }

                        return (
                            <div key={log.id} className={`p-3 rounded-lg border flex gap-3 items-start animate-in fade-in slide-in-from-right-4 duration-300 ${bgClass}`}>
                                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${colorClass}`} />
                                <div className="flex-1">
                                    <div className="text-xs font-mono text-[var(--color-arcade-text-muted)] mb-1">{formatTime(log.timestamp)}</div>
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