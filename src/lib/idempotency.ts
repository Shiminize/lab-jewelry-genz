import { NextResponse } from 'next/server'

type StoredResult = { body: unknown; status: number }

const store: Map<string, StoredResult> = new Map()

export function getIdempotencyKey(request: Request): string | undefined {
  const key = request.headers.get('Idempotency-Key') || request.headers.get('idempotency-key')
  return key || undefined
}

export async function withIdempotency(
  request: Request,
  compute: () => Promise<{ body: unknown; status?: number }>
): Promise<NextResponse> {
  const key = getIdempotencyKey(request)
  if (!key) {
    const result = await compute()
    return NextResponse.json(result.body, { status: result.status ?? 200 })
  }

  const cached = store.get(key)
  if (cached) {
    return NextResponse.json(cached.body as any, { status: cached.status })
  }

  const result = await compute()
  const status = result.status ?? 200
  store.set(key, { body: result.body, status })
  return NextResponse.json(result.body as any, { status })
}


