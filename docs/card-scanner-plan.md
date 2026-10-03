# Card Scanner — Multi-Phase Plan

Status: proposal (not started). Goal: let people digitize physical collections fast, with **near-zero cost per scan**.

## Constraints

- **Cost:** well under 1 cent per detection. Default pipeline = **0 tokens, 0 server compute** (runs on the user's device). Any paid model call is an explicit, capped, opt-in fallback.
- **Two jobs, in priority order:** (1) the exact **printing** (set code like `LOB-EN001` + rarity), (2) the **card** itself as fallback. Konami's own scanner only solves (2).
- **Throughput:** multi-card photos (binder pages, flat lays) and bulk folders of images, plus a one-at-a-time repair flow for failures.
- **Later (phase two of the product):** inventory — "where do I store this card?".

## Key findings from the repo

- `cards` has **no printing data** (no set code / set name / rarity). The ingest script (`scripts/librarian/ingest.ts`) already pulls from YGOProDeck, whose `cardinfo` response includes a `card_sets` array (set name, set code, rarity). Ingesting it is the prerequisite for everything below.
- Images already live in R2, so card-art fingerprints can be computed once, offline, with a script.

## The core idea (why the small font is not a blocker)

Don't OCR the set code "blind". Resolve in two stages:

1. **Identify the card visually** (artwork fingerprint). This is cheap and robust to small print.
2. A card has only a handful of known printings (typically 1–40). OCR the set-code crop and **pick the closest candidate** by edit distance. A mangled read such as `L0B-EN0O1` still resolves to `LOB-EN001`. OCR only has to be "close enough", not perfect.

Phase 1 also tells us the card type (normal, Pendulum, Link, …), which selects the right **crop template** for where the set code is printed on that frame.

## Phases

### Phase 0 — Data foundation (small)
- New table `card_printings (id, card_id → cards.id, set_code, set_name, rarity, rarity_code)`; extend `ingest.ts` to upsert `card_sets`.
- Script that downloads each card's art, computes a fingerprint, and writes a compact index file (served statically, a few MB at most; brute-force matching over ~13k cards runs in milliseconds in the browser).
- Reserve (don't build yet) `user_cards` / `storage_locations` for the inventory phase.

### Phase 1 — Single card → which card (on-device)
- Input: photo upload first (camera UI comes later). Detect card quad → perspective-rectify to a canonical card rectangle.
- Fingerprint the artwork region: start with perceptual hash (tiny, no ML). If foil/glare hurts accuracy, upgrade to a small embedding model (MobileNet-class via `onnxruntime-web`, int8-quantized).
- Match against the static index. Fallback: OCR the card name.
- Output: card + confidence + top-3 candidates.

### Phase 2 — Printing detection (main priority)
- Crop the set-code region using the template for the detected card type; upscale, grayscale, contrast-normalize, try both polarities.
- OCR restricted to `A-Z 0-9 -` (Tesseract.js to start; swap in a small ONNX recognizer if needed).
- Fuzzy-match against that card's known printings; score = OCR similarity × uniqueness among candidates.
- **Rarity:** the set code usually pins it down. When several rarities share a code, show a one-tap chip (most common preselected). Automatic foil/holo classification is post-MVP.
- Optional signals: language code, "1st Edition" mark.

### Phase 3 — Multi-card images
- Binder pages (regular grids): grid/contour heuristics, no ML.
- Flat lays / irregular layouts: small card-detector model (YOLO-nano class, ONNX). Training data can be **synthetic** — composite card images onto backgrounds with perspective, glare and blur, so no hand labeling.
- Each crop runs through Phase 1 + 2 in Web Workers; results stream into the UI.

### Phase 4 — Bulk workflow & review queue
- Folder input (`webkitdirectory` / File System Access API), worker pool sized to CPU cores, progress + resumable "scan session".
- Results bucketed by confidence: **auto-accepted** / **needs confirmation** / **failed**.
- **Repair mode:** one card at a time — crop, top candidates, set-code input with autocomplete restricted to that card's printings, keyboard shortcuts, undo.
- Live camera mode: continuous scan, multi-frame voting to beat glare, auto-capture when the card is steady.
- Export (CSV/YDK-compatible lists) and "add to collection".

### Phase 5 — Optional capped LLM fallback
- Off by default. Only for a user-triggered "try harder" on a single failed crop, with a hard per-scan budget. A small-crop call to a small vision model should be a fraction of a cent, but verify current pricing before enabling.

### Phase 6 — Inventory (the stated "phase two")
- `user_cards (user_id, printing_id, condition, quantity, location_id)`, `storage_locations` (binder / box / slot).
- After a scan session: prompt for storage location, remember the last one ("same as previous"), bulk-assign per session.
- Wire into the Collection page (currently a stub) and "owned" indicators in the deck builder; prices from printing data.

## Cost model

| Path | Cost per scan |
|---|---|
| Phases 1–4 (default) | ~0 (client compute; one small DB write to save results) |
| Phase 5 fallback | opt-in, hard-capped |

## Risks & mitigations

- **Glare / sleeves / foils:** multi-frame voting, embedding fallback, ask for native-camera photos (not screenshots).
- **Tiny font:** candidate-constrained matching (above), crop upscaling.
- **Set-code position varies by frame type:** template table keyed by card type, built from real samples.
- **Alt arts / reprints with identical art:** printing resolved in Phase 2, not Phase 1.
- **Camera needs HTTPS on phones:** test on `deckdojo.app`, not the LAN dev URL.

## Validation

Build a benchmark of ~200 of the user's own cards photographed in realistic conditions (single, binder page, sleeves, foils). Track top-1 card accuracy and printing accuracy per phase; targets to confirm with real data: ≥98% card ID, ≥90% fully automatic printing, remainder through repair mode.

## Suggested first step

Spike Phases 0–2 on **uploaded photos only** (no camera, no multi-card) to measure real accuracy before investing in UI.
