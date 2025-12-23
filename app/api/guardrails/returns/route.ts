import { NextRequest, NextResponse } from 'next/server'

const TARGET = process.env.CONCIERGE_RETURNS_ENDPOINT || '/api/support/returns'
const isProd = process.env.NODE_ENV === 'production'

export async function POST(req: NextRequest) {
  if (isProd) {
    return NextResponse.json(
      { error: 'GUARDRAIL_DISABLED', message: 'Local guardrail route unavailable in production' },
      { status: 404 }
    )
  }

  const requestId = req.headers.get('x-request-id')
  const idempotencyKey = req.headers.get('x-idempotency-key')

  if (!idempotencyKey) {
    return NextResponse.json(
      {
        error: 'IDEMPOTENCY_REQUIRED',
        message: "I need a quick refresh—please tap that again so I don’t duplicate your request.",
      },
      {
        status: 400,
        headers: requestId ? { 'x-request-id': requestId } : undefined,
      }
    )
  }

  const body = await req.text()
  const targetUrl = TARGET.startsWith('http') ? TARGET : new URL(TARGET, req.nextUrl.origin).toString()
  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(req.headers.get('authorization') ? { Authorization: req.headers.get('authorization')! } : {}),
      'x-request-id': requestId ?? `guardrail-returns-${Date.now()}`,
      'x-idempotency-key': idempotencyKey,
    },
    body,
  })

  const text = await response.text()
  const headers = new Headers(response.headers)
  if (requestId) {
    headers.set('x-request-id', requestId)
  }
  return new NextResponse(text, {
    status: response.status,
    headers,
  })
}
