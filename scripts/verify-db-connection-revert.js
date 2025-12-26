
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const slug = 'solaris-aura-ring'
    const originalTitle = 'Solaris Aura Ring'

    console.log(`Reverting ${slug} title to: ${originalTitle}`)

    await prisma.product.update({
        where: { slug },
        data: { name: originalTitle }
    })

    console.log('Revert complete.')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
