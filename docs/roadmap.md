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
- [ ] **Deck Dashboard:** View list of created decks.
- [ ] **Create New Deck:** Initialize a new empty deck.
- [ ] **Card Search Interface:**
    - [ ] Search bar with debounce.
    - [ ] Filters (Type, Attribute, Level).
    - [ ] Virtualized list for performance.
- [ ] **Deck Building Mechanics:**
    - [ ] Add card to Main/Side/Extra deck.
    - [ ] Remove card.
    - [ ] Card counts (max 3 rule).
- [ ] **Visual Deck View:** Grid view of current deck.
- [ ] **Save System:** Persist deck changes to Supabase.

## Phase 3: The Dojo (Sprint 3)
*Goal: Test decks and simulate hands.*
- [ ] Test Hand Simulator (Draw 5 cards).
- [ ] Combo Testing.

## Phase 4: The Arena (Sprint 4)
*Goal: Match tracking and analytics.*
- [ ] Match Result Logging.
- [ ] Win Rate Analytics.
