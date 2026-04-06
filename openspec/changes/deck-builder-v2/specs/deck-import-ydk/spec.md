## ADDED Requirements

### Requirement: System can parse YDK strings
The system SHALL accept a standard YDK formatted string and convert it into a list of Konami IDs separated by zone (main, extra, side).

#### Scenario: Parsing standard YDK
- **WHEN** the system receives a string containing `#main`, `#extra`, and `!side` headers with IDs
- **THEN** it correctly groups the IDs into the respective arrays

### Requirement: User can import YDK to builder
The system SHALL allow users to paste a YDK string to instantly populate the builder store with the corresponding cards.

#### Scenario: Successful import
- **WHEN** the user pastes a valid YDK string into the import modal
- **THEN** the builder store is populated with the retrieved cards, and a success message is shown

#### Scenario: Partial import
- **WHEN** the user imports a YDK containing IDs that do not exist in the database
- **THEN** the system imports all valid cards and alerts the user about the missing cards