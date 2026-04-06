import { create } from 'zustand';

export interface CombatLogEntry {
    id: string;
    timestamp: number;
    message: string;
    type: 'lp' | 'rng' | 'system';
}

export interface DuelState {
    // Room Config
    roomId: string | null;
    deviceId: string; // To prevent echoing own sync messages
    
    // Game State
    lp1: number;
    lp2: number;
    timer: number; // in seconds
    timerRunning: boolean;
    logs: CombatLogEntry[];
    broadcastSignal: number; // Used to trigger network broadcasts only on local actions
    
    // UI State
    selectedPlayer: 1 | 2 | null;
    isCalculatorOpen: boolean;
}

interface DuelActions {
    // Game Actions
    adjustLp: (player: 1 | 2, amount: number, message: string) => void;
    halveLp: (player: 1 | 2) => void;
    addLog: (message: string, type: CombatLogEntry['type']) => void;
    
    // Timer Actions
    toggleTimer: () => void;
    tickTimer: () => void;
    setTimer: (seconds: number) => void;
    
    // Room Actions
    setRoomId: (id: string | null) => void;
    syncState: (newState: Partial<DuelState>) => void; // Used by useDuelSync to overwrite state from remote
    reset: () => void;

    // UI Actions
    openCalculator: (player: 1 | 2) => void;
    closeCalculator: () => void;
}

type DuelStore = DuelState & DuelActions;

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older browsers or non-secure contexts (like accessing via local IP without HTTPS)
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const INITIAL_STATE: DuelState = {
    roomId: null,
    deviceId: generateId(),
    lp1: 8000,
    lp2: 8000,
    timer: 40 * 60, // 40 minutes
    timerRunning: false,
    logs: [],
    broadcastSignal: 0,
    selectedPlayer: null,
    isCalculatorOpen: false,
};

export const useDuelStore = create<DuelStore>((set, get) => ({
    ...INITIAL_STATE,

    adjustLp: (player, amount, message) => {
        set((state) => {
            const currentLp = player === 1 ? state.lp1 : state.lp2;
            const newLp = Math.max(0, currentLp + amount);
            
            const logEntry: CombatLogEntry = {
                id: generateId(),
                timestamp: Date.now(),
                message: `Player ${player}: ${amount > 0 ? '+' : ''}${amount} LP. ${message}`,
                type: 'lp'
            };

            return {
                ...(player === 1 ? { lp1: newLp } : { lp2: newLp }),
                logs: [logEntry, ...state.logs],
                isCalculatorOpen: false,
                selectedPlayer: null,
                broadcastSignal: state.broadcastSignal + 1
            };
        });
    },

    halveLp: (player) => {
        set((state) => {
            const currentLp = player === 1 ? state.lp1 : state.lp2;
            const newLp = Math.ceil(currentLp / 2);
            
            const logEntry: CombatLogEntry = {
                id: generateId(),
                timestamp: Date.now(),
                message: `Player ${player} LP Halved.`,
                type: 'lp'
            };

            return {
                ...(player === 1 ? { lp1: newLp } : { lp2: newLp }),
                logs: [logEntry, ...state.logs],
                isCalculatorOpen: false,
                selectedPlayer: null,
                broadcastSignal: state.broadcastSignal + 1
            };
        });
    },

    addLog: (message, type) => {
        set((state) => ({
            logs: [
                { id: generateId(), timestamp: Date.now(), message, type },
                ...state.logs
            ],
            broadcastSignal: state.broadcastSignal + 1
        }));
    },

    toggleTimer: () => set((state) => ({ timerRunning: !state.timerRunning, broadcastSignal: state.broadcastSignal + 1 })),
    tickTimer: () => set((state) => ({ timer: Math.max(0, state.timer - 1) })),
    setTimer: (seconds) => set((state) => ({ timer: seconds, broadcastSignal: state.broadcastSignal + 1 })),

    setRoomId: (id) => set({ roomId: id }),
    
    // Overwrite state from a remote sync event (DOES NOT increment broadcastSignal)
    syncState: (newState) => set((state) => ({ ...state, ...newState })),

    reset: () => set((state) => ({ ...INITIAL_STATE, deviceId: state.deviceId, roomId: state.roomId, broadcastSignal: state.broadcastSignal + 1 })),

    openCalculator: (player) => set({ selectedPlayer: player, isCalculatorOpen: true }),
    closeCalculator: () => set({ isCalculatorOpen: false, selectedPlayer: null })
}));