## ADDED Requirements

### Requirement: User can view overall deck win rate
The system SHALL display the aggregated win rate for a selected deck based on its logged matches.

#### Scenario: Viewing deck stats
- **WHEN** the user navigates to the Arena dashboard for a deck
- **THEN** they see their total wins, losses, draws, and overall win percentage

### Requirement: User can view matchup spreads
The system SHALL visualize how a deck performs against different specific opponent decks.

#### Scenario: Viewing matchup charts
- **WHEN** the user opens the Arena dashboard
- **THEN** a chart or table displays win rates broken down by each recorded `opponent_deck`

### Requirement: User can view meta-report aggregates
The system SHALL aggregate anonymized match data to show meta trends (most played decks, highest win rate decks).

#### Scenario: Viewing meta trends
- **WHEN** the user navigates to the global Meta-Report section
- **THEN** the system displays aggregated data of the most frequently faced opponent decks and their global win rates
