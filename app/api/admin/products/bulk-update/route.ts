import { NextResponse } from 'next/server';
import { getOptionalSession } from '@/lib/auth/session';
import { assertAdminOrMerch } from '@/lib/auth/roleGuards';
import { checkRateLimit } from '@/lib/auth/rateLimiter';
import { checkIdempotency, storeIdempotency } from '@/lib/auth/idempotency';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Zod schema for bulk update operations
const BulkOperationSchema = z.object({
  sku: z.string().min(1),
  operations: z.object({
    setFeaturedInWidget: z.boolean().optional(),
    setReadyToShip: z.boolean().optional(),
    addTags: z.array(z.string()).max(20).optional(),
    removeTags: z.array(z.string()).max(20).optional(),
  }),
});

const BulkUpdateSchema = z.object({
  updates: z.array(BulkOperationSchema).min(1).max(200), // Max 200 SKUs
});

export async function POST(req: Request) {
  try {
    // RBAC check
    const session = await getOptionalSession();
    assertAdminOrMerch(session);

    const userEmail = session?.user?.email || 'unknown';

    // Rate limiting
    const rateLimit = checkRateLimit(`admin:bulk:${userEmail}`, {
      maxTokens: 50,
      refillRate: 5,  // 5 requests per second max
      cost: 10,        // Bulk updates cost more tokens
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          resetIn: rateLimit.resetIn,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.resetIn.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetIn.toString(),
          },
        }
      );
    }

    // Idempotency check
    const idempotencyKey = req.headers.get('x-idempotency-key');
    if (idempotencyKey) {
      const cached = checkIdempotency(idempotencyKey);
      if (cached) {
        return NextResponse.json(cached.result, {
          status: cached.status,
          headers: {
            'X-Idempotency-Replay': 'true',
          },
        });
      }
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = BulkUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { updates } = parsed.data;
    const results: Array<{ sku: string; success: boolean; error?: string }> = [];

    // Process each update
    for (const update of updates) {
      try {
        const { sku, operations } = update;

        // Fetch current product to handle array modifications (Postgres doesn't support $addToSet in same way)
        const current = await prisma.product.findUnique({
          where: { sku },
          select: { metadata: true }
        });

        if (!current) {
          results.push({ sku, success: false, error: 'SKU not found' });
          continue;
        }

        // Prepare metadata update
        const meta = (current.metadata as Record<string, any>) || {};
        let tags: string[] = Array.isArray(meta.tags) ? meta.tags : [];

        if (operations.addTags && operations.addTags.length > 0) {
          const newTags = new Set([...tags, ...operations.addTags]);
          tags = Array.from(newTags);
        }

        if (operations.removeTags && operations.removeTags.length > 0) {
          const content = new Set(tags);
          operations.removeTags.forEach(t => content.delete(t));
          tags = Array.from(content);
        }

        const newMeta: Record<string, any> = {
          ...meta,
          tags,
          ...(operations.setFeaturedInWidget !== undefined ? { featuredInWidget: operations.setFeaturedInWidget } : {}),
          ...(operations.setReadyToShip !== undefined ? { readyToShip: operations.setReadyToShip } : {})
        };

        // Execute update
        await prisma.product.update({
          where: { sku },
          data: {
            metadata: newMeta,
            updatedAt: new Date(),
          }
        });

        results.push({
          sku,
          success: true,
        });

      } catch (error) {
        results.push({
          sku: update.sku,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Calculate summary
    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    };

    const response = {
      summary,
      results,
      processedAt: new Date().toISOString(),
    };

    const status = summary.failed === 0 ? 200 : 207; // 207 Multi-Status for partial success

    // Store for idempotency
    if (idempotencyKey) {
      storeIdempotency(idempotencyKey, response, status);
    }

    return NextResponse.json(response, {
      status,
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      },
    });

  } catch (error) {
    if ((error as any).status === 403) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.error('[bulk-update] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
