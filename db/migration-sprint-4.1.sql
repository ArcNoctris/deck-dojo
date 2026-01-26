-- Sprint 4.1: Match Database Schema

-- Drop existing matches table if it exists (recreating to ensure schema match)
drop table if exists matches;

create table matches (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  deck_version_id uuid references deck_versions(id) on delete cascade not null,
  opponent_deck text,
  result text check (result in ('win', 'loss', 'draw')),
  going_first boolean,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS Policies
alter table matches enable row level security;

create policy "Users can view their own matches"
  on matches for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own matches"
  on matches for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own matches"
  on matches for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own matches"
  on matches for delete
  using ( auth.uid() = user_id );
