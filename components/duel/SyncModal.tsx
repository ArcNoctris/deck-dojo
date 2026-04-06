'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog } from '@headlessui/react';
import { Link2, X, Copy, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface SyncModalProps {
    open: boolean;
    onClose: () => void;
    roomId: string | null;
    createRoom: () => string;
    leaveRoom: () => void;
}

export const SyncModal = ({ open, onClose, roomId, createRoom, leaveRoom }: SyncModalProps) => {
    const [localLink, setLocalLink] = useState('');
    const [joinCode, setJoinCode] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setLocalLink(window.location.origin + '/duel?room=' + roomId);
        }
    }, [roomId]);

    const handleCreate = () => {
        createRoom();
    };

    const handleJoin = () => {
        if (joinCode.trim().length === 6) {
            if (typeof window !== 'undefined') {
                window.location.href = `/duel?room=${joinCode.trim().toUpperCase()}`;
            }
        } else {
            toast.error("Please enter a valid 6-character room code.");
        }
    };

    const handleCopy = () => {
        if (roomId) {
            navigator.clipboard.writeText(localLink);
            toast.success("Link copied to clipboard!");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} className="relative z-[150]">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-sm w-full bg-navy-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-focus-amber" />
                    
                    <div className="flex justify-between items-center mb-6">
                        <Dialog.Title className="font-heading text-2xl font-bold flex items-center gap-2 text-cyan-500 tracking-wider">
                            <Link2 className="w-6 h-6" /> ROOM LINK
                        </Dialog.Title>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {!roomId ? (
                        <div className="text-center py-6">
                            <QrCode className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-sm font-mono text-gray-400 mb-6">
                                Create a room to sync Life Points, timers, and dice rolls with your opponent in real-time.
                            </p>
                            <Button variant="primary" onClick={handleCreate} className="w-full h-12 text-lg tracking-widest font-heading font-bold shadow-[0_0_20px_rgba(8,217,214,0.3)] mb-6">
                                GENERATE ROOM CODE
                            </Button>
                            
                            <div className="flex items-center gap-2 border-t border-navy-800 pt-6">
                                <input 
                                    type="text" 
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    placeholder="ENTER 6-CHAR CODE"
                                    maxLength={6}
                                    className="flex-1 bg-navy-950 border border-navy-800 rounded-lg p-3 font-mono text-center tracking-[0.2em] focus:border-cyan-500 outline-none uppercase"
                                />
                                <Button variant="ghost" onClick={handleJoin} className="h-12 border border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10 shrink-0">
                                    JOIN
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="bg-white p-4 rounded-xl mb-6 shadow-[0_0_30px_rgba(8,217,214,0.2)]">
                                <QRCodeSVG value={localLink} size={200} level="H" includeMargin={true} />
                            </div>
                            
                            <div className="w-full bg-navy-950 border border-navy-800 rounded-lg p-3 flex items-center justify-between mb-6">
                                <span className="font-mono text-xl tracking-[0.3em] font-bold text-focus-amber">
                                    {roomId}
                                </span>
                                <button onClick={handleCopy} className="p-2 text-gray-400 hover:text-cyan-400 transition-colors bg-navy-800 rounded">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="text-[10px] font-mono text-gray-500 text-center uppercase tracking-widest mb-6">
                                OPPONENT CAN SCAN THE QR CODE OR ENTER THIS LINK TO JOIN THE SESSION
                            </p>

                            <div className="flex w-full gap-3">
                                <Button variant="ghost" onClick={leaveRoom} className="flex-1 border border-red-500/30 text-red-500 hover:bg-red-500/10">
                                    DISCONNECT
                                </Button>
                                <Button variant="primary" onClick={onClose} className="flex-1">
                                    CLOSE
                                </Button>
                            </div>
                        </div>
                    )}
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};