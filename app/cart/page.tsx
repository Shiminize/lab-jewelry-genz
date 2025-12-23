import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCartIdFromCookies } from '@/lib/cartSession'
import { getCart } from '@/services/neon'
import { defaultCatalogProducts, defaultCatalogProductDetails } from '@/config/catalogDefaults'
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

  const sampleProducts = defaultCatalogProducts.map((product) => ({
    ...product,
    heroImage: defaultCatalogProductDetails[product.slug]?.heroImage ?? product.heroImage,
  }))

  return <CartClient initialCart={cart} sampleProducts={sampleProducts} />
}
