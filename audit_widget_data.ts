import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

const prisma = new PrismaClient()

async function main() {
    console.log('--- Database Category Audit (Necklaces) ---')

    // Test: Simulated Widget Logic for Necklaces (OR condition)
    console.log('--- Simulating Widget Query for "necklace" ---')
    const simulated = await prisma.product.findMany({
        where: {
            OR: [
                { category: { equals: 'necklace', mode: 'insensitive' } },
                { category: { equals: 'necklaces', mode: 'insensitive' } },
                { category: { equals: 'Necklace', mode: 'insensitive' } },
                { category: { equals: 'Necklaces', mode: 'insensitive' } }
            ]
        }
    })
    console.log(`Query "necklace" (Simulated Logic): Found ${simulated.length}`)

    simulated.forEach(p => console.log(`- ${p.name} (${p.category})`))

    await prisma.$disconnect()
}

main()
