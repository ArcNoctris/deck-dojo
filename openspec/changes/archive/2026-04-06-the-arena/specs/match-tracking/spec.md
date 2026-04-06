## ADDED Requirements

### Requirement: User can log a match result
The system SHALL allow users to record the outcome of a match they played using a specific deck.

#### Scenario: Successfully logging a win
- **WHEN** the user selects their deck, enters the opponent's deck name, sets result to "Win", and clicks "Log Match"
- **THEN** the system saves the match record to the database and confirms success

#### Scenario: Logging a match with going first/second
- **WHEN** the user toggles the "Going First" option when logging a match
- **THEN** the system records whether the user went first or second for that match

### Requirement: Matches are linked to deck versions
The system SHALL associate each logged match with the specific state or version of the deck at the time the match was played, if versioning is available.

#### Scenario: Associating a match
- **WHEN** a match is recorded
- **THEN** the database record MUST include the relevant `deck_id`
