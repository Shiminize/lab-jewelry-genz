
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'seed_data', 'production_products.json');
const raw = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(raw);

const categoryMap = {
    'Rings': 'R',
    'Necklaces': 'N',
    'Earrings': 'E',
    'Pendants': 'P',
    'Bracelets': 'B'
};

const counters = {};

// Sort products by category then name to have deterministic ordering
data.products.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
});

data.products = data.products.map(p => {
    const catCode = categoryMap[p.category] || 'X'; // X for unknown

    if (!counters[catCode]) counters[catCode] = 1;
    const styleNum = counters[catCode]++;

    const paddedStyle = styleNum.toString().padStart(2, '0');
    const variant = '01'; // Default variant

    const newSku = `GG${catCode}${paddedStyle}-${variant}`;

    // Update SKU
    p.sku = newSku;
    return p;
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 4));

console.log('SKUs updated successfully.');
data.products.forEach(p => console.log(`${p.sku} -> ${p.name}`));
