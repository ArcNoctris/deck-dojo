## Context

The Zen Deckdojo currently allows users to build decks and organize them. However, it lacks a system to track match outcomes and provide analytics on deck performance. The "Arena" phase aims to solve this by adding a match logging system and analytics dashboards to help players iterate on their decks based on actual game data.

## Goals / Non-Goals

**Goals:**
- Provide a database schema to accurately track match results tied to specific deck versions.
- Create a fast, intuitive UI ("Match Logger") to record games with minimal friction.
- Build visual dashboards (using libraries like Recharts) to display win rates and matchup data.

**Non-Goals:**
- Real-time live match integration (e.g., scraping master duel or other simulators). This relies entirely on manual user entry.
- In-depth turn-by-turn game analysis.

## Decisions

1. **Database Schema (Supabase)**:
   - Create a `matches` table linking to the user and their specific deck.
   - Fields will include `deck_id`, `opponent_deck` (string/enum), `result` (win, loss, draw), `going_first` (boolean), and `notes`.
   - *Rationale*: Supabase allows easy real-time tracking and row-level security (RLS) to ensure users only see their own matches unless aggregated for public meta reports.

2. **UI Implementation**:
   - The Match Logger will be implemented using a Drawer (Vaul) or Modal, accessible quickly from the Deck Dashboard or the specific Deck Builder view.
   - *Rationale*: Minimizes friction so players can log right after a game without navigating away.

3. **Data Visualization**:
   - Use `recharts` for charts (Win rate over time, Matchup pie/bar charts).
   - *Rationale*: It's a standard, well-supported React charting library that fits easily into the Next.js ecosystem.

## Risks / Trade-offs

- **Risk: User Friction** → Manual entry is tedious. *Mitigation: The Match Logger must be extremely fast, defaulting to the last used deck and providing quick-select options for popular opponent decks.*
- **Risk: Dirty Data** → Users typing random opponent deck names. *Mitigation: Use an autocomplete/combobox for `opponent_deck` based on known archetypes, but allow custom text as fallback.*
