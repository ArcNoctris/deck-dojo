# Product Vision: Tactical Zen / Neon Noir

**Tactical Zen** is the guiding philosophy of Deck Dojo. It represents the perfect balance between calm, focused strategy and the high-energy, neon-soaked intensity of competitive play. The interface is stripped of clutter, providing a "zen" state for deck building, while the aesthetics—sharp angles, high contrast, and glowing accents—evoke a futuristic "Neon Noir" cyberpunk atmosphere.

It is not just a deck builder; it is a dojo where duelists hone their craft with surgical precision.

## Personas

*[To Be Defined - Please add specific personas here]*
<!-- Example placeholders
1. **The Architect:** A meticulous strategist who spends hours optimizing ratios and probability. They need advanced stats and sorting.
2. **The Ronin:** A competitive player who adapts quickly to the meta. They need fast deck importing and side-decking tools.
-->

## Tech Stack

### Core Framework
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS 4
- **UI/UX Theme:** "Neon Noir" (Gunmetal Grey, Neon Cyan, Strike Red, Focus Amber)

### Backend & Data
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Cloudflare R2 (Images)
- **Data Source:** YGOProDeck API (Ingestion)

### Infrastructure
- **Hosting:** Vercel (likely)
- **Image Delivery:** R2 Public Bucket
