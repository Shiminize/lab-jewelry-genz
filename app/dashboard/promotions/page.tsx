
import Link from 'next/link'
import { listPromotions } from '@/services/admin/promotions'
import { Typography } from '@/components/ui'

export default async function PromotionsPage() {
    const promotions = await listPromotions()

    return (
        <div className="space-y-8">
            <header className="space-y-2 flex justify-between items-start">
                <div>
                    <Typography as="h1" variant="heading">
                        Promotions
                    </Typography>
                    <Typography variant="body" className="text-text-secondary">
                        Manage discount codes and marketing campaigns.
                    </Typography>
                </div>
                <Link
                    href="/dashboard/promotions/new"
                    className="inline-flex items-center justify-center rounded-full bg-accent-primary px-5 py-2.5 text-sm font-semibold tracking-[0.08em] text-surface-base shadow-soft transition hover:bg-accent-primary/90"
                >
                    + New Promotion
                </Link>
            </header>

            <div className="overflow-hidden rounded-2xl border border-border-subtle shadow-soft">
                <table className="min-w-full divide-y divide-border-subtle text-sm">
                    <thead className="bg-surface-panel">
                        <tr className="text-left text-xs uppercase tracking-[0.18em] text-text-muted">
                            <th className="px-5 py-3 font-semibold">Code</th>
                            <th className="px-5 py-3 font-semibold">Discount</th>
                            <th className="px-5 py-3 font-semibold">Usage</th>
                            <th className="px-5 py-3 font-semibold">Status</th>
                            <th className="px-5 py-3 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle bg-surface-base text-text-secondary">
                        {promotions.map((promo) => (
                            <tr key={promo.id}>
                                <td className="px-5 py-4 font-semibold text-text-primary font-mono">{promo.code}</td>
                                <td className="px-5 py-4">
                                    {promo.type === 'PERCENTAGE' ? `${promo.value}%` : `$${promo.value}`}
                                    {promo.minSpend > 0 && <span className="text-xs text-text-muted block">Min ${promo.minSpend}</span>}
                                </td>
                                <td className="px-5 py-4">
                                    {promo.currentUsage} / {promo.maxUsage ?? '∞'}
                                </td>
                                <td className="px-5 py-4">
                                    <StatusBadge active={promo.isActive} expired={promo.expiresAt && new Date() > promo.expiresAt} />
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <Link
                                        href={`/dashboard/promotions/${promo.id}`}
                                        className="text-accent-primary hover:underline font-medium"
                                    >
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {promotions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-5 py-8 text-center text-text-muted">
                                    No active promotions. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function StatusBadge({ active, expired }: { active: boolean, expired: boolean | null }) {
    if (expired) {
        return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800">Expired</span>
    }
    if (!active) {
        return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">Disabled</span>
    }
    return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">Active</span>
}
