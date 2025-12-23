
import { PrismaClient } from '@prisma/client'
import dotEnv from 'dotenv'

dotEnv.config({ path: '.env.local' })
dotEnv.config()

import { addItemToCart, getCart, removeItemFromCart } from '../src/services/neon/cartService'
import prisma from '../src/lib/prisma'

async function main() {
    console.log('[Verify] Starting Cart Database Verification...')

    // 1. Generate a Test Cart ID
    const testCartId = `test-cart-${Date.now()}`
    console.log(`[Verify] Using Cart ID: ${testCartId}`)

    try {
        // 2. Add an Item
        // We use a known slug from the seed data
        const slug = 'array-8-bar-studs'
        console.log(`[Verify] Adding item: ${slug}`)

        const cartAfterAdd = await addItemToCart(testCartId, slug, 2)
        console.log('[Verify] Item added. Cart Summary:', JSON.stringify(cartAfterAdd, null, 2))

        // 3. Verify in Database directly using Prisma
        const dbCart = await prisma.cart.findUnique({
            where: { id: testCartId }
        })

        if (!dbCart) {
            throw new Error('Cart not found in database after adding item!')
        }
        console.log('[Verify] Cart found in DB:', JSON.stringify(dbCart, null, 2))

        // Check items in DB
        const items = dbCart.items as any[]
        const foundItem = items.find((i: any) => i.slug === slug)

        if (!foundItem) {
            throw new Error(`Item ${slug} not found in DB record!`)
        }

        if (foundItem.quantity !== 2) {
            throw new Error(`Item quantity mismatch. Expected 2, got ${foundItem.quantity}`)
        }
        console.log('[Verify] DB Data matches expected state.')

        // 4. Test Get Cart
        const retrievedCart = await getCart(testCartId)
        if (retrievedCart.items.length !== 1 || retrievedCart.items[0].slug !== slug) {
            throw new Error('getCart service returned incorrect data')
        }
        console.log('[Verify] getCart service returned correct data.')

        // 5. Cleanup (Remove item or delete cart)
        console.log('[Verify] Cleaning up...')
        await prisma.cart.delete({ where: { id: testCartId } })
        console.log('[Verify] Test cart deleted.')

        console.log('[Verify] SUCCESS: Cart API interaction with Real Database is verified.')

    } catch (error) {
        console.error('[Verify] FAILED:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
