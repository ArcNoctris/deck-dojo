## 1. Game Navigation & Start Menu

- [x] 1.1 Refactor the welcome page (`/`) into a video-game style "Start Menu" (e.g., stylized main menu options, "Press Start" aesthetics, Neon Noir flair).
- [x] 1.2 Add main menu navigation links to all developed areas: "The Armory" (Deck Dashboard), "The Dojo" (Test Hand/Simulator), and "The Arena" (Match Logger).
- [x] 1.3 Implement a global "HUD" or "Pause Menu" style navigation overlay to replace traditional website navbars, ensuring the game flair persists across all routes.

## 2. Database & Schema

- [x] 2.1 Create `matches` table in Supabase (id, user_id, deck_id, opponent_deck, match_result, going_first, notes, created_at).
- [x] 2.2 Set up Row Level Security (RLS) policies for the `matches` table so users can only insert/select their own matches.
- [x] 2.3 Add corresponding TypeScript types for the new database schema in `types/database.types.ts`.

## 3. Match Logger UI

- [x] 3.1 Create server action `logMatch` to insert a new record into the `matches` table.
- [x] 3.2 Create a Vaul `Drawer` or Radix `Dialog` component called `MatchLogger` with a form for match details.
- [x] 3.3 Implement an autocomplete or combobox for the `opponent_deck` field within the logger.
- [x] 3.4 Integrate the `MatchLogger` component into the Deck Dashboard and Deck Builder views.

## 4. Arena Dashboard

- [x] 4.1 Create a new route for the Arena Dashboard (e.g., `/deck/[id]/arena`).
- [x] 4.2 Implement a server action or data fetching layer to aggregate win rate data for a specific deck.
- [x] 4.3 Create a `WinRateChart` component using Recharts to display overall performance.
- [x] 4.4 Create a `MatchupSpread` component (table or chart) showing win rates per `opponent_deck`.

## 5. Meta-Report

- [x] 5.1 Create a server action to query aggregated anonymized match data across all users (most popular decks, top win rates).
- [x] 5.2 Create a global Meta-Report route/view (e.g., `/arena/meta`).
- [x] 5.3 Display the aggregated trends in the Meta-Report view using charts and data tables.