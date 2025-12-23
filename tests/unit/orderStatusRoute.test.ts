import { POST } from '@/app/api/support/order-status/route'
import { conciergeConfig } from '@/config/concierge'
import { getOptionalSession } from '@/lib/auth/session'
import { fetchOrderStatus } from '@/lib/concierge/services'
import { getOrderStatus } from '@/server/services/orderService'

jest.mock('@/config/concierge', () => ({
  conciergeConfig: { mode: 'localDb' },
}))

jest.mock('@/lib/auth/session', () => ({
  getOptionalSession: jest.fn(),
}))

jest.mock('@/server/services/orderService', () => ({
  getOrderStatus: jest.fn(),
}))

jest.mock('@/lib/concierge/services', () => ({
  fetchOrderStatus: jest.fn(),
}))

const mockedSession = getOptionalSession as jest.MockedFunction<typeof getOptionalSession>
const mockedGetOrderStatus = getOrderStatus as jest.MockedFunction<typeof getOrderStatus>
const mockedFetchOrderStatus = fetchOrderStatus as jest.MockedFunction<typeof fetchOrderStatus>

const makeRequest = (body: Record<string, unknown>) =>
  new Request('http://localhost/api/support/order-status', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-request-id': 'test-req' },
    body: JSON.stringify(body),
  })

describe('POST /api/support/order-status', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(conciergeConfig as any).mode = 'localDb'
  })

  it('returns timeline data when the authenticated user owns the order (customerEmail)', async () => {
    mockedSession.mockResolvedValueOnce({ user: { email: 'owner@example.com', role: 'user' } })
    mockedGetOrderStatus.mockResolvedValueOnce({
      reference: 'GG-100',
      entries: [{ label: 'Placed', status: 'current' }],
      customerEmail: 'owner@example.com',
    })

    const response = await POST(makeRequest({ orderId: 'GG-100' }))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.reference).toBe('GG-100')
    expect(mockedGetOrderStatus).toHaveBeenCalledWith({
      orderId: 'GG-100',
      email: undefined,
      postalCode: undefined,
    })
  })

  it('returns 404 for authenticated non-owner when provider returns customer.email', async () => {
    ;(conciergeConfig as any).mode = 'stub'
    mockedSession.mockResolvedValueOnce({ user: { email: 'intruder@example.com', role: 'user' } })
    mockedFetchOrderStatus.mockResolvedValueOnce({
      reference: 'GG-101',
      entries: [],
      customer: { email: 'owner@example.com' },
    })

    const response = await POST(makeRequest({ orderId: 'GG-101' }))
    const payload = await response.json()

    expect(response.status).toBe(404)
    expect(payload.error).toBe('UNAUTHORIZED')
    expect(mockedFetchOrderStatus).toHaveBeenCalled()
    expect(mockedGetOrderStatus).not.toHaveBeenCalled()
  })

  it('allows admins to bypass the owner check even when provider returns email field', async () => {
    ;(conciergeConfig as any).mode = 'stub'
    mockedSession.mockResolvedValueOnce({ user: { email: 'admin@example.com', role: 'admin' } })
    mockedFetchOrderStatus.mockResolvedValueOnce({
      reference: 'GG-102',
      entries: [],
      email: 'owner@example.com',
    })

    const response = await POST(makeRequest({ orderId: 'GG-102' }))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.reference).toBe('GG-102')
  })

  it('returns 404 for non-admins when owner email is missing and logs a warning', async () => {
    mockedSession.mockResolvedValueOnce({ user: { email: 'user@example.com', role: 'user' } })
    mockedGetOrderStatus.mockResolvedValueOnce({
      reference: 'GG-103',
      entries: [{ label: 'Placed', status: 'current' }],
    })

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    const response = await POST(makeRequest({ orderId: 'GG-103' }))
    const payload = await response.json()

    expect(response.status).toBe(404)
    expect(payload.error).toBe('UNAUTHORIZED')
    expect(
      warnSpy.mock.calls.some(([message]) => typeof message === 'string' && message.includes('missing_owner_email'))
    ).toBe(true)

    warnSpy.mockRestore()
  })
})
