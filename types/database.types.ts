export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cards: {
        Row: Card
        Insert: Card
        Update: Partial<Card>
      }
      profiles: {
        Row: Profile
        Insert: Profile
        Update: Partial<Profile>
      }
      decks: {
        Row: Deck
        Insert: Deck
        Update: Partial<Deck>
      }
      deck_cards: {
        Row: DeckCard
        Insert: DeckCard
        Update: Partial<DeckCard>
      }
      matches: {
        Row: Match
        Insert: Match
        Update: Partial<Match>
      }
    }
  }
}

export interface Card {
  id: number
  name: string
  type: string | null
  attribute: string | null
  level: number | null
  atk: number | null
  def: number | null
  description: string | null
  image_url: string | null
  image_url_small: string | null
  konami_id: number | null
  ban_status: string | null
  race: string | null
  archetype: string | null
  scale: number | null
  linkval: number | null
}

export interface Profile {
  id: string
  username: string | null
  belt_rank: number | null
  xp: number | null
  created_at: string | null
}

export interface Deck {
  id: string
  user_id: string
  name: string
  format: string | null
  cover_card_id: number | null
  is_public: boolean | null
  win_rate: number | null
  created_at: string | null
}

export interface DeckCard {
  id: string
  deck_id: string
  card_id: number
  location: 'main' | 'side' | 'extra' | null
  quantity: number | null
  user_tag: 'starter' | 'extender' | 'brick' | 'engine' | 'flex' | 'defense' | null
}

export interface Match {
  id: string
  user_id: string
  deck_id: string | null
  opponent_archetype: string | null
  result: 'win' | 'loss' | 'draw' | null
  went_first: boolean | null
  notes: string | null
  created_at: string | null
}
