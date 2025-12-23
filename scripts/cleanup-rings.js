const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

require('dotenv').config({ path: '.env.local' })
require('dotenv').config()

async function main() {
    console.log('[cleanup] Connecting to Prisma...')

    // IDs from ring_products.json that we seeded
    const seededIds = [
        'ring-001', 'ring-002', 'ring-003', 'ring-004',
        'ring-005', 'ring-006', 'ring-007', 'ring-008'
    ]

    const { count } = await prisma.product.deleteMany({
        where: {
            slug: { in: seededIds }
        }
    })

    console.log(`[cleanup] Deleted ${count} seeded products.`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
