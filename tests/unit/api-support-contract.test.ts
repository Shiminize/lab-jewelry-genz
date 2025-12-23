jest.mock('@/lib/auth/session', () => ({
  getOptionalSession: jest.fn().mockResolvedValue(null),
}))

import { POST as orderStatus } from '@/app/api/support/order-status/route'
import { POST as returns } from '@/app/api/support/returns/route'
import { POST as csat } from '@/app/api/support/csat/route'
import { POST as shortlist } from '@/app/api/support/shortlist/route'
import { POST as orderUpdates } from '@/app/api/support/order-updates/route'

async function parse(res: Response) {
  return { status: res.status, body: await res.json() }
}

function jsonRequest(payload: unknown) {
  return new Request('http://localhost/api/support/test', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

describe('Support API contracts', () => {
  describe('order-status', () => {
    it('rejects missing orderId/email+postal', async () => {
      const res = await orderStatus(jsonRequest({}))
      const parsed = await parse(res as Response)
      expect(parsed.status).toBe(400)
      expect(parsed.body.error).toBe('INVALID_REQUEST')
    })

    it('accepts orderId and returns timeline payload', async () => {
      const res = await orderStatus(jsonRequest({ orderId: 'GG-12345' }))
      const parsed = await parse(res as Response)
      expect(parsed.status).toBe(200)
      expect(parsed.body.reference).toBeDefined()
      expect(parsed.body.entries).toBeInstanceOf(Array)
    })
  })

  describe('returns', () => {
    it('requires selection.orderId and option', async () => {
      const res = await returns(jsonRequest({ selection: { option: 'return' } }))
      const parsed = await parse(res as Response)
      expect(parsed.status).toBe(400)
      expect(parsed.body.error).toBe('INVALID_REQUEST')
    })

    it('accepts valid selection', async () => {
      const res = await returns(jsonRequest({ selection: { orderId: 'GG-12345', option: 'return' } }))
      const parsed = await parse(res as Response)
      expect(parsed.status).toBe(200)
      expect(parsed.body.message).toBeDefined()
    })
  })

  describe('csat', () => {
    it('rejects non-numeric rating', async () => {
      const res = await csat(jsonRequest({ sessionId: 'session-123', rating: '5' }))
      const parsed = await parse(res as Response)
      expect(parsed.status).toBe(400)
      expect(parsed.body.error).toBe('INVALID_REQUEST')
    })

    it('accepts numeric rating with optional orderNumber', async () => {
      const res = await csat(jsonRequest({ sessionId: 'session-123', rating: 5, orderNumber: 'GG-12345' }))
      const parsed = await parse(res as Response)
      expect(parsed.status).toBe(200)
      expect(parsed.body.ok).toBe(true)
      expect(parsed.body.response?.rating).toBe(5)
    })
  })

  describe('shortlist', () => {
    it('requires sessionId', async () => {
      const res = await shortlist(jsonRequest({ items: [] }))
      const parsed = await parse(res as Response)
      expect(parsed.status).toBe(400)
      expect(parsed.body.error).toBe('INVALID_REQUEST')
    })

    it('accepts sessionId + items array', async () => {
      const res = await shortlist(jsonRequest({ sessionId: 'session-abc', items: [{ id: 'p1' }] }))
      const parsed = await parse(res as Response)
      expect(parsed.status).toBe(200)
      expect(parsed.body.ok).toBe(true)
      expect(Array.isArray(parsed.body.items)).toBe(true)
    })
  })

  describe('order-updates', () => {
    it('requires sessionId', async () => {
      const res = await orderUpdates(jsonRequest({ orderId: 'GG-1' }))
      const parsed = await parse(res as Response)
      expect(parsed.status).toBe(400)
      expect(parsed.body.error).toBe('INVALID_REQUEST')
    })

    it('accepts sessionId with order metadata', async () => {
      const res = await orderUpdates(
        jsonRequest({ sessionId: 'session-abc', orderId: 'GG-1', orderNumber: 'GG-1', sms: true })
      )
      const parsed = await parse(res as Response)
      expect(parsed.status).toBe(200)
      expect(parsed.body.ok).toBe(true)
    })
  })
})
