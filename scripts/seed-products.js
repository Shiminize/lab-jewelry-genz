const path = require('node:path')
const fs = require('node:fs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

require('dotenv').config({ path: '.env.local' })
require('dotenv').config()

const ACCENT_TONES = ['volt', 'cyan', 'magenta', 'lime']

const jsonSeedPath = path.resolve(process.cwd(), 'seed_data', 'production_products.json')

function slugify(value, fallback) {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
  return fallback
}

function loadJsonSeed() {
  try {
    if (!fs.existsSync(jsonSeedPath)) {
      console.warn(`[db:seed] File not found: ${jsonSeedPath}`)
      return []
    }
    const raw = fs.readFileSync(jsonSeedPath, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed?.products) ? parsed.products : []
  } catch (error) {
    console.warn('[db:seed] Failed to read JSON seed file', error)
    return []
  }
}

function buildProductData(raw, index) {
  const fallbackSlug = `product-${index}`
  // Use slug, or slugify the name, or fallback
  const slug = slugify(raw.slug || raw.name, fallbackSlug)

  const basePrice = raw.pricing?.basePrice ?? 0
  const materials = raw.materials ? raw.materials.map(m => m.name || m) : []

  // Normalize gemstones, dimensions, care if they exist
  const gemstones = raw.gemstones ? raw.gemstones.map(g => g.name || g) : []
  const dimensions = raw.dimensions || []
  const care = raw.care || []

  const tagline = raw.metadata?.tagline || raw.description.slice(0, 50)
  const collections = raw.metadata?.collections || []

  const inventory = {
    quantity: 50,
    reserved: 0,
    available: 50
  }

  const metadata = {
    tagline,
    accentTone: raw.metadata?.accentTone || ACCENT_TONES[index % ACCENT_TONES.length],
    customization: raw.metadata?.customization,
    readyToShip: raw.metadata?.readyToShip ?? true,
    featuredInWidget: raw.metadata?.featuredInWidget ?? false
  }

  // description logic
  let description = raw.description || ''
  if (raw.metadata?.readyToShip) description += ' Ready to Ship.'
  if (raw.category) description += ' ' + raw.category + '.'

  return {
    slug,
    sku: raw.sku || `SKU-${index}`,
    name: raw.name,
    description: description,
    story: raw.story || '',
    category: raw.category || 'Jewelry',
    basePrice: basePrice,
    currency: 'USD',
    heroImage: raw.images?.primary || '',
    gallery: [], // Assuming we don't have separate gallery URL list in seed yet
    materials,
    gemstones,
    dimensions,
    care,
    status: 'active',
    featured: index < 4,
    bestseller: false,
    collections,
    inventory: inventory.available,
    metadata
  }
}

async function main() {
  console.log('[db:seed] Connecting to Prisma...')

  const seedSources = loadJsonSeed()
  if (seedSources.length === 0) {
    console.warn('[db:seed] No seed documents found.')
    return
  }

  // Clear existing products
  await prisma.product.deleteMany({})
  console.log('[db:seed] Cleared products table.')

  for (const [index, raw] of seedSources.entries()) {
    const data = buildProductData(raw, index)
    await prisma.product.create({ data })
  }

  console.log(`[db:seed] Successfully seeded ${seedSources.length} products.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
