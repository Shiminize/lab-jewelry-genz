
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const slug = 'solaris-aura-ring'
    const newTitle = 'Solaris Aura Ring (DB Verified)'

    console.log(`Updating ${slug} title to: ${newTitle}`)

    await prisma.product.update({
        where: { slug },
        data: { name: newTitle }
    })

    console.log('Update complete.')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
