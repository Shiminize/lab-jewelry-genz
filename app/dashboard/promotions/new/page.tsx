
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import PromotionForm from '../PromotionForm'
import { createPromotion } from '@/services/admin/promotions'
import { Typography } from '@/components/ui'

export default function NewPromotionPage() {
    async function createAction(formData: FormData) {
        'use server'

        const code = String(formData.get('code')).trim().toUpperCase().replace(/\s/g, '')
        const type = String(formData.get('type'))
        const value = Number(formData.get('value'))
        const minSpend = Number(formData.get('minSpend'))
        const maxDiscount = formData.get('maxDiscount') ? Number(formData.get('maxDiscount')) : null
        const maxUsage = formData.get('maxUsage') ? Number(formData.get('maxUsage')) : null
        const isActive = formData.get('isActive') === 'true'

        await createPromotion({
            code,
            type,
            value,
            minSpend,
            maxDiscount,
            maxUsage,
            isActive
        })

        revalidatePath('/dashboard/promotions')
        redirect('/dashboard/promotions')
    }

    return (
        <div className="space-y-8">
            <header className="space-y-2">
                <Typography as="h1" variant="heading">
                    New Promotion
                </Typography>
            </header>
            <div className="space-y-6 rounded-2xl border border-border-subtle bg-surface-base px-6 py-6 shadow-soft md:px-8 md:py-8">
                <PromotionForm action={createAction} />
            </div>
        </div>
    )
}
