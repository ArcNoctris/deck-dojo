# Project Roadmap

## Phase 1: Foundation (Sprint 1)
- [x] **Project Initialization** (Next.js, Tailwind, Supabase)
- [x] **Database Schema Design** (Cards, Decks, Profiles)
- [x] **Card Ingestion System** ("The Librarian" Script)
- [x] **Image Migration Strategy** (YGOProDeck -> Cloudflare R2)
- [x] **Authentication** (Supabase Auth / Google Login)

## Phase 2: The Armory (Sprint 2)
*Goal: Build the core Deck Builder interface where users can search cards and construct decks.*

- [x] **Design System Foundation:** Tailwind config, Colors, UI Atoms.
- [x] **State Management (Deck Store):** Zustand store, Types, Validation Logic.
- [x] **Deck Dashboard:** View list of created decks.
- [x] **Create New Deck:** Initialize a new empty deck (Server Action).
- [x] **Card Drawer & Virtual List:** Vaul Drawer, Virtual List, Search Logic.
- [x] **Card Search Interface:**
    - [x] Search bar with debounce.
    - [x] Filters (Type, Attribute, Level).
    - [x] Virtualized list for performance.
- [x] **Deck Building Mechanics:**
    - [x] Add card to Main/Side/Extra deck.
    - [x] Remove card.
    - [x] Card counts (max 3 rule).
- [x] **Visual Deck View:** Workbench Grid, Tabs, Empty States.
- [x] **Save System:** Persist deck changes (Server Actions, Hydration, Save Logic).

### Sprint 2.6: Polish & UX
- [x] **View Engine** (Grid/List/Compact Modes)
- [x] **"Command Center" Layout Refactor**
- [x] **Card Interactions** (Context Menu/Side Decking)
- [x] **Validation Console** (Banlist & Limits)

## Phase 3: The Dojo (Sprint 3)
*Goal: Test decks and simulate hands (Simulation & Math).*

- [ ] **Task 3.1: The Shuffle Engine (Test Hand Simulator)**
- [ ] **Task 3.2: The Combo Tester (Playmat Logic)**
- [ ] **Task 3.3: Hypergeometric Calculator**
- [ ] **Task 3.4: Deck Analysis Dashboard**

## Phase 4: The Arena (Sprint 4)
*Goal: Match tracking and analytics.*
- [ ] Match Result Logging.
- [ ] Win Rate Analytics.
