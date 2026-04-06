## Context

The current deck builder requires too much friction for mobile users. Searching for cards is overwhelming, and basic actions (like moving a card from the main deck to the side deck or viewing a card's text) require too many precise taps. We need to overhaul the mobile UX with gestures, introduce YDK parsing, and add an AI/Data-driven recommendation tab.

## Goals / Non-Goals

**Goals:**
- Make the builder feel like a native mobile app using swipe gestures.
- Provide a non-intrusive way to read full card text without leaving the deck view.
- Allow users to import decks instantly via standard `.ydk` strings.
- Provide card recommendations based on the current state of the deck.
- Simplify the search filter UI.

**Non-Goals:**
- A massive desktop UI overhaul. The focus is strictly on making the mobile experience pristine first.
- A fully autonomous AI that builds the entire deck for you. Recommendations should be suggestions, not full automated builds.

## Decisions

1. **Gestures (Framer Motion / React Use Gesture)**
   - Use `framer-motion` (already in the React ecosystem) to implement swipe-to-delete and swipe-to-side-deck on the `CyberCard` component inside the deck view.
   - *Rationale*: It provides 60fps animations and handles touch physics out of the box, making it feel native.

2. **Long-Press Preview (Smart Bottom Sheet)**
   - Implement an `onTouchStart` / `onTouchEnd` timer on cards. If held for 500ms, trigger a new state in `useBuilderStore` that opens a `CardPreviewDrawer` (using Vaul).
   - *Rationale*: Keeps the UI clean. Users only see the massive text box when they explicitly want to.

3. **YDK Parser**
   - Create a utility function `parseYDK(ydkString: string)` that extracts Konami IDs from the standard YDK format (`#main`, `#extra`, `!side`).
   - Create a Server Action `fetchCardsByKonamiIds` to retrieve the full card objects from Supabase and hydrate the `useBuilderStore`.
   - *Rationale*: Standard format used by EDOPro, YGO Omega, and YGOProDeck.

4. **The Oracle (Synergy Engine)**
   - In the initial iteration, we will rely on a heuristic algorithm: find the most common `archetype` or `race` in the current deck, and query Supabase for high-usage cards matching those traits that aren't already in the deck.
   - *Alternative*: If we had match data, we could do collaborative filtering. Since we don't have enough data yet, attribute/archetype matching is the safest V1.

## Risks / Trade-offs

- **Risk: Gesture Conflicts** → Swiping on a card might conflict with scrolling the page. 
  - *Mitigation*: Ensure `framer-motion` pan handlers explicitly `touch-action: pan-y` on the container so vertical scrolling isn't hijacked by horizontal swipes.
- **Risk: YDK IDs missing** → A user imports a YDK with alternate artworks (different Konami IDs) that aren't in our DB.
  - *Mitigation*: The parser should silently ignore unfound IDs but show a toast notification: "Imported 38/40 cards. 2 cards not found."