import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCartIdFromCookies } from '@/lib/cartSession'
import { getCart, getCatalogProducts } from '@/services/neon'
import { defaultCatalogProducts } from '@/config/catalogDefaults'
import { CartClient } from './CartClient'

export default async function CartPage() {
  const existingCartId = getCartIdFromCookies()
  const cart = existingCartId
    ? await getCart(existingCartId)
    : {
      cartId: '',
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

  // Fetch real products from DB for the "Sample Capsules" rail
  // Increased limit to 30 to ensure we capture all products needed for the "Recommended Stacks"
  const sampleProducts = await getCatalogProducts(30)

  return <CartClient initialCart={cart} sampleProducts={sampleProducts} />
}
