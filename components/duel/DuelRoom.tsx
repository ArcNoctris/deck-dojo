'use client';

import { PlayerCard } from './PlayerCard';
import { CalculatorModal } from './CalculatorModal';
import { DuelTimer } from './DuelTimer';
import { CombatLog } from './CombatLog';
import { CoinTool, DiceTool } from './DuelRngTools';
import { SyncModal } from './SyncModal';
import { Link2, RefreshCcw, Home, Terminal } from 'lucide-react';
import Link from 'next/link';
import { Drawer } from 'vaul';
import { useDuelStore } from '@/store/duel-store';
import { useDuelSync } from '@/hooks/useDuelSync';
import { useState, useEffect } from 'react';
import NoSleep from 'nosleep.js';

export const DuelRoom = ({ initialRoomId }: { initialRoomId?: string }) => {
    const { setRoomId, roomId, reset } = useDuelStore();
    const { createRoom, leaveRoom } = useDuelSync();
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

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

    const handleFullReset = () => {
        if (confirm("Reset the entire duel state (LP, Timer, Logs)?")) {
            reset();
            // Preserve room connection
            if (roomId) setRoomId(roomId);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-full w-full relative bg-void-black">
            {/* Top Bar (Mobile) / Left Sidebar (Desktop) */}
            <div className="flex lg:flex-col justify-between items-center bg-navy-950 border-b lg:border-b-0 lg:border-r border-navy-800 p-2 lg:p-4 shrink-0 shadow-lg z-20">
                <div className="flex lg:flex-col gap-2 items-center w-full justify-between lg:justify-start">
                    <Link href="/">
                        <button className="p-3 bg-navy-900 rounded-xl border border-navy-800 text-gray-500 hover:text-cyan-400 hover:border-cyan-500 transition-colors shadow-inner" aria-label="Home">
                            <Home className="w-5 h-5" />
                        </button>
                    </Link>
                    
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsSyncModalOpen(true)}
                            className={`p-3 rounded-xl border transition-colors shadow-inner relative ${
                                roomId ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(8,217,214,0.3)]' : 'bg-navy-900 border-navy-800 text-gray-500 hover:text-cyan-400 hover:border-cyan-500'
                            }`}
                            aria-label="Sync Devices"
                        >
                            <Link2 className={`w-5 h-5 ${roomId ? 'animate-pulse' : ''}`} />
                            {roomId && <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_5px_#08D9D6]"></div>}
                        </button>
                        
                        <Drawer.Root>
                            <Drawer.Trigger asChild>
                                <button 
                                    className="lg:hidden p-3 bg-navy-900 rounded-xl border border-navy-800 text-gray-500 hover:text-cyan-400 hover:border-cyan-500 transition-colors shadow-inner"
                                    aria-label="Combat Log"
                                >
                                    <Terminal className="w-5 h-5" />
                                </button>
                            </Drawer.Trigger>
                            <Drawer.Portal>
                                <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
                                <Drawer.Content className="bg-navy-900 flex flex-col rounded-t-[20px] h-[70vh] mt-24 fixed bottom-0 left-0 right-0 z-50 border-t-2 border-cyan-500 outline-none">
                                    <div className="mx-auto w-16 h-1.5 flex-shrink-0 rounded-full bg-navy-800 mt-4 mb-2" />
                                    <div className="flex-1 overflow-hidden">
                                        <CombatLog />
                                    </div>
                                </Drawer.Content>
                            </Drawer.Portal>
                        </Drawer.Root>

                        <button 
                            onClick={handleFullReset}
                            className="p-3 bg-navy-900 rounded-xl border border-navy-800 text-gray-500 hover:text-strike-red hover:border-strike-red transition-colors shadow-inner"
                            aria-label="Reset Match"
                        >
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                
                {/* Timer in Nav for Desktop */}
                <div className="hidden lg:block mt-auto w-full">
                    {/* Re-evaluating this: if it's in the middle, we don't need it in the sidebar */}
                </div>
            </div>

            {/* Main Duel Area (LP Counters) */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-void-black">
                 {/* Player 2 (Inverted) */}
                 <div className="flex-1 min-h-0 border-b-2 border-navy-950 flex flex-col relative">
                    <PlayerCard player={2} inverted={true} />
                 </div>
                 
                 {/* Center Tools Overlay Strip */}
                 <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 z-30 px-6 flex justify-between items-center pointer-events-none">
                     <div className="pointer-events-auto">
                        <CoinTool />
                     </div>
                     <div className="pointer-events-auto shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-full">
                        <DuelTimer />
                     </div>
                     <div className="pointer-events-auto">
                        <DiceTool />
                     </div>
                 </div>

                 {/* Player 1 */}
                 <div className="flex-1 min-h-0 flex flex-col relative">
                    <PlayerCard player={1} />
                 </div>
            </div>

            {/* Right Sidebar: Combat Log */}
            <div className="hidden lg:flex w-80 shrink-0 border-l border-navy-800 bg-navy-950 z-20">
                <CombatLog />
            </div>

            {/* Modals */}
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