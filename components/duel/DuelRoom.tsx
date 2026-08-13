'use client';

import { PlayerCard } from './PlayerCard';
import { CalculatorModal } from './CalculatorModal';
import { DuelTimer } from './DuelTimer';
import { CombatLog } from './CombatLog';
import { HistoryOverlay } from './HistoryOverlay';
import { RollPopup } from './RollPopup';
import { ResetPopup } from './ResetPopup';
import { DeckPopup } from './DeckPopup';
import { DuelNavMenu } from './DuelNavMenu';
import { RoundOverOverlay } from './RoundOverOverlay';
import { SyncModal } from './SyncModal';
import { ArrowLeft, Play, Pause, RotateCcw, Dice5 } from 'lucide-react';
import Link from 'next/link';
import { useDuelStore } from '@/store/duel-store';
import { useDuelSync } from '@/hooks/useDuelSync';
import { useState, useEffect } from 'react';
import NoSleep from 'nosleep.js';

export const DuelRoom = ({ initialRoomId }: { initialRoomId?: string }) => {
    const { setRoomId, roomId, wins, toggleTimer, timerRunning } = useDuelStore();
    const { createRoom, leaveRoom } = useDuelSync();
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    const [rollPopupOpen, setRollPopupOpen] = useState(false);
    const [resetPopupOpen, setResetPopupOpen] = useState(false);
    const [deckPopupOpen, setDeckPopupOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);

    useEffect(() => {
        if (initialRoomId) {
            setRoomId(initialRoomId);
        }

        // Prevent screen sleep
        const noSleep = new NoSleep();

        const enableNoSleep = () => {
            noSleep.enable();
            document.removeEventListener('click', enableNoSleep, false);
        };

        document.addEventListener('click', enableNoSleep, false);

        return () => {
            noSleep.disable();
            document.removeEventListener('click', enableNoSleep, false);
        };
    }, [initialRoomId, setRoomId]);

    return (
        <div className="flex flex-col lg:flex-row h-full w-full relative bg-[var(--color-arcade-bg)]">
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                <Link
                    href="/"
                    className="absolute top-2 left-2 w-[26px] h-[26px] bg-[var(--color-arcade-panel)]/85 border border-[var(--color-arcade-border)] rounded-lg grid place-items-center z-20"
                    aria-label="Home"
                >
                    <ArrowLeft className="w-3 h-3 text-[var(--color-arcade-text)]" />
                </Link>

                <DuelNavMenu
                    onShare={() => setIsSyncModalOpen(true)}
                    onLog={() => setHistoryOpen(true)}
                    onDecks={() => setDeckPopupOpen(true)}
                />

                <PlayerCard player={2} inverted />

                <div className="flex-none bg-[var(--color-arcade-surface)] border-y border-[var(--color-arcade-border)] flex items-center justify-center py-3 z-10">
                    <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-2.5">
                            <span className="font-heading font-bold text-lg text-[var(--color-arcade-text)]">{wins[0]}–{wins[1]}</span>
                            <DuelTimer />
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={toggleTimer} className="text-[var(--color-arcade-cyan)]">
                                {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => setResetPopupOpen(true)} className="text-[var(--color-arcade-text-muted)]">
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setRollPopupOpen(true)} className="text-[var(--color-arcade-text-muted)]">
                                <Dice5 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                <PlayerCard player={1} />

                <RollPopup open={rollPopupOpen} onClose={() => setRollPopupOpen(false)} />
                <ResetPopup open={resetPopupOpen} onClose={() => setResetPopupOpen(false)} />
                <DeckPopup open={deckPopupOpen} onClose={() => setDeckPopupOpen(false)} />
                <HistoryOverlay open={historyOpen} onClose={() => setHistoryOpen(false)} />
                <RoundOverOverlay />
            </div>

            {/* Desktop-only persistent combat log */}
            <div className="hidden lg:flex w-80 shrink-0 border-l border-[var(--color-arcade-border)] bg-[var(--color-arcade-surface)] z-20">
                <CombatLog />
            </div>

            <CalculatorModal />
            <SyncModal
                open={isSyncModalOpen}
                onClose={() => setIsSyncModalOpen(false)}
                roomId={roomId}
                createRoom={createRoom}
                leaveRoom={leaveRoom}
            />
        </div>
    );
};
