// scripts/test-intent.mjs
// Standalone test of intentToFilter logic

const PRICE_CEILING = Number(process.env.WIDGET_PRICE_GIFT_CEILING || 300);

function intentToFilter(text) {
  const t = (text || '').toLowerCase();
  const f = {};
  if (t.includes('ready to ship') || t.includes('ready-to-ship')) f.readyToShip = true;
  if (/(ring|rings)/.test(t)) f.category = 'ring';
  if (/(necklace|necklaces)/.test(t)) f.category = 'necklace';
  if (/(earring|earrings)/.test(t)) f.category = 'earring';
  if (/(bracelet|bracelets)/.test(t)) f.category = 'bracelet';
  const giftish = /gift|present|under\s*\$?\s*\d+|budget/i.test(text);
  const under300 = /under\s*\$?\s*300\b/i.test(text) || /<\s*\$?\s*300\b/i.test(text);
  if (giftish || under300) {
    f.tags = Array.from(new Set([...(f.tags || []), 'gift']));
    f.priceLt = PRICE_CEILING;
  }
  f.q = text;
  return f;
}

console.log('A', intentToFilter('gift ideas under $300 ready-to-ship rings'));
console.log('B', intentToFilter('earrings for gifts'));

