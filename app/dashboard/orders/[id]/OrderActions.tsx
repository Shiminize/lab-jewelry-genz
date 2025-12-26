
"use client"

import { useState } from "react"

export default function OrderActions({ orderId, status, total, paymentStatus }: { orderId: string, status: string, total: number, paymentStatus: string }) {
    const [action, setAction] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [refundAmount, setRefundAmount] = useState(total)

    // Using server actions via a prop or direct import if we set them up as 'use server'
    // For now assuming we pass an action handler or call an API. 
    // BUT since we can import server actions directly in client components in Next.js...
    // Let's assume we create a `actions.ts` file for this page.

    return (
        <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-text-muted">Actions</h2>
            <div className="flex gap-2">
                {status !== 'cancelled' && status !== 'delivered' && (
                    <button
                        className="flex-1 rounded-lg border border-border-subtle bg-surface-base px-3 py-2 text-sm font-medium hover:bg-surface-panel"
                        onClick={() => setAction('status')}
                    >
                        Change Status
                    </button>
                )}
                {paymentStatus === 'paid' && status !== 'cancelled' && (
                    <button
                        className="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                        onClick={() => setAction('refund')}
                    >
                        Refund Order
                    </button>
                )}
            </div>

            {/* Modal / Inline Forms would go here. For MVP providing placeholders */}
            {action === 'status' && (
                <div className="p-4 rounded-lg bg-surface-panel border border-border-subtle">
                    <p className="text-sm mb-2 font-semibold">Update Status</p>
                    {/* Select and Confirm */}
                    <p className="text-xs text-text-muted">Feature coming in next step (Action Binding)</p>
                    <button onClick={() => setAction(null)} className="text-xs underline mt-2">Cancel</button>
                </div>
            )}
            {action === 'refund' && (
                <div className="p-4 rounded-lg bg-surface-panel border border-border-subtle">
                    <p className="text-sm mb-2 font-semibold text-red-700">Issue Refund</p>
                    <input
                        type="number"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(Number(e.target.value))}
                        max={total}
                        className="w-full mb-2 px-3 py-2 border rounded"
                    />
                    <p className="text-xs text-text-muted mb-2">Max refundable: ${total}</p>
                    <button className="w-full bg-red-600 text-white rounded py-2 text-sm font-medium">Confirm Refund</button>
                    <button onClick={() => setAction(null)} className="text-xs underline mt-2 w-full text-center">Cancel</button>
                </div>
            )}
        </div>
    )
}
