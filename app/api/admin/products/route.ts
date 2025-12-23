import { NextResponse } from 'next/server';
import { getOptionalSession } from '@/lib/auth/session';
import prisma from '@/lib/prisma';
import { assertAdminOrMerch } from '@/lib/auth/roleGuards';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getOptionalSession();
  assertAdminOrMerch(session);

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const ready = searchParams.get('ready') || '';
  const tag = searchParams.get('tag') || '';
  const limit = Math.min(Number(searchParams.get('limit') || 20), 100);
  const offset = Number(searchParams.get('offset') || 0);

  const where: any = {};

  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { sku: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.category = { equals: category, mode: 'insensitive' };
  }

  if (ready === 'true') {
    // Check metadata->readyToShip logic? 
    // Schema has no direct 'readyToShip' column, it's in metadata or we check inventory?
    // Existing seed sets 'readyToShip' in metadata.
    // Prisma JSON filtering is specific.
    where.metadata = {
      path: ['readyToShip'],
      equals: true
    }
  }

  // Tags are usually in metadata.collections or metadata.tags
  if (tag) {
    where.collections = { has: tag };
    // Or check metadata if tags are there.
    // Existing code checked 'tags' field.
    // Schema has 'collections' string[].
  }

  // existing code logic:
  // if (ready === 'true') and.push({ readyToShip: true }); // top level field in Mongo doc? 
  // wait, seed script put it in metadata AND top level maybe?
  // User repository refactor: I defined top level status, featured, etc.
  // The 'raw' mongo doc had it top level.
  // My Prisma schema doesn't have `readyToShip` explicit top column.
  // I should add it or use metadata.
  // I added `metadata Json?`.

  // For the moment, let's assume filtering by name/sku/category is the primary use case for admin.
  // If 'ready' param is strict, we might need to adjust schema or use raw query.
  // But safer to just filter in memory if result set small, OR ignore for now if not critical.
  // BUT, let's try to map it.

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: offset,
      take: limit
    }),
    prisma.product.count({ where })
  ]);

  return NextResponse.json({ items, total }, { status: 200 });
}
