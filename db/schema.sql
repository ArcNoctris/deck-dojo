-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Static Data (The Knowledge Base)
create table cards (
  id bigint primary key, -- Matches YGOProDeck ID
  name text not null,
  type text,
  attribute text,
  level int,
  atk int,
  def int,
  description text, -- Renamed from desc to avoid reserved keyword
  image_url text,
  image_url_small text,
  konami_id int,
  ban_status text default 'Unlimited'
);

-- 2. User Profiles (Linked to Auth)
create table profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  belt_rank int default 1, -- 1 = White Belt (Visualized as a gradient)
  xp int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Decks (The Loadouts)
create table decks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  name text not null,
  format text default 'Advanced',
  cover_card_id bigint references cards(id),
  is_public boolean default false,
  win_rate numeric default 0.0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Deck Versions (Git-Style Versioning)
create table deck_versions (
  id uuid default uuid_generate_v4() primary key,
  deck_id uuid references decks(id) not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Version Cards (Snapshot of cards in a version)
create table version_cards (
  id uuid default uuid_generate_v4() primary key,
  version_id uuid references deck_versions(id) not null,
  card_id bigint references cards(id) not null,
  location text check (location in ('main', 'side', 'extra')),
  quantity int default 1 check (quantity <= 3)
);

-- 6. Deck Card Tags (Persistent Tags across versions)
create table deck_card_tags (
  deck_id uuid references decks(id) not null,
  card_id bigint references cards(id) not null,
  tag text check (tag in ('starter', 'extender', 'brick', 'engine', 'flex', 'defense')),
  primary key (deck_id, card_id)
);

-- 7. Matches (The Analytics)
create table matches (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  deck_id uuid references decks(id),
  opponent_archetype text,
  result text check (result in ('win', 'loss', 'draw')),
  went_first boolean,
  notes text, -- Side deck notes
  created_at timestamp with time zone default timezone('utc'::text, now())
);
