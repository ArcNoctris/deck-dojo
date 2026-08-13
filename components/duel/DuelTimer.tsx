'use client';

import { useEffect } from 'react';
import { useDuelStore } from '@/store/duel-store';

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const DuelTimer = () => {
    const { timer, timerRunning, tickTimer } = useDuelStore();

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;
        if (timerRunning && timer > 0) {
            interval = setInterval(() => tickTimer(), 1000);
        }
        return () => clearInterval(interval);
    }, [timerRunning, timer, tickTimer]);

    return (
        <span className="font-heading font-bold text-[13px] text-[var(--color-arcade-text-muted)]">
            {formatTime(timer)}
        </span>
    );
};
