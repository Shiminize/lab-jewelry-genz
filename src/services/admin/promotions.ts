
import prisma from '@/lib/prisma'

export type PromotionType = 'PERCENTAGE' | 'FIXED'

export interface ValidationResult {
    valid: boolean
    reason?: string
    promotion?: any
}

export interface DiscountResult {
    finalTotal: number
    discountAmount: number
    promotionApplied?: string
}

export async function validatePromotion(code: string, cartTotal: number = 0): Promise<ValidationResult> {
    const promotion = await prisma.promotion.findUnique({
        where: { code },
    })

    // 1. Code Existence
    if (!promotion) {
        return { valid: false, reason: 'Code not found' }
    }

    // 2. Active Status
    if (!promotion.isActive) {
        return { valid: false, reason: 'Promotion disabled' }
    }

    // 3. Expiry
    if (promotion.expiresAt && new Date() > promotion.expiresAt) {
        return { valid: false, reason: 'Promotion expired' }
    }

    // 4. Usage Limit
    if (promotion.maxUsage !== null && promotion.currentUsage >= promotion.maxUsage) {
        return { valid: false, reason: 'Usage limit reached' }
    }

    // 5. Minimum Spend
    if (cartTotal < promotion.minSpend) {
        return { valid: false, reason: `Minimum spend of $${promotion.minSpend} required` }
    }

    return { valid: true, promotion }
}

export async function applyPromotion(
    promotionOrCode: any | string,
    cartTotal: number
): Promise<DiscountResult> {
    let promotion = promotionOrCode

    if (typeof promotionOrCode === 'string') {
        const check = await validatePromotion(promotionOrCode, cartTotal)
        if (!check.valid || !check.promotion) {
            return { finalTotal: cartTotal, discountAmount: 0 }
        }
        promotion = check.promotion
    }

    let discountAmount = 0

    if (promotion.type === 'PERCENTAGE') {
        discountAmount = cartTotal * (promotion.value / 100)
        if (promotion.maxDiscount && discountAmount > promotion.maxDiscount) {
            discountAmount = promotion.maxDiscount
        }
    } else if (promotion.type === 'FIXED') {
        discountAmount = promotion.value
    }

    // Safety: Cannot discount more than total
    if (discountAmount > cartTotal) {
        discountAmount = cartTotal
    }

    // Safety: Cannot be negative result (implied by above, but strict floor)
    const finalTotal = Math.max(0, cartTotal - discountAmount)

    return {
        finalTotal,
        discountAmount,
        promotionApplied: promotion.code,
    }
}

export async function incrementPromotionUsage(code: string) {
    await prisma.promotion.update({
        where: { code },
        data: { currentUsage: { increment: 1 } },
    })
}

export async function listPromotions() {
    return await prisma.promotion.findMany({
        orderBy: { createdAt: 'desc' },
    })
}

export async function getPromotion(id: string) {
    return await prisma.promotion.findUnique({
        where: { id },
    })
}

export async function createPromotion(data: any) {
    return await prisma.promotion.create({
        data,
    })
}

export async function updatePromotion(id: string, data: any) {
    return await prisma.promotion.update({
        where: { id },
        data,
    })
}

export async function deletePromotion(id: string) {
    return await prisma.promotion.delete({
        where: { id },
    })
}
