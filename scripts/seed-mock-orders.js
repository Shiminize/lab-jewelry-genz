/* Seed mock orders for testing order status and returns */
const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/glowglitch';
  const dbName = process.env.MONGODB_DB || 'glowglitch';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const col = db.collection('orders');

    const now = new Date();
    const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const orders = [
      {
        orderNumber: 'GG-12001',
        customerEmail: 'test@example.com',
        status: 'processing',
        items: [
          {
            sku: 'RING-READY-001',
            title: 'Solaris Halo Ring',
            price: 1299,
            quantity: 1,
            tags: ['ready-to-ship', 'rings'],
          },
        ],
        totals: {
          subtotal: 1299,
          shipping: 0,
          tax: 104,
          total: 1403,
        },
        payment: {
          method: 'card',
          status: 'paid',
        },
        shipping: {
          address: '123 Test St',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          country: 'US',
        },
        statusHistory: [
          { status: 'pending', label: 'Order received', date: sevenDaysAgo },
          { status: 'processing', label: 'In production', date: threeDaysAgo },
        ],
        createdAt: sevenDaysAgo,
        updatedAt: threeDaysAgo,
      },
      {
        orderNumber: 'GG-12002',
        customerEmail: 'shipped@example.com',
        status: 'shipped',
        items: [
          {
            sku: 'RING-READY-002',
            title: 'Lumen Pavé Ring',
            price: 1499,
            quantity: 1,
            tags: ['ready-to-ship', 'rings'],
          },
        ],
        totals: {
          subtotal: 1499,
          shipping: 0,
          tax: 120,
          total: 1619,
        },
        payment: {
          method: 'card',
          status: 'paid',
        },
        shipping: {
          address: '456 Main Ave',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94102',
          country: 'US',
          trackingNumber: 'USPS-1234567890',
          shippedAt: threeDaysAgo,
        },
        statusHistory: [
          { status: 'pending', label: 'Order received', date: sevenDaysAgo },
          { status: 'processing', label: 'In production', date: new Date(sevenDaysAgo.getTime() + 2 * 24 * 60 * 60 * 1000) },
          { status: 'quality_check', label: 'Quality check', date: new Date(sevenDaysAgo.getTime() + 4 * 24 * 60 * 60 * 1000) },
          { status: 'shipped', label: 'Shipped', date: threeDaysAgo },
        ],
        createdAt: sevenDaysAgo,
        updatedAt: threeDaysAgo,
      },
      {
        orderNumber: 'GG-12003',
        customerEmail: 'custom@example.com',
        status: 'processing',
        items: [
          {
            sku: 'RING-MADE-TO-ORDER-004',
            title: 'Nebula Custom Ring',
            price: 999,
            quantity: 1,
            tags: ['custom', 'rings', 'made-to-order'],
          },
        ],
        totals: {
          subtotal: 999,
          shipping: 0,
          tax: 80,
          total: 1079,
        },
        payment: {
          method: 'card',
          status: 'paid',
        },
        shipping: {
          address: '789 Oak Blvd',
          city: 'Portland',
          state: 'OR',
          postalCode: '97201',
          country: 'US',
        },
        statusHistory: [
          { status: 'pending', label: 'Order received', date: threeDaysAgo },
          { status: 'processing', label: 'Design in progress', date: now },
        ],
        createdAt: threeDaysAgo,
        updatedAt: now,
      },
    ];

    for (const order of orders) {
      await col.updateOne(
        { orderNumber: order.orderNumber },
        { $set: order },
        { upsert: true }
      );
      console.log(`✓ Seeded order: ${order.orderNumber}`);
    }

    // Create indexes
    await col.createIndex({ orderNumber: 1 }, { unique: true });
    await col.createIndex({ customerEmail: 1 });
    await col.createIndex({ status: 1 });
    await col.createIndex({ 'shipping.postalCode': 1 });
    await col.createIndex({ createdAt: -1 });
    console.log('✓ Created order indexes');

    console.log('\n✅ Mock orders seeded successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
