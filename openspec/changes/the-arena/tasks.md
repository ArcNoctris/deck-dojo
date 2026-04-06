## 1. Database & Schema

- [ ] 1.1 Create `matches` table in Supabase (id, user_id, deck_id, opponent_deck, match_result, going_first, notes, created_at).
- [ ] 1.2 Set up Row Level Security (RLS) policies for the `matches` table so users can only insert/select their own matches.
- [ ] 1.3 Add corresponding TypeScript types for the new database schema in `types/database.types.ts`.

## 2. Match Logger UI

- [ ] 2.1 Create server action `logMatch` to insert a new record into the `matches` table.
- [ ] 2.2 Create a Vaul `Drawer` or Radix `Dialog` component called `MatchLogger` with a form for match details.
- [ ] 2.3 Implement an autocomplete or combobox for the `opponent_deck` field within the logger.
- [ ] 2.4 Integrate the `MatchLogger` component into the Deck Dashboard and Deck Builder views.

## 3. Arena Dashboard

- [ ] 3.1 Create a new route for the Arena Dashboard (e.g., `/deck/[id]/arena`).
- [ ] 3.2 Implement a server action or data fetching layer to aggregate win rate data for a specific deck.
- [ ] 3.3 Create a `WinRateChart` component using Recharts to display overall performance.
- [ ] 3.4 Create a `MatchupSpread` component (table or chart) showing win rates per `opponent_deck`.

## 4. Meta-Report

- [ ] 4.1 Create a server action to query aggregated anonymized match data across all users (most popular decks, top win rates).
- [ ] 4.2 Create a global Meta-Report route/view (e.g., `/arena/meta`).
- [ ] 4.3 Display the aggregated trends in the Meta-Report view using charts and data tables.
