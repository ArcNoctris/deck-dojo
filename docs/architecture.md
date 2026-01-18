# Architecture & Data Strategy

## 1. Database Schema (Supabase PostgreSQL)

The database is organized into 5 core tables, enabling a relational structure between Cards, Users, and their Decks.

### `cards` (Static Data / The Knowledge Base)
The central repository of all cards, ingested from YGOProDeck.
- **Key Fields:** `id` (YGOProDeck ID), `name`, `type`, `attribute`, `level`, `atk`, `def`, `description`, `image_url` (R2), `ban_status`.
- **Note:** `image_url` points to our Cloudflare R2 bucket, not the external source.

### `profiles` (User Profiles)
Linked 1:1 with Supabase Auth `users`.
- **Key Fields:** `id` (FK to auth.users), `username`, `belt_rank` (Gamification), `xp`.

### `decks` (The Loadouts)
Container for a user's deck.
- **Key Fields:** `id`, `user_id`, `name`, `format` (e.g., Advanced), `cover_card_id`, `is_public`, `win_rate`.

### `deck_cards` (The Tactical Context)
Join table linking Decks to Cards.
- **Key Fields:** `deck_id`, `card_id`, `location` (Main, Side, Extra), `quantity` (1-3).
- **Tactical Zen:** Includes `user_tag` for role definition (Starter, Extender, Brick, Engine, Flex, Defense).

### `matches` (The Analytics)
Record of duel performance.
- **Key Fields:** `user_id`, `deck_id`, `opponent_archetype`, `result` (Win/Loss/Draw), `went_first`.

---

## 2. Image Storage Strategy (Cloudflare R2)

We do not serve images directly from YGOProDeck to avoid hotlinking limits and ensure performance control.

- **Storage:** Cloudflare R2 (S3-compatible object storage).
- **Bucket:** `deckdojo-images`
- **Migration:**
  - Automated script `scripts/librarian/migrate-images-r2.ts` crawls the `cards` table.
  - Downloads missing images from YGOProDeck.
  - Uploads to R2.
  - Updates the `cards.image_url` in Supabase to the R2 public URL.
- **Naming Convention:** `cards/{id}.jpg` and `cards/{id}_small.jpg`.

---

## 3. App Router Structure (Next.js)

The application follows the Next.js 14+ App Router architecture.

```
app/
├── auth/           # Authentication routes (callbacks)
├── login/          # Login page
├── layout.tsx      # Root layout (Fonts, Providers, Navbar)
├── page.tsx        # Landing Page
└── globals.css     # Global Styles (Tailwind)
```

**Planned Structure:**
```
app/
├── dashboard/      # User Dashboard (Protected)
├── deck-builder/   # The Armory (Deck Editor)
│   └── [id]/       # Edit specific deck
└── profile/        # User Profile & Stats
```
