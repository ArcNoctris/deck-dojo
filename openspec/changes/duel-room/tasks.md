## 1. Local State & Routing Setup

- [x] 1.1 Install `qrcode.react` to generate sync codes and `nosleep.js` to keep screens awake during a match.
- [x] 1.2 Create the `useDuelStore` Zustand store in `store/duel-store.ts` (state: `lp1`, `lp2`, `timer`, `logs`, `roomId`, plus actions like `adjustLp`, `addLog`, `reset`).
- [x] 1.3 Refactor `app/duel/page.tsx` from the temporary Test Hand simulator to the new Duel Room interface layout.

## 2. Core Duel UI Components

- [x] 2.1 Create the `PlayerCard` component: A large, tappable area displaying "PLAYER 1" and their current LP (8000).
- [x] 2.2 Create the `CalculatorModal` (or Drawer): A numpad interface (+1000, +500, +100, +50, Halve, Enter) that updates the selected player's LP via the store.
- [x] 2.3 Create the `DuelTimer` component: A 40:00 countdown clock with pause/play functionality.
- [x] 2.4 Create the `CombatLog` component: A scrolling sidebar/bottom drawer that displays the history of LP changes and actions.

## 3. RNG Utilities

- [x] 3.1 Create the `DuelRngTools` component containing buttons for Coin Flip and Dice Roll.
- [x] 3.2 Implement a simple 3D CSS or Framer Motion flip animation for the coin.
- [x] 3.3 Ensure the results of both the dice roll and coin flip are appended to the store's `logs` array.

## 4. Multiplayer Synchronization (Supabase Realtime)

- [x] 4.1 Create a custom hook `useDuelSync.ts` that initializes a Supabase Realtime channel if a `roomId` exists.
- [x] 4.2 In `useDuelSync.ts`, listen to local Zustand changes. When a state change occurs (LP drops, timer pauses), broadcast a `sync_state` event payload containing the new state.
- [x] 4.3 In `useDuelSync.ts`, listen for incoming `sync_state` events and update the local Zustand store (ignoring events broadcasted by self).
- [x] 4.4 Create the `SyncModal` component: Displays a QR code and a 6-character room code.
- [x] 4.5 Update `app/duel/page.tsx` to read the `?room=` query parameter on load. If present, auto-join the room and trigger `useDuelSync`.