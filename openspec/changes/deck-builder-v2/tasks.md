## 1. Setup & Utilities

- [ ] 1.1 Install `framer-motion` for gesture handling.
- [ ] 1.2 Create a `ydk-parser.ts` utility function in `/utils` that takes a raw string and returns arrays of Konami IDs for main, extra, and side.
- [ ] 1.3 Create a Server Action `fetchCardsByKonamiIds` to retrieve full card objects from the database given an array of IDs.

## 2. Mobile-First Deck UI & Gestures

- [ ] 2.1 Refactor the `CyberCard` component inside the deck view to wrap it in a `framer-motion` `motion.div`.
- [ ] 2.2 Implement `onPanEnd` (swipe gesture) to trigger card removal when swiped past a certain X-axis threshold.
- [ ] 2.3 Implement a long-press handler (using `onTouchStart`/`onTouchEnd` timeouts) that sets an `activePreviewCard` state in the store.
- [ ] 2.4 Create a `CardPreviewDrawer` component (using Vaul) that listens to `activePreviewCard` and displays the high-res image and text.
- [ ] 2.5 Implement the "Sticky Stats Bar" at the bottom of the `DeckGrid` component showing total counts (Main/Extra/Side).

## 3. The Oracle (Recommendations)

- [ ] 3.1 Create a Server Action `getOracleRecommendations(currentCards)` that calculates the most common archetypes/attributes and fetches top 20 synergistic cards.
- [ ] 3.2 Add a new "Suggested" Tab to the existing `CardDrawer` UI.
- [ ] 3.3 Wire up the `getOracleRecommendations` to display results inside the "Suggested" Tab via `react-query`.

## 4. Search Filter Overhaul

- [ ] 4.1 Redesign the `CardDrawer` filter section: hide advanced dropdowns (Attribute, Level, Type) behind a collapsible "Advanced Filters" button.
- [ ] 4.2 Use horizontal scrolling pill buttons for the most common quick filters (Monsters, Spells, Traps, Extra Deck).

## 5. YDK Import UI

- [ ] 5.1 Add an "Import YDK" button to the Deck Dashboard / Builder Header.
- [ ] 5.2 Create a Modal containing a `<textarea>` to paste raw YDK strings.
- [ ] 5.3 On submit, parse the string, fetch the cards via `fetchCardsByKonamiIds`, and hydrate the `useBuilderStore` with the results.
- [ ] 5.4 Show a toast notification summarizing the import (e.g., "Imported 40/42 cards").