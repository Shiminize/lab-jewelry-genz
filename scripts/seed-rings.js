const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

require('dotenv').config({ path: '.env.local' })
require('dotenv').config()

const ringSeedPath = path.resolve(__dirname, '../seed_data/ring_products.json')

async function main() {
    console.log('[seed-rings] Connecting to Prisma...')

    if (!fs.existsSync(ringSeedPath)) {
        console.error(`[seed-rings] File not found: ${ringSeedPath}`)
        process.exit(1)
    }

    const raw = fs.readFileSync(ringSeedPath, 'utf8')
    const rawData = JSON.parse(raw)
    const products = rawData.products || []

    console.log(`[seed-rings] Found ${products.length} rings in seed file.`)

    for (const p of products) {
        // Map JSON structure to Prisma schema
        // Assuming schema has: slug, name, category, basePrice, heroImage, description, etc.
        // We'll upsert by slug to avoid duplicates

        await prisma.product.upsert({
            where: { slug: p.slug || p.id },
            update: {
                name: p.name || p.title,
                category: 'ring',
                basePrice: p.base_price || p.price || 0,
                heroImage: p.image || p.heroImage || 'https://res.cloudinary.com/dgyf0osrx/image/upload/v1766405142/glowglitch/categories/rings/sample.jpg',
                description: p.description,
                metadata: {
                    readyToShip: p.readyToShip,
                    tags: p.tags
                },
                status: 'active'
            },
            create: {
                slug: p.slug || p.id,
                name: p.name || p.title,
                sku: p.id, // ID from JSON as SKU
                category: 'ring',
                basePrice: p.base_price || p.price || 0, // Handle snake_case from JSON
                currency: 'USD',
                heroImage: p.image || p.heroImage || 'https://res.cloudinary.com/dgyf0osrx/image/upload/v1766405142/glowglitch/categories/rings/sample.jpg', // Default image if missing
                description: p.description,
                metadata: {
                    readyToShip: p.readyToShip,
                    tags: p.tags
                },
                status: 'active',
                inventory: 50
            }
        })
    }

    console.log('[seed-rings] Seeding complete.')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
