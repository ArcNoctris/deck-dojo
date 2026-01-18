import { createClient } from '@supabase/supabase-js'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const BATCH_SIZE = 50
const BATCH_DELAY = 200
const R2_BUCKET = 'deckdojo-images'
const SOURCE_BASE_URL = 'https://images.ygoprodeck.com/images/cards'
const SOURCE_SMALL_BASE_URL = 'https://images.ygoprodeck.com/images/cards_small'

const {
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_ENDPOINT,
  R2_PUBLIC_URL
} = process.env

if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ENDPOINT || !R2_PUBLIC_URL) {
  console.error('Missing required environment variables.')
  process.exit(1)
}

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const r2 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
        if (response.status === 404) {
            console.warn(`Image not found (404) at source: ${url}`)
            return null
        }
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.error(`Error downloading ${url}:`, error)
    return null
  }
}

async function uploadToR2(key: string, body: Buffer) {
  try {
    const command = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: body,
        ContentType: 'image/jpeg',
    })
    await r2.send(command)
  } catch (error) {
    console.error(`Error uploading to R2 (${key}):`, error)
    throw error
  }
}

async function processCard(card: { id: number; image_url: string | null; image_url_small: string | null }) {
  const updates: { image_url?: string; image_url_small?: string } = {}

  // 1. Process Main Image
  // Check if current URL is NOT on R2
  if (!card.image_url || !card.image_url.includes(R2_PUBLIC_URL!)) {
      const sourceUrl = `${SOURCE_BASE_URL}/${card.id}.jpg`
      const buffer = await downloadImage(sourceUrl)
      if (buffer) {
          const key = `cards/${card.id}.jpg`
          await uploadToR2(key, buffer)
          updates.image_url = `${R2_PUBLIC_URL}/${key}`
      }
  }

  // 2. Process Small Image
  // Check if current URL is NOT on R2
  if (!card.image_url_small || !card.image_url_small.includes(R2_PUBLIC_URL!)) {
      const sourceUrl = `${SOURCE_SMALL_BASE_URL}/${card.id}.jpg`
      const buffer = await downloadImage(sourceUrl)
      if (buffer) {
          const key = `cards/${card.id}_small.jpg`
          await uploadToR2(key, buffer)
          updates.image_url_small = `${R2_PUBLIC_URL}/${key}`
      }
  }

  // 3. Update DB
  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', card.id)

    if (error) {
      console.error(`Error updating DB for card ${card.id}:`, error)
    } else {
        console.log(`Recovered & Migrated card ${card.id} to R2`)
    }
  } else {
      console.log(`Skipped card ${card.id} (already on R2 or download failed)`)
  }
}

async function migrate() {
  console.log('Starting R2 Recovery Migration...')
  let totalProcessed = 0

  while (true) {
    // Select cards where image_url does NOT match R2_PUBLIC_URL
    const { data: cards, error } = await supabase
      .from('cards')
      .select('id, image_url, image_url_small')
      .not('image_url', 'ilike', `%${R2_PUBLIC_URL}%`)
      .limit(BATCH_SIZE)

    if (error) {
      console.error('Critical error fetching cards:', error)
      process.exit(1)
    }

    if (!cards || cards.length === 0) {
      console.log('No more cards to migrate. Recovery complete!')
      break
    }

    console.log(`Processing batch of ${cards.length} cards... (Total processed: ${totalProcessed})`)

    // Process concurrently
    await Promise.all(cards.map(processCard))

    totalProcessed += cards.length

    await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY))
  }
}

migrate().catch((err) => {
  console.error('Unhandled error:', err)
  process.exit(1)
})
