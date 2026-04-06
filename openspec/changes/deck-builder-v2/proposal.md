## Why

The current deck builder requires too much friction to construct and manage decks, particularly on mobile devices. Searching feels overwhelming, interactions require too many taps, and migrating existing decks from other platforms is entirely manual. By focusing on mobile-first gestures, introducing YDK imports, and adding a recommendation engine ("The Oracle"), we can drastically speed up the deck-building process and reduce cognitive load.

## What Changes

- **Swipe Gestures**: Implement mobile-native swipe gestures on cards within the deck to quickly remove them or move them between Main and Side decks.
- **Smart Bottom Sheets**: Long-pressing a card will open a non-intrusive half-screen drawer showing the high-res image and readable text without leaving the builder context.
- **Accessible Filters**: Reorganize the filter bar within the search drawer to make advanced search options less overwhelming while retaining all current functionality.
- **YDK Import**: Add the ability to paste `.ydk` file contents or upload a file to instantly construct a visual deck based on Konami IDs.
- **"The Oracle" Recommendations**: Introduce a "Suggested" tab in the search drawer that analyzes the current deck's archetype/attributes and recommends highly synergistic cards.
- **Sticky Stats Bar**: Implement a persistent bottom bar showing card counts (e.g., 40/60) and a visual curve mini-chart.

## Capabilities

### New Capabilities

- `deck-import-ydk`: The ability to parse and import `.ydk` format deck lists into the builder state.
- `synergy-recommendations`: The system for analyzing the current deck state and suggesting relevant cards.
- `mobile-builder-ux`: New mobile-first gestures and UI components (swipe actions, long-press preview, sticky stats).

### Modified Capabilities

- `card-search`: Updating the UI/UX of the search filters to be more accessible and less overwhelming.

## Impact

- **UI/UX**: Significant refactoring of the `DeckBuilder` component, `CardDrawer`, and the introduction of mobile touch gesture libraries (like `framer-motion` or `react-use-gesture`).
- **State Management**: `useBuilderStore` will need new actions to handle bulk imports (YDK) and moving cards directly between deck zones.
- **Backend/API**: A new server action or Edge function to handle the "Oracle" recommendation logic (querying the database for correlated cards based on the current deck list).