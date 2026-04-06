## 1. Setup & Utilities

- [x] 1.1 Install `framer-motion` for gesture handling.
- [x] 1.2 Create a `ydk-parser.ts` utility function in `/utils` that takes a raw string and returns arrays of Konami IDs for main, extra, and side.
- [x] 1.3 Create a Server Action `fetchCardsByKonamiIds` to retrieve full card objects from the database given an array of IDs.

## 2. Mobile-First Deck UI & Gestures

- [x] 2.1 Refactor the `CyberCard` component inside the deck view to wrap it in a `framer-motion` `motion.div`.
- [x] 2.2 Implement `onPanEnd` (swipe gesture) to trigger card removal when swiped past a certain X-axis threshold.
- [x] 2.3 Implement a long-press handler (using `onTouchStart`/`onTouchEnd` timeouts) that sets an `activePreviewCard` state in the store.
- [x] 2.4 Create a `CardPreviewDrawer` component (using Vaul) that listens to `activePreviewCard` and displays the high-res image and text.
- [x] 2.5 Implement the "Sticky Stats Bar" at the bottom of the `DeckGrid` component showing total counts (Main/Extra/Side).

## 3. The Oracle (Recommendations)

- [x] 3.1 Create a Server Action `getOracleRecommendations(currentCards)` that calculates the most common archetypes/attributes and fetches top 20 synergistic cards.
- [x] 3.2 Add a new "Suggested" Tab to the existing `CardDrawer` UI.
- [x] 3.3 Wire up the `getOracleRecommendations` to display results inside the "Suggested" Tab via `react-query`.

## 4. Search Filter Overhaul

- [x] 4.1 Redesign the `CardDrawer` filter section: hide advanced dropdowns (Attribute, Level, Type) behind a collapsible "Advanced Filters" button.
- [x] 4.2 Use horizontal scrolling pill buttons for the most common quick filters (Monsters, Spells, Traps, Extra Deck).

## 5. YDK Import UI

- [x] 5.1 Add an "Import YDK" button to the Deck Dashboard / Builder Header.
- [x] 5.2 Create a Modal containing a `<textarea>` to paste raw YDK strings.
- [x] 5.3 On submit, parse the string, fetch the cards via `fetchCardsByKonamiIds`, and hydrate the `useBuilderStore` with the results.
- [x] 5.4 Show a toast notification summarizing the import (e.g., "Imported 40/42 cards").## 6. UX Extensions & Refinements
- [x] 6.1 Refine card tag badges to be more elegant and subtle.
- [x] 6.2 Declutter DeckHeader: Move non-essential tools to a Dropdown Menu, keep only Save visible.
- [x] 6.3 Add deck archetypes as quick filter pills in the FilterPanel.
- [x] 6.4 Display Top 3 Oracle recommendations directly above the normal search results.
