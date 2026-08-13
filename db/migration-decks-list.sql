-- Decks List screen: favorite/archive support

ALTER TABLE decks ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;
ALTER TABLE decks ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;
