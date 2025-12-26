
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { applyPromotion, validatePromotion } from '../../src/services/admin/promotions'

const mocks = vi.hoisted(() => {
    return {
        promotion: {
            findUnique: vi.fn(),
            update: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
        },
    }
})

vi.mock('@/lib/prisma', () => ({
    default: mocks,
}))

describe('Promotions Engine', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Validation', () => {
        it('should reject non-existent codes', async () => {
            mocks.promotion.findUnique.mockResolvedValue(null)
            const result = await validatePromotion('INVALID')
            expect(result.valid).toBe(false)
            expect(result.reason).toBe('Code not found')
        })

        it('should reject expired codes', async () => {
            mocks.promotion.findUnique.mockResolvedValue({
                code: 'EXPIRED',
                isActive: true,
                expiresAt: new Date('2020-01-01'),
                currentUsage: 0,
                maxUsage: 100,
            })
            const result = await validatePromotion('EXPIRED')
            expect(result.valid).toBe(false)
            expect(result.reason).toBe('Promotion expired')
        })
    })

    describe('Application Logic', () => {
        it('should calculate PERCENTAGE discount correctly', async () => {
            const promo = {
                code: 'SAVE20',
                type: 'PERCENTAGE',
                value: 20, // 20%
                isActive: true,
                expiresAt: new Date('2099-01-01'),
                currentUsage: 0,
                maxUsage: 100,
            }
            mocks.promotion.findUnique.mockResolvedValue(promo)

            const cartTotal = 100
            const { finalTotal, discountAmount } = await applyPromotion(promo, cartTotal)

            expect(discountAmount).toBe(20)
            expect(finalTotal).toBe(80)
        })

        it('should calculate FIXED amount discount correctly', async () => {
            const promo = {
                code: 'MINUS10',
                type: 'FIXED',
                value: 10, // $10 off
                isActive: true,
                expiresAt: new Date('2099-01-01'),
                currentUsage: 0,
                maxUsage: 100,
            }
            mocks.promotion.findUnique.mockResolvedValue(promo)

            const cartTotal = 50
            const { finalTotal, discountAmount } = await applyPromotion(promo, cartTotal)

            expect(discountAmount).toBe(10)
            expect(finalTotal).toBe(40)
        })

        it('should never result in negative total', async () => {
            const promo = {
                code: 'BIGDISCOUNT',
                type: 'FIXED',
                value: 200,
                isActive: true,
                expiresAt: new Date('2099-01-01'),
                currentUsage: 0,
                maxUsage: 100,
            }
            mocks.promotion.findUnique.mockResolvedValue(promo)

            const cartTotal = 100
            const { finalTotal, discountAmount } = await applyPromotion(promo, cartTotal)

            expect(finalTotal).toBe(0) // Should floor at 0
            expect(discountAmount).toBe(100) // Cap discount at total
        })
    })
})
