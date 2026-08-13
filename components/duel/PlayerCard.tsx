'use client';

import React from 'react';
import { useDuelStore } from '@/store/duel-store';
import { useLpTween } from '@/hooks/useLpTween';
import { LpBar } from './LpBar';
import { CardArtCrop } from '@/components/ui/CardArtCrop';

interface PlayerCardProps {
    player: 1 | 2;
    inverted?: boolean;
}

export const PlayerCard = ({ player, inverted = false }: PlayerCardProps) => {
    const { lp1, lp2, startLp, openCalculator, p1DeckName, p1HeroImage } = useDuelStore();
    const lp = player === 1 ? lp1 : lp2;
    const shownLp = useLpTween(lp);
    const heroSrc = player === 1
        ? (p1HeroImage || '/duel/hero-p1.png')
        : '/duel/hero-p2.png';

    return (
        <button
            onClick={() => openCalculator(player)}
            className={`relative flex-1 w-full flex flex-col items-center justify-center gap-1.5 overflow-hidden cursor-pointer ${inverted ? 'rotate-180' : ''}`}
        >
            <CardArtCrop src={heroSrc} />
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(180deg,rgba(10,14,20,.55) 0%,rgba(10,14,20,.4) 32%,rgba(10,14,20,.88) 62%,rgba(10,14,20,.95) 100%)',
                }}
            />

            <div
                className="relative font-pixel text-[7.5px]"
                style={{ color: player === 1 ? 'var(--color-arcade-cyan)' : 'var(--color-arcade-text-muted)' }}
            >
                {player === 1 ? 'YOU' : 'OPPONENT'}
            </div>
            {player === 1 && p1DeckName && (
                <div className="relative font-mono font-semibold text-[9px] text-[var(--color-arcade-text-muted)]">
                    {p1DeckName}
                </div>
            )}

            <div
                className="relative font-pixel text-[46px] leading-none text-[var(--color-arcade-text)]"
                style={{
                    textShadow: player === 1
                        ? '0 0 24px rgba(25,211,206,.35), 0 2px 12px rgba(0,0,0,.8)'
                        : '0 2px 12px rgba(0,0,0,.8)',
                }}
            >
                {shownLp}
            </div>

            <div className="relative">
                <LpBar lp={shownLp} startLp={startLp} />
            </div>
        </button>
    );
};
