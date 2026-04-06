## Why

Players need a reliable way to track Life Points, dice rolls, and timers during physical or remote games. Currently, they have to rely on external tools like Neuron or Nexus. By building "The Duel Room", we provide a seamless, local-first LP tracker that works offline but can instantly and frictionlessly sync with an opponent via a QR code drop-in, ensuring "Tactical Zen" requires no lobby waiting.

## What Changes

- **Core LP Calculator UI**: A massive, highly readable mobile-first interface tracking Player 1 and Player 2 Life Points starting at 8000.
- **Numpad & Utilities**: A swipeable/accessible calculator to easily add, subtract, or halve LP, along with a 40-minute countdown timer.
- **RNG Tools**: Built-in visual coin flip and 1-6 dice roll functionality.
- **Combat Log**: A scrolling, time-stamped history of all LP changes, coin flips, and dice rolls to settle disputes.
- **Drop-in Multiplayer (QR)**: The ability to generate a QR code that, when scanned by an opponent, instantly syncs the state of the calculator between both devices using Supabase Realtime WebSockets without navigating to a separate lobby.

## Capabilities

### New Capabilities

- `lp-calculator`: The local-first tracking of life points, timers, and combat logs.
- `duel-rng`: The utilities for rolling dice and flipping coins.
- `realtime-sync`: The WebSocket-based system for instantly linking two devices via a QR code.

### Modified Capabilities

None.

## Impact

- **UI/UX**: Creation of a completely new route (`/duel` replacing the temporary simulator stub) focused heavily on massive, readable typography and fast tap/swipe interactions.
- **State Management**: A new Zustand store (`useDuelStore`) to handle local state before broadcasting.
- **Dependencies**: Adding `qrcode.react` to generate the sync codes and heavy reliance on `@supabase/supabase-js` realtime channel features.