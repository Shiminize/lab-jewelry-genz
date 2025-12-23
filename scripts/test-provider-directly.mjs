import { getProvider } from '../src/lib/concierge/providers/index.js';

const provider = getProvider();
const products = await provider.listProducts({ priceMax: 300, priceLt: 300 });

console.log('Products from provider:');
products.forEach(p => {
  console.log(`\nSKU: ${p.id}`);
  console.log(`  title: ${JSON.stringify(p.title)}`);
  console.log(`  price: ${p.price}`);
});
