
export interface ValidationResult {
    valid: boolean
    reason?: string
}

export function validateStatusChange(currentStatus: string, newStatus: string): ValidationResult {
    const flow: Record<string, string[]> = {
        pending: ['processing', 'cancelled', 'confirmed'],
        confirmed: ['processing', 'cancelled'],
        processing: ['shipped', 'cancelled'],
        shipped: ['delivered', 'returned'],
        delivered: ['returned'],
        cancelled: [], // Terminal state
        returned: [], // Terminal state
    }

    // Allow same status (no-op)
    if (currentStatus === newStatus) return { valid: true }

    const allowed = flow[currentStatus] || []
    if (allowed.includes(newStatus)) {
        return { valid: true }
    }

    return { valid: false, reason: `Cannot transition from ${currentStatus} to ${newStatus}` }
}

export function validateRefund(order: { total: number, payment?: { status?: string }, refundedAmount?: number }, refundAmount: number): ValidationResult {
    const paymentStatus = order.payment?.status
    if (paymentStatus !== 'paid' && paymentStatus !== 'partially_refunded') {
        return { valid: false, reason: 'Order is not paid' }
    }

    const totalRef = order.refundedAmount ?? 0

    if (totalRef + refundAmount > order.total) {
        return { valid: false, reason: `Refund amount $${refundAmount} exceeds refundable total ($${order.total - totalRef} remaining)` }
    }

    return { valid: true }
}
