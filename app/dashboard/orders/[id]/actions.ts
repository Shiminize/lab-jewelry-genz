
"use server"

import { revalidatePath } from "next/cache"
import { updateOrderStatus, refundOrder } from "@/services/admin/orders"

export async function changeStatusAction(orderId: string, newStatus: string) {
    try {
        await updateOrderStatus(orderId, newStatus)
        revalidatePath(`/dashboard/orders/${orderId}`)
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function refundOrderAction(orderId: string, amount: number) {
    try {
        await refundOrder(orderId, amount)
        revalidatePath(`/dashboard/orders/${orderId}`)
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
