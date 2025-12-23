/**
 * These tests mock the account profile route handlers to ensure auth, validation, and repository
 * helpers are invoked as expected.
 */
import { GET, POST } from '@/app/api/account/profile/route'

jest.mock('@/lib/auth/server', () => ({
  auth: jest.fn(),
}))

jest.mock('@/lib/auth/userRepository', () => ({
  findUserById: jest.fn(),
  updateUserProfile: jest.fn(),
}))

const mockAuth = jest.requireMock('@/lib/auth/server').auth as jest.Mock
const mockFindUserById = jest.requireMock('@/lib/auth/userRepository').findUserById as jest.Mock
const mockUpdateUserProfile = jest.requireMock('@/lib/auth/userRepository').updateUserProfile as jest.Mock

describe('api/account/profile', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('rejects unauthenticated requests', async () => {
    mockAuth.mockResolvedValue(null)
    const response = await GET()
    expect(response.status).toBe(401)
  })

  it('returns profile data for authenticated user', async () => {
    mockAuth.mockResolvedValue({ user: { id: '123' } })
    mockFindUserById.mockResolvedValue({
      _id: { toHexString: () => '123' },
      email: 'user@example.com',
      name: 'User',
      marketingOptIn: true,
      role: 'customer',
    })
    const response = await GET()
    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.user.email).toBe('user@example.com')
  })

  it('updates profile data when payload is valid', async () => {
    mockAuth.mockResolvedValue({ user: { id: '123' } })
    mockUpdateUserProfile.mockResolvedValue({
      _id: { toHexString: () => '123' },
      email: 'user@example.com',
      name: 'Updated',
      marketingOptIn: false,
      role: 'customer',
    })

    const response = await POST(
      new Request('http://localhost/api/account/profile', {
        method: 'POST',
        body: JSON.stringify({ name: 'Updated', marketingOptIn: false }),
        headers: { 'content-type': 'application/json' },
      })
    )
    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.user.name).toBe('Updated')
    expect(mockUpdateUserProfile).toHaveBeenCalledWith('123', {
      name: 'Updated',
      marketingOptIn: false,
    })
  })
})
