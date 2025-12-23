import { getOptionalSession } from '@/lib/auth/session';
import ProductsTable from './ProductsTable';

async function fetchProducts(q = '', offset = 0, limit = 20) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/admin/products?q=${encodeURIComponent(q)}&offset=${offset}&limit=${limit}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

export default async function ProductsPage() {
  await getOptionalSession(); // route guards enforce RBAC
  const { items } = await fetchProducts('', 0, 20);
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Products (Admin/Merch)</h1>
      <ProductsTable items={items}/>
    </main>
  );
}
