# Deck Dojo — Handoff (written 2026-10-03)

Everything a fresh Claude Code session needs to continue. The previous session's transcript is at
`C:\Users\patry\.claude\projects\C--CODE-zen-deckdojo\4d49a2a7-c37a-4fc5-96de-161041d047ca.jsonl`
(may not be readable from another account — this file is the source of truth).

## 1. What this is

**Deck Dojo** — phone-first Yu-Gi-Oh companion web app: deck builder (versions, YDK import/export, search/filters, "Oracle" recommendations), analysis, a two-device real-time LP/duel counter, and (planned) a card scanner + collection inventory.

- Repo: `C:\CODE\zen-deckdojo`, remote `git@github.com:ArcNoctris/deck-dojo.git`, branch `main`.
- Live: **https://deckdojo.app** (Vercel project `deck-dojo`, auto-deploys from GitHub `main`; domain bought at Porkbun, DNS points to Vercel).
- Backend: Supabase project `ttpuivargirsjvbidzdu` (Postgres, Auth, Realtime). Card images: Cloudflare R2.
- Stack: Next.js 16 (App Router, Turbopack), TypeScript, Tailwind v4 (CSS-first `@theme`, no tailwind.config), Zustand (+persist), TanStack Query, `@dnd-kit`, framer-motion, Headless UI / Radix, sonner toasts, lucide icons, recharts.
- Dev: `npm run dev` (binds 0.0.0.0, port 3000; `.claude/launch.json` has a `deckdojo-dev` config). Build: `npm run build` passes (13 routes). `npx tsc --noEmit` is clean.
- Env var **names** (values live in untracked `.env.local` / Vercel): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`; local-only for scripts: `SUPABASE_SERVICE_ROLE_KEY`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_PUBLIC_URL`.
  - **Rotate the Supabase service-role key and the R2 keys.** Their values were printed into the previous session transcript.

## 2. Working agreements with the user (Patryk)

- **Phone first.** Desktop must still look right (multi-breakpoint grids), but design for mobile.
- For design-heavy or ambiguous items the user wants a **proposal first**, then implementation. Page-by-page prioritisation uses **P1 = now, P2 = MVP-ready, P3 = after MVP**.
- **Commit as you go** (user asked for this); do not push without asking — a push redeploys production.
- **Cost-sensitive**: scanning must be ~0 tokens per scan (see `docs/card-scanner-plan.md`).
- Verify UI changes in a browser before claiming done. The sandboxed Browser pane cannot complete Google OAuth; the Claude-in-Chrome extension (user's real Chrome) is already logged in on both `localhost:3000` and `deckdojo.app`. Test login account: `patryk.preisner@gmail.com` (user said to always pick it; password is autofilled — never type passwords).
- Auto-mode classifier blocked running `ALTER TABLE` / reading `auth.users` via browser automation; the user ran DDL themselves in the Supabase SQL editor. Expect to hand DDL to the user.
- The user's messages are often voice-dictated; infer intent from context.

## 3. Current state

### Done (committed `84f24d2`, pushed, live)
Neon Arcade redesign: Home Hub, Decks list (favorite/duplicate/archive/delete), Duel Room overhaul, Builder (inline Deck/Search tabs, dnd-kit reorder, chip-based full-screen filter sheet with searchable dropdowns for Archetype & Race), Analysis page, stubs for Profile/Collection.

### Done but UNCOMMITTED at time of writing (see `git status`)
- Responsive card grids (`grid-cols-3 sm:4 md:5 lg:6 xl:8`) in `VirtualCardList.tsx` and `DeckContentView.tsx` — verified in browser.
- **YDK export**: `buildYDK()` in `utils/ydk-parser.ts` + "EXPORT YDK" item in `DeckHeader.tsx` menu (client-side blob download).

### Deployment / auth fixes made this session
- Supabase Auth → URL Configuration: Site URL `https://deckdojo.app`; Redirect URLs `https://deckdojo.app/auth/callback` and `http://localhost:3000/auth/callback`.
- Root cause of "Database error saving new user": UNIQUE index `profiles_username_key` collided because the signup trigger `handle_new_user()` copies the Google display name into `profiles.username`. User dropped the constraint. Login now works end to end on prod (verified: session cookies `sb-…-auth-token.0/.1` present).
- `app/auth/callback/route.ts` also self-heals a missing `profiles` row.

### Known issues / to verify
- **Security: RLS is DISABLED on `public.profiles`** (`relrowsecurity=false`). Audit RLS on every table (decks, deck_versions, version_cards, matches, …) before public launch. This is a P1 item.
- `middleware.ts` uses the deprecated convention (Next 16 wants `proxy`); builds fine, low priority.
- Login page (`app/login/page.tsx`) and the Arena pages still use the OLD "Neon Noir" tokens.
- Unsaved junk query tabs in the Supabase SQL editor; the "Auto-create user profile on signup" snippet there has an accidental unsaved edit — do not save it.
- Card data has no set/printing info (see scanner plan).

## 4. Design system (current)

Source: `app/globals.css`, `app/layout.tsx`. Two token generations coexist:

**Neon Arcade (use for all new work)** — `--color-arcade-*`:
`bg #050709`, `surface #0A0E14`, `panel #131A24`, `inset #1C2530`, `border #2A3644`, `text #E8EEF4`, `text-muted #93A4B4`, `cyan #19D3CE` (primary accent), `cyan-light #5FF0EC`, `purple #7C5CFF`, `magenta #FF3DA6`, `green #35D07F`, `amber #FFC53D`, `red #FF3B5C`.
**Legacy Neon Noir** (Login, Arena, some Duel bits): `navy-950 #050608`, `navy-900 #0B0C10`, `navy-800 #1F2833`, `cyan-500 #08D9D6`, `red-500 #FF2E63`, `amber-400 #F9ED69`; aliases `void-black`, `gunmetal-grey`, `strike-red`, `neon-cyan`, `focus-amber`.

**Fonts** (CSS vars set on `<html>` — they must stay on `<html>`, not `<body>`): Rajdhani (`--font-heading`, headings/labels), JetBrains Mono (`--font-mono`, body default), Press Start 2P (`--font-pixel`, LP numbers / "COMING NEXT"), Barlow (`--font-arcade-body`).

**Visual language:** near-black navy surfaces, 1px `arcade-border` outlines, cyan glow accents, small uppercase mono section labels with wide tracking (`text-[10px] tracking-widest`, cyan), chamfered/notched corners (`clip-notch`, `clip-notch-sm`, `chamfered`), L-shaped corner brackets on nav cards, rounded-lg panels (`panel` bg + `border`), full-screen sheets for pickers/filters, pixel-font LP digits, blurred drifting colour blobs and a hero-art background on Home (`/public/duel/hero-p1.png`, `hero-p2.png`).

**Existing animations** (keyframes in globals.css): `arcadeLogoIn`, `arcadeBarFill`, `arcadeRingSpin`, `arcadeDrift1/2`, `arcadeRainbow`, `arcadeAccIn`; plus an LP tween (`hooks/useLpTween.ts`), add-to-deck flash/check, Headless UI transitions.

**Components:** `components/ui/` (`NavCard`, `StatTile`, `CardArtCrop`, `CyberCard`, `Button`, `Badge`, `Input`), builder in `components/builder/`, duel in `components/duel/`, dashboard in `components/dashboard/`.

**User verdict:** "not fully happy… a bit boring". Wants prettier, more interesting visuals and noticeably better animations.

## 5. Routes

`/` Home Hub · `/login` (Google only; old styling) · `/dashboard/decks` · `/deck/[id]` Builder · `/deck/[id]/analysis` · `/duel` · `/profile` (stub + working Log Out) · `/collection` (stub) · `/arena`, `/deck/[id]/arena` (old styling; **user: omit Arena for now** — Home still shows an ARENA tile and GameNav still links it; hide those) · `/dashboard` redirects to `/`.

Key code: `store/builder-store.ts` (persisted deck draft only; filters/UI state intentionally not persisted — version 1 + `partialize`), `store/duel-store.ts`, `hooks/useDuelSync.ts`, `utils/supabase/queries.ts` (`searchCards`), `app/deck/[id]/actions.ts`, `scripts/librarian/` (`ingest.ts`, `migrate-images-r2.ts`).

## 6. Backlog, in the order the user wants it

User order: **deck building first, then items 1–7**. Within deck building: desktop grid fix (done) → tools menu redesign.

**A. Deck builder tools redesign (item 6)** — The 3-dots Headless UI menu in `DeckHeader.tsx` is structurally buggy: it nests a version `<select>` and modal-trigger buttons (`MatchLoggerModal`, `TestHandModal`) inside `Menu.Item`s, and it doesn't match the design. Proposal given (not yet approved/built): replace with a full-screen **DECK TOOLS** sheet (same pattern as the filter sheet) with sections VERSION, FORMAT, IMPORT YDK, EXPORT YDK, TEST HAND, LOG MATCH, DECK SETTINGS; each opens its own modal after closing the sheet. Consider a dedicated Test Hand icon in the header (user calls it crucial). User wants to see the proposal before refinements.

**1. Player settings page (`/profile`)** — avatar upload (reuse R2 pattern), edit display name (`profiles.username`; now non-unique), log out (exists), plus recommended: default deck format, duel defaults (start LP, timer), delete account, linked login methods.

**2. Arena** — omit for now (hide Home tile / nav link).

**3. Duel/LP polish + competitor comparison** — competitor research (Duel Connect, Counterspell, Playgroup, Lifetap, Archidekt, Moxfield, 17Lands) says: QR/code pairing without accounts (have), asymmetric focus-me layout, turn indicator, editable history, reconnect resilience that restores exact state, persisted match history linked to deck version. Test the app for visual appeal/ease/feature set.

**4. Duel sync / focus-me** — Tested live on prod: basic two-device sync and late-join state recovery already WORK (broadcast `sync_state` + `request_state` in `useDuelSync.ts`). Missing (new work): per-device player identity/slot, Supabase **Presence** to detect "2 players joined", personalised view (my LP large, opponent small), two-way sync of both. Current store has only shared `lp1/lp2`; no "me" concept.

**5. Auth** — Email provider is already enabled in Supabase (and "Confirm email" is on): add email/password forms to `/login` + handle confirmation redirect. Discord is a realistic second OAuth. Konami/official accounts are not feasible (no public identity API). For tournaments consider a no-account quick-session mode.

**7. Analysis / Lab** — Currently only type breakdown, top-3 opening-hand odds by quantity, and an archetype synergy score. Wanted: card tags (starter/extender/brick/engine/flex/hand-trap/defense — **already exist** via `CardContextMenu` + `UserTag`) wired into hypergeometric odds (≥1 starter, brick-free hand…; math in `utils/math/hypergeometric.ts`); deck-specific match history/win rate from the existing `matches` table; later: community archetype usage %, pricing, improvement suggestions, playtest with mulligan. Usage % and pricing depend on data pipelines that don't exist yet.

**B. Card scanner** — Full phased plan in `docs/card-scanner-plan.md` (on-device, ~0 cost/scan; identify card by art fingerprint, then pick printing by fuzzy-matching OCR of the set code against that card's known printings; multi-card images; bulk folder + review/repair queue; optional capped LLM fallback; later inventory). Prerequisite: ingest `card_sets` (set code/name/rarity) into a new `card_printings` table. Suggested first step: spike phases 0–2 on uploaded photos with ~50–200 of the user's own cards as a benchmark.
  - **Platform decision (user):** phone-first; prefers a **browser app (PWA) + backend**; open to native only if there are clear benefits. Recommendation: stay web/PWA (camera via `getUserMedia` over HTTPS, WASM/ONNX in Web Workers); revisit a Capacitor wrapper only if camera control or background processing proves limiting.

**C. Design refresh** — Gather inspiration for a prettier, more interesting look on top of the current scheme and a much stronger animation layer; look for sources/endpoints for animations (candidates to evaluate, none verified yet: Lottie/LottieFiles, Rive, framer-motion presets, React Bits, Magic UI, Aceternity UI, CSS View Transitions). Produce a proposal with mock directions before changing screens.

**D. Background jobs for MVP** — (1) automate card + banlist sync (script exists but manual and full-catalog; no scheduler; `ban_status` only refreshed by re-running `npm run ingest`), (2) tournament/meta scraping (does not exist; needs a data-source decision, check legality/robots), (3) Oracle recommendation redesign (today: archetype/attribute frequency only) fed by tournament + community deck data. To be defined in detail after the above.

**E. Page-by-page P1/P2/P3 pass** — only Home Hub done so far (no P1 blockers; P2: real Profile page, hide Arena; P3: Collection). Continue with Decks, Builder, Analysis, Duel, Profile, Login.

**F. Housekeeping** — `docs/roadmap.md` is stale (shows Phase 4 Arena unchecked although it was implemented and archived under `openspec/changes/archive/2026-04-06-the-arena`); `openspec/changes/deck-builder-v2` and `duel-room` are 100% done but not archived.

## 7. Parallel-work plan the user suggested

The lead session coordinates; one or more additional sessions each build an isolated feature (e.g. scanner spike, design refresh, duel presence). Use separate git worktrees/branches per session, small commits, and merge via the lead. Don't let two sessions edit the same files (e.g. `DeckHeader.tsx`, `globals.css`).

## 8. Starter prompt for the new chat

> Read `docs/HANDOFF.md` and `docs/card-scanner-plan.md` first, then run `git status`. Continue with section 6 in the stated order: commit the pending grid + YDK-export changes, then propose/implement the Deck Tools sheet (A). Ask before pushing to `main` (it redeploys production).
