
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validateRefund, validateStatusChange } from '../../src/services/admin/order-validation'

// Mock Prisma (Simulated in the service or just testing pure logic functions first)
// We will test the pure logic functions "validateRefund" and "validateStatusChange"
// which we will extract to be testable without DB first.

describe('Order Operations State Machine', () => {

    describe('Refund Validation', () => {
        it('should allow full refund for paid orders', () => {
            const order = { total: 100, payment: { status: 'paid', amount: 100 }, refundedAmount: 0 }
            const result = validateRefund(order, 100)
            expect(result.valid).toBe(true)
        })

        it('should allow partial refund', () => {
            const order = { total: 100, payment: { status: 'paid', amount: 100 }, refundedAmount: 0 }
            const result = validateRefund(order, 50)
            expect(result.valid).toBe(true)
        })

        it('should fail if refund amount > total', () => {
            const order = { total: 100, payment: { status: 'paid', amount: 100 }, refundedAmount: 0 }
            const result = validateRefund(order, 150)
            expect(result.valid).toBe(false)
            expect(result.reason).toContain('exceeds')
        })

        it('should fail if already refunded', () => {
            const order = { total: 100, payment: { status: 'refunded', amount: 100 }, refundedAmount: 100 }
            const result = validateRefund(order, 10)
            expect(result.valid).toBe(false)
        })

        it('should fail if payment status is pending', () => {
            const order = { total: 100, payment: { status: 'pending', amount: 0 }, refundedAmount: 0 }
            const result = validateRefund(order, 100)
            expect(result.valid).toBe(false)
            expect(result.reason).toContain('not paid')
        })
    })

    describe('Status Transition', () => {
        it('should allow pending -> processing', () => {
            expect(validateStatusChange('pending', 'processing').valid).toBe(true)
        })

        it('should allow processing -> shipped', () => {
            expect(validateStatusChange('processing', 'shipped').valid).toBe(true)
        })

        it('should allow shipped -> delivered', () => {
            expect(validateStatusChange('shipped', 'delivered').valid).toBe(true)
        })

        it('should allow pending -> cancelled', () => {
            expect(validateStatusChange('pending', 'cancelled').valid).toBe(true)
        })

        it('should PREVENT delivered -> pending (Backwards)', () => {
            expect(validateStatusChange('delivered', 'pending').valid).toBe(false)
        })

        it('should PREVENT cancelled -> shipped', () => {
            expect(validateStatusChange('cancelled', 'shipped').valid).toBe(false)
        })
    })
})
