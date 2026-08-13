import { create } from 'zustand';

export interface CombatLogEntry {
    id: string;
    timestamp: number;
    message: string;
    type: 'lp' | 'rng' | 'system';
    player?: 1 | 2; // Present on 'lp' entries — lets undo revert the right player.
    from?: number;
    to?: number;
}

export interface DuelState {
    // Room Config
    roomId: string | null;
    deviceId: string; // To prevent echoing own sync messages

    // Game State
    lp1: number;
    lp2: number;
    startLp: number;
    timer: number; // in seconds
    timerRunning: boolean;
    logs: CombatLogEntry[];
    round: number;
    wins: [number, number];
    roundOver: 1 | 2 | null; // set automatically when a player's LP hits 0
    broadcastSignal: number; // Used to trigger network broadcasts only on local actions

    // Local deck selection (per-device — never synced to the other player)
    p1DeckId: string | null;
    p1DeckName: string | null;
    p1HeroImage: string | null;

    // UI State
    selectedPlayer: 1 | 2 | null;
    isCalculatorOpen: boolean;
}

interface DuelActions {
    // Game Actions
    adjustLp: (player: 1 | 2, amount: number, message: string) => void;
    halveLp: (player: 1 | 2) => void;
    addLog: (message: string, type: CombatLogEntry['type']) => void;
    undoLast: () => void;

    // Round Actions
    nextRound: () => void;
    newMatch: () => void;

    // Timer Actions
    toggleTimer: () => void;
    tickTimer: () => void;
    setTimer: (seconds: number) => void;

    // Room Actions
    setRoomId: (id: string | null) => void;
    syncState: (newState: Partial<DuelState>) => void; // Used by useDuelSync to overwrite state from remote
    reset: () => void;

    // Deck Actions
    setPlayer1Deck: (deck: { id: string; name: string; coverImageUrl: string | null } | null) => void;

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
    startLp: 8000,
    timer: 50 * 60, // 50 minutes
    timerRunning: false,
    logs: [],
    round: 1,
    wins: [0, 0],
    roundOver: null,
    broadcastSignal: 0,
    p1DeckId: null,
    p1DeckName: null,
    p1HeroImage: null,
    selectedPlayer: null,
    isCalculatorOpen: false,
};

export const useDuelStore = create<DuelStore>((set) => ({
    ...INITIAL_STATE,

    adjustLp: (player, amount, message) => {
        set((state) => {
            const currentLp = player === 1 ? state.lp1 : state.lp2;
            const newLp = Math.max(0, currentLp + amount);

            const logEntry: CombatLogEntry = {
                id: generateId(),
                timestamp: Date.now(),
                message: `Player ${player}: ${amount > 0 ? '+' : ''}${amount} LP. ${message}`,
                type: 'lp',
                player,
                from: currentLp,
                to: newLp,
            };

            const wins: [number, number] = [...state.wins];
            let roundOver = state.roundOver;
            if (newLp === 0 && currentLp > 0 && roundOver === null) {
                const winner = player === 1 ? 2 : 1;
                wins[winner - 1] += 1;
                roundOver = winner;
            }

            return {
                ...(player === 1 ? { lp1: newLp } : { lp2: newLp }),
                logs: [logEntry, ...state.logs],
                isCalculatorOpen: false,
                selectedPlayer: null,
                wins,
                roundOver,
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
                type: 'lp',
                player,
                from: currentLp,
                to: newLp,
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

    undoLast: () => {
        set((state) => {
            if (state.logs.length === 0) return state;
            const [last, ...rest] = state.logs;
            if (last.player == null || last.from == null) {
                // Non-LP entries (rng/system) can't be reverted — just drop them.
                return { logs: rest, broadcastSignal: state.broadcastSignal + 1 };
            }
            return {
                ...(last.player === 1 ? { lp1: last.from } : { lp2: last.from }),
                logs: rest,
                roundOver: null, // reverting the killing blow un-ends the round
                broadcastSignal: state.broadcastSignal + 1
            };
        });
    },

    nextRound: () => set((state) => ({
        lp1: state.startLp,
        lp2: state.startLp,
        round: state.round + 1,
        roundOver: null,
        logs: [],
        broadcastSignal: state.broadcastSignal + 1
    })),

    newMatch: () => set((state) => ({
        lp1: state.startLp,
        lp2: state.startLp,
        round: 1,
        wins: [0, 0],
        roundOver: null,
        logs: [],
        broadcastSignal: state.broadcastSignal + 1
    })),

    toggleTimer: () => set((state) => ({ timerRunning: !state.timerRunning, broadcastSignal: state.broadcastSignal + 1 })),
    tickTimer: () => set((state) => ({ timer: Math.max(0, state.timer - 1) })),
    setTimer: (seconds) => set((state) => ({ timer: seconds, broadcastSignal: state.broadcastSignal + 1 })),

    setRoomId: (id) => set({ roomId: id }),

    // Overwrite state from a remote sync event (DOES NOT increment broadcastSignal)
    syncState: (newState) => set((state) => ({ ...state, ...newState })),

    reset: () => set((state) => ({
        ...INITIAL_STATE,
        deviceId: state.deviceId,
        roomId: state.roomId,
        p1DeckId: state.p1DeckId,
        p1DeckName: state.p1DeckName,
        p1HeroImage: state.p1HeroImage,
        broadcastSignal: state.broadcastSignal + 1
    })),

    setPlayer1Deck: (deck) => set({
        p1DeckId: deck?.id ?? null,
        p1DeckName: deck?.name ?? null,
        p1HeroImage: deck?.coverImageUrl ?? null,
    }),

    openCalculator: (player) => set({ selectedPlayer: player, isCalculatorOpen: true }),
    closeCalculator: () => set({ isCalculatorOpen: false, selectedPlayer: null })
}));
