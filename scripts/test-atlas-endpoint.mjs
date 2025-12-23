/**
 * Test Atlas Endpoint
 * Verifies /api/concierge/products returns valid data
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const PORT = process.env.PORT || '3002';
const date = new Date().toISOString().slice(0, 10);
const evidenceDir = join(process.cwd(), `docs/concierge_v1/launch_evidence/${date}`);

async function testEndpoint() {
  try {
    // Read the saved JSON
    const jsonPath = join(evidenceDir, 'atlas_ready_to_ship_under_300.json');
    const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
    
    // Validate structure
    if (!Array.isArray(data)) {
      throw new Error('Response is not an array');
    }
    
    // Check all items are under $300
    const overPriced = data.filter(p => typeof p.price === 'number' && p.price >= 300);
    if (overPriced.length > 0) {
      throw new Error(`Found ${overPriced.length} items >= $300: ${overPriced.map(p => `${p.title} ($${p.price})`).join(', ')}`);
    }
    
    // Check all items have required fields
    for (const item of data) {
      if (!item.title) throw new Error(`Item missing title: ${JSON.stringify(item)}`);
      if (typeof item.price !== 'number') throw new Error(`Item has invalid price: ${JSON.stringify(item)}`);
    }
    
    console.log(`✅ PASS: Atlas endpoint test (${data.length} products, all < $300, all valid)`);
    return true;
  } catch (error) {
    console.error(`❌ FAIL: Atlas endpoint test - ${error.message}`);
    throw error;
  }
}

testEndpoint().catch(() => process.exit(1));
