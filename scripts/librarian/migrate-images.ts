import { createClient } from '@supabase/supabase-js'

const BATCH_SIZE = 50
const BATCH_DELAY = 100
const BUCKET_NAME = 'card-images'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function downloadImage(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`)
  }
  return await response.arrayBuffer()
}

async function uploadToStorage(filename: string, buffer: ArrayBuffer) {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, buffer, {
      contentType: 'image/jpeg',
      upsert: true,
    })

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`)
  }
}

async function processCard(card: { id: number; image_url: string | null; image_url_small: string | null }) {
  const updates: { image_url?: string; image_url_small?: string } = {}

  // Process main image
  if (card.image_url && card.image_url.includes('ygoprodeck')) {
    try {
      const buffer = await downloadImage(card.image_url)
      const filename = `${card.id}.jpg`
      await uploadToStorage(filename, buffer)
      updates.image_url = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filename}`
    } catch (err) {
      console.error(`Error processing main image for card ${card.id}:`, err)
    }
  }

  // Process small image
  if (card.image_url_small && card.image_url_small.includes('ygoprodeck')) {
    try {
      const buffer = await downloadImage(card.image_url_small)
      const filename = `${card.id}_small.jpg`
      await uploadToStorage(filename, buffer)
      updates.image_url_small = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filename}`
    } catch (err) {
      console.error(`Error processing small image for card ${card.id}:`, err)
    }
  }

  // Update DB if we have new URLs
  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', card.id)

    if (error) {
      console.error(`Error updating DB for card ${card.id}:`, error)
    }
  }
}

async function migrateImages() {
  console.log('Starting image migration...')
  console.log(`Target Bucket: ${BUCKET_NAME}`)

  let totalProcessed = 0

  while (true) {
    // 1. Fetch batch
    const { data: cards, error } = await supabase
      .from('cards')
      .select('id, image_url, image_url_small')
      .ilike('image_url', '%ygoprodeck%')
      .limit(BATCH_SIZE)

    if (error) {
      console.error('Critical error fetching cards:', error)
      process.exit(1)
    }

    if (!cards || cards.length === 0) {
      console.log('No more cards to migrate. Migration complete!')
      break
    }

    console.log(`Processing batch of ${cards.length} cards... (Total processed so far: ${totalProcessed})`)

    // 2. Process each card
    await Promise.all(cards.map((card) => processCard(card)))

    totalProcessed += cards.length

    // 3. Rate limit delay
    await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY))
  }
}

migrateImages().catch((err) => {
  console.error('Unhandled error in migration script:', err)
  process.exit(1)
})
