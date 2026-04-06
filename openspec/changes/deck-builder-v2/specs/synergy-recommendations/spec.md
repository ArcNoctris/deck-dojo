## ADDED Requirements

### Requirement: System analyzes deck archetype
The system SHALL analyze the current cards in the main deck to determine the dominant archetypes or races.

#### Scenario: Determining dominant archetype
- **WHEN** the user has 15 "Snake-Eye" cards and 3 "Ash Blossom" cards in the deck
- **THEN** the system identifies "Snake-Eye" as a primary archetype

### Requirement: System suggests synergistic cards
The system SHALL display a list of recommended cards based on the dominant archetypes or attributes of the current deck, excluding cards already at 3 copies.

#### Scenario: Viewing recommendations
- **WHEN** the user opens the "Suggested" tab in the Card Drawer
- **THEN** they see a list of cards that share archetypes, races, or attributes with their current deck