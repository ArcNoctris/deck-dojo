import { createClient } from '@supabase/supabase-js'

const API_URL = 'https://db.ygoprodeck.com/api/v7/cardinfo.php'
const BATCH_SIZE = 500

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface YgoProCard {
  id: number
  name: string
  type: string
  desc: string
  attribute?: string
  level?: number
  atk?: number
  def?: number
  card_images: {
    image_url: string
    image_url_small: string
  }[]
  banlist_info?: {
    ban_tcg?: string
  }
}

interface YgoProResponse {
  data: YgoProCard[]
}

async function fetchCards(): Promise<YgoProCard[]> {
  console.log('Fetching cards from YGOProDeck API...')
  const response = await fetch(API_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch cards: ${response.statusText}`)
  }
  const json = (await response.json()) as YgoProResponse
  return json.data
}

async function ingest() {
  try {
    const cards = await fetchCards()
    console.log(`Fetched ${cards.length} cards. Starting ingestion...`)

    let processedCount = 0

    for (let i = 0; i < cards.length; i += BATCH_SIZE) {
      const chunk = cards.slice(i, i + BATCH_SIZE)
      const formattedChunk = chunk.map((card) => ({
        id: card.id,
        name: card.name,
        type: card.type,
        attribute: card.attribute || null,
        level: card.level || null,
        atk: card.atk || null,
        def: card.def || null,
        description: card.desc,
        image_url: card.card_images[0]?.image_url || null,
        image_url_small: card.card_images[0]?.image_url_small || null,
        ban_status: card.banlist_info?.ban_tcg || 'Unlimited',
      }))

      const { error } = await supabase.from('cards').upsert(formattedChunk)

      if (error) {
        console.error(`Error upserting batch ${i / BATCH_SIZE + 1}:`, error)
      } else {
        processedCount += chunk.length
        console.log(`Processed ${processedCount}/${cards.length} cards...`)
      }
    }

    console.log('Ingestion complete!')
  } catch (err) {
    console.error('Ingestion failed:', err)
    process.exit(1)
  }
}

ingest()
