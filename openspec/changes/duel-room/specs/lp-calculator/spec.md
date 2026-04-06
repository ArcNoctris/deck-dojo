## ADDED Requirements

### Requirement: User can track life points
The system SHALL provide two distinct counters, Player 1 and Player 2, initialized to 8000.

#### Scenario: Adjusting Life Points
- **WHEN** a user taps a player's LP, inputs "1000", and selects "-"
- **THEN** that player's LP is reduced to 7000 and the action is recorded in the Combat Log

### Requirement: User can view match timer
The system SHALL provide a startable/pausable countdown timer initialized to 40 minutes.

#### Scenario: Using the timer
- **WHEN** the user taps "Play" on the timer
- **THEN** the timer begins counting down from 40:00

### Requirement: User can view combat log
The system SHALL display a chronological list of all life point adjustments and RNG events.

#### Scenario: Viewing history
- **WHEN** a user adjusts LP or flips a coin
- **THEN** a new entry appears in the log detailing the action and the timestamp