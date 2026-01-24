-- Sprint 2.5, Task A - Database Schema Upgrade (Rich Data)
-- Adding columns for extended card information

ALTER TABLE cards ADD COLUMN IF NOT EXISTS race text;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS archetype text;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS scale int;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS linkval int;
