## ADDED Requirements

### Requirement: User can swipe to remove cards
The system SHALL allow users to swipe horizontally on a card in the builder grid to remove it from the deck.

#### Scenario: Swiping to remove
- **WHEN** the user swipes left on a card past a certain threshold
- **THEN** the card is removed from the store and the UI updates

### Requirement: User can long-press to preview
The system SHALL display a detailed card preview when a user long-presses a card in the builder.

#### Scenario: Triggering preview
- **WHEN** the user presses and holds a card for at least 500ms
- **THEN** a bottom sheet drawer opens displaying the card's full text and high-res image

### Requirement: Builder displays sticky stats
The system SHALL display a persistent bottom bar showing the current card counts for Main, Extra, and Side decks.

#### Scenario: Viewing sticky stats
- **WHEN** the user scrolls through the deck builder
- **THEN** the stats bar remains visible at the bottom of the screen above the navigation