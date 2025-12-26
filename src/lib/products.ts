import prisma from '@/lib/prisma';
import type { ProductDetail } from '@/content/products';

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
    const product = await prisma.product.findUnique({
        where: { slug }
    });

    if (!product) return null;

    // Prisma returns strict types, but we might need to cast/map to match ProductDetail exactly
    // if the ProductDetail interface has specific requirements not met by the Prisma generated type.
    // However, our schema was designed to match.
    // We explicitly map 'materials' which are already string[] in our new schema, 
    // effectively removing the old "Object vs String" normalization logic.

    // Transform to match ProductDetail interface expected by the UI
    const mappedProduct = {
        ...product,
        title: product.name, // Map 'name' from DB to 'title' in UI
        brand: (product.metadata as any)?.brand || 'GlowGlitch', // Fallback for missing brand
        handle: product.category.toLowerCase(), // Simple mapping for handle
        inStock: product.inventory > 0,
        materials: product.materials, // Ensure arrays are passed through
        dimensions: product.dimensions,
        care: product.care,
        price: product.basePrice, // Map 'basePrice' from DB to 'price' in UI
        // Add other necessary fields if missing from raw database object
    };

    return mappedProduct as unknown as ProductDetail;
}

export async function getAllProductSlugs(): Promise<string[]> {
    const products = await prisma.product.findMany({
        select: { slug: true }
    });
    return products.map(p => p.slug);
}
