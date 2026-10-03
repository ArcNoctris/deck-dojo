# Deck Dojo

Phone-first Yu-Gi-Oh companion (Next.js 16 App Router, Tailwind v4, Supabase, Zustand). Live at https://deckdojo.app (Vercel, auto-deploys from `main`).

**Start here:** read `docs/HANDOFF.md` (state, design system, backlog in priority order, working agreements) and `docs/card-scanner-plan.md`.

## Rules of thumb
- Use the `--color-arcade-*` tokens for all new UI; legacy navy/cyan tokens are only for not-yet-redesigned screens.
- Design phone-first, but keep desktop sensible (use `sm/md/lg/xl` grid breakpoints).
- Commit as you go; never push to `main` without asking (push = production deploy).
- Never put secrets in the repo; `.env*` is gitignored. Don't type passwords or API keys into web forms.
- Check changes in a browser before reporting them done. `npx tsc --noEmit` and `npm run build` should stay clean.
