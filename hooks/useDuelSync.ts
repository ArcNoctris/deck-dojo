'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useDuelStore, DuelState } from '@/store/duel-store';
import { toast } from 'sonner';

export const useDuelSync = () => {
    const { 
        roomId, 
        deviceId, 
        broadcastSignal,
        syncState,
        setRoomId
    } = useDuelStore();
    
    const supabase = createClient();
    const channelRef = useRef<any>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);

    // Initialize or rejoin room
    useEffect(() => {
        if (!roomId) {
            setIsSubscribed(false);
            return;
        }

        console.log(`[DuelSync] Joining room: ${roomId}`);
        const channelName = `duel_room:${roomId}`;
        
        const channel = supabase.channel(channelName, {
            config: {
                broadcast: { ack: false }
            }
        });

        channel
            .on('broadcast', { event: 'sync_state' }, (payload) => {
                const data = payload.payload as { deviceId: string; state: Partial<DuelState> };
                
                // Ignore our own echoes
                if (data.deviceId === deviceId) return;

                console.log('[DuelSync] Received remote state', data.state);
                syncState(data.state);
            })
            .on('broadcast', { event: 'request_state' }, (payload) => {
                const data = payload.payload as { deviceId: string };
                if (data.deviceId !== deviceId) {
                    console.log('[DuelSync] Remote requested state, sending current state...');
                    const currentState = useDuelStore.getState();
                    channel.send({
                        type: 'broadcast',
                        event: 'sync_state',
                        payload: {
                            deviceId,
                            state: {
                                lp1: currentState.lp1,
                                lp2: currentState.lp2,
                                timer: currentState.timer,
                                timerRunning: currentState.timerRunning,
                                logs: currentState.logs,
                            }
                        }
                    });
                }
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    setIsSubscribed(true);
                    toast.success(`Connected to Room: ${roomId}`);
                    
                    // Request current state from anyone already in the room
                    channel.send({
                        type: 'broadcast',
                        event: 'request_state',
                        payload: { deviceId }
                    });
                } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                    setIsSubscribed(false);
                }
            });

        channelRef.current = channel;

        return () => {
            console.log(`[DuelSync] Leaving room: ${roomId}`);
            supabase.removeChannel(channel);
            channelRef.current = null;
            setIsSubscribed(false);
        };
    }, [roomId, deviceId, supabase, syncState]);

    // Broadcast local changes ONLY when a user-initiated action occurs
    // (indicated by broadcastSignal changing)
    useEffect(() => {
        if (!roomId || !channelRef.current || !isSubscribed || broadcastSignal === 0) return;

        const currentState = useDuelStore.getState();
        const statePayload = {
            lp1: currentState.lp1,
            lp2: currentState.lp2,
            timer: currentState.timer,
            timerRunning: currentState.timerRunning,
            logs: currentState.logs
        };

        // Broadcast to channel
        channelRef.current.send({
            type: 'broadcast',
            event: 'sync_state',
            payload: {
                deviceId,
                state: statePayload
            }
        });
    }, [broadcastSignal, roomId, isSubscribed, deviceId]);

    // Expose a way to generate a new room
    const createRoom = () => {
        const newRoom = Math.random().toString(36).substring(2, 8).toUpperCase();
        setRoomId(newRoom);
        return newRoom;
    };

    const leaveRoom = () => {
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
            channelRef.current = null;
        }
        setRoomId(null);
        toast.info("Disconnected from room.");
    };

    return { createRoom, leaveRoom, roomId };
};