const { PrismaClient } = require('@prisma/client')
require('dotenv').config({ path: '.env.local' })
const prisma = new PrismaClient()

async function main() {
    const product = await prisma.product.findFirst({
        where: { name: 'Chaos Ring' }
    })
    console.log('Chaos Ring Product:', product)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
