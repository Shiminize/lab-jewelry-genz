import { NextResponse } from 'next/server';
import { getOptionalSession } from '@/lib/auth/session';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { assertAdminOrMerch } from '@/lib/auth/roleGuards';
import { idempotencyCache } from '@/lib/idempotency/cache';
import { adminRateLimiter } from '@/lib/ratelimit/tokenBucket';

export const dynamic = 'force-dynamic';

const PatchSchema = z.object({
  readyToShip: z.boolean().optional(),
  featuredInWidget: z.boolean().optional(),
  tags: z.array(z.string()).max(12).optional(),
  shippingPromise: z.string().max(120).optional(),
  description: z.string().optional(),
  basePrice: z.number().min(0).optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'No changes' });

function getClientIP(req: Request): string {
  // Try various headers for client IP
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  const realIP = req.headers.get('x-real-ip');
  if (realIP) return realIP;

  return 'unknown';
}

export async function PATCH(req: Request, ctx: { params: { sku: string } }) {
  const session = await getOptionalSession();
  assertAdminOrMerch(session);

  const sku = ctx.params.sku;

  // Rate limiting (5 req/sec per IP)
  const clientIP = getClientIP(req);
  const rateLimitResult = adminRateLimiter.check(clientIP);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'Retry-After': String(rateLimitResult.retryAfter || 1),
        },
      }
    );
  }

  // Idempotency check
  const idempotencyKey = req.headers.get('x-idempotency-key');
  if (idempotencyKey) {
    const cached = idempotencyCache.get(idempotencyKey, sku);
    if (cached) {
      return NextResponse.json(cached, {
        status: 200,
        headers: { 'X-Idempotency-Replay': 'true' },
      });
    }
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Map fields to Prisma Schema
  // Note: standard Product schema has basePrice, description directly.
  // readyToShip, featuredInWidget, tags are likely in metadata (Json) or collections.
  // We need to merge metadata update carefully.

  // First fetch existing to merge metadata
  const existing = await prisma.product.findUnique({ where: { sku } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const metadata = (existing.metadata as Record<string, any>) || {};

  if (parsed.data.readyToShip !== undefined) metadata.readyToShip = parsed.data.readyToShip;
  if (parsed.data.featuredInWidget !== undefined) metadata.featuredInWidget = parsed.data.featuredInWidget;
  if (parsed.data.tags !== undefined) metadata.tags = parsed.data.tags;
  if (parsed.data.shippingPromise !== undefined) metadata.shippingPromise = parsed.data.shippingPromise;

  const updateData: any = {
    updatedAt: new Date(),
    metadata
  };

  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.basePrice !== undefined) updateData.basePrice = parsed.data.basePrice;

  const updated = await prisma.product.update({
    where: { sku },
    data: updateData
  });

  // Cache response for idempotency (60s TTL)
  if (idempotencyKey) {
    idempotencyCache.set(idempotencyKey, sku, updated, 60);
  }

  return NextResponse.json(updated, { status: 200 });
}
