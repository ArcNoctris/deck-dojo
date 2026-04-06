## Context

Players need a fast, local-first LP tracking app that can easily sync with an opponent sitting across the table without forcing them into heavy "Lobbies" or "Matchmaking". The current `/duel` route is a temporary stub; we need to replace it with a fully-functional, beautiful "Duel Room" tracker.

## Goals / Non-Goals

**Goals:**
- Provide massive, readable 8000 LP counters.
- Provide a robust calculator (Numpad + presets like Half) for LP changes.
- Implement a combat log, timer, coin flip, and dice roll.
- Allow seamless, "drop-in" P2P syncing via Supabase Realtime channels initialized by a QR code scan.

**Non-Goals:**
- This is NOT an automated simulator (like Master Duel). It does not know card rules. It is a manual calculator and tracker.
- Complex matchmaking queues.

## Decisions

1. **Local-First State (Zustand)**
   - The entire `duel` state (lp1, lp2, timer, logs) will live in a Zustand store. It must work 100% offline.
   - *Rationale*: Tournaments have terrible wifi. The app must never block a player from changing LP just because a network request is hanging.

2. **Sync Mechanism (Supabase Realtime WebSockets)**
   - When a user clicks "Link", the app generates a random 6-character string (`roomId`) and displays a QR code containing a deep link (e.g., `/duel?room=XYZ123`).
   - When scanned, the opponent's app mounts and subscribes to the Supabase channel `duel_room:XYZ123`.
   - Every time Zustand state updates locally, if connected, it broadcasts the payload over the channel. The other client receives it and updates their Zustand store.
   - *Rationale*: Supabase Realtime is fast, built-in to our stack, and doesn't require saving every LP change to a Postgres table.

3. **Conflict Resolution**
   - The Combat Log is the source of truth. If Player 1 subtracts 1000 and Player 2 subtracts 1000 simultaneously, both events hit the log, and the math applies sequentially.

## Risks / Trade-offs

- **Risk: Sync Loops / Echoes** → P1 broadcasts state -> P2 receives and updates state -> P2 broadcasts the new state -> P1 receives... infinite loop.
  - *Mitigation*: Broadcast payloads must include an `actorId`. When receiving a message, if the `actorId` matches your own, ignore it. Do not trigger a broadcast when receiving a broadcast.
- **Risk: Screen Sleep** → Mobile devices go to sleep after 30 seconds of inactivity.
  - *Mitigation*: We will use the NoSleep.js library (or WakeLock API if supported) to keep the screen awake while in the Duel Room.