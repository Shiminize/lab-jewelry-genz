
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const count = await prisma.product.count()
    console.log(`Total Products: ${count}`)

    const products = await prisma.product.findMany({
        select: {
            name: true,
            sku: true,
            basePrice: true,
            materials: true
        },
        orderBy: { name: 'asc' }
    })

    console.log('--- Product List ---')
    products.forEach(p => {
        console.log(`[${p.sku}] ${p.name} - $${p.basePrice}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
