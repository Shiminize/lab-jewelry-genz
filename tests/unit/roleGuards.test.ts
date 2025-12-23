import { assertAdmin, assertAdminOrMerch } from '@/lib/auth/roleGuards'

describe('roleGuards', () => {
  it('allows admins', () => {
    expect(() => assertAdmin({ user: { role: 'admin' } })).not.toThrow()
    expect(() => assertAdminOrMerch({ user: { role: 'admin' } })).not.toThrow()
  })

  it('allows merchandisers for mixed guard', () => {
    expect(() => assertAdminOrMerch({ user: { role: 'merchandiser' } })).not.toThrow()
  })

  it('throws for missing session', () => {
    expect(() => assertAdmin(null)).toThrow('Forbidden')
    expect(() => assertAdminOrMerch(undefined)).toThrow('Forbidden')
  })

  it('throws when role mismatches', () => {
    expect(() => assertAdmin({ user: { role: 'customer' } })).toThrow('Forbidden')
    expect(() => assertAdminOrMerch({ user: { role: 'customer' } })).toThrow('Forbidden')
  })
})
