import Link from 'next/link'

import { listAdminProducts } from '@/services/admin/catalog'
import { getCreatorPipelineStats } from '@/services/admin/creatorApplications'
import { getAdminOrderStats } from '@/services/admin/orders'
import { getAdminUserStats } from '@/services/admin/users'
import { getActiveSessionStats } from '@/services/admin/analytics'
import { getAdminSettings } from '@/services/admin/settings'
import { Typography } from '@/components/ui'

export default async function DashboardOverviewPage() {
  const [products, settings, orderStats, userStats, analyticsStats] = await Promise.all([
    listAdminProducts(50),
    getAdminSettings(),
    getAdminOrderStats(),
    getAdminUserStats(),
    getActiveSessionStats(),
  ])
  const creatorStats = await getCreatorPipelineStats({ slaHours: settings.mediaKitSlaHours })

  const featuredCount = products.filter((product) => product.featured).length
  const publishedCount = products.filter((product) => product.status === 'active').length

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Typography as="h1" variant="heading">
          Dashboard overview
        </Typography>
        <Typography variant="body" className="text-text-secondary">
          Track catalog performance and creator program momentum at a glance. Use the shortcuts below to jump directly
          into edits.
        </Typography>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Revenue"
          value={`$${orderStats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          detail={`${orderStats.totalOrders} orders`}
          href="/dashboard/orders"
        />
        <SummaryCard
          label="Total Users"
          value={userStats.totalUsers.toLocaleString()}
          detail="Registered accounts"
          href="/dashboard/users"
        />
        <SummaryCard
          label="Active Sessions"
          value={analyticsStats.activeSessions.toLocaleString()}
          detail="Active in last 30m"
          href="/dashboard/analytics"
        />
        <SummaryCard
          label="Active products"
          value={publishedCount}
          detail={`${featuredCount} featured capsules`}
          href="/dashboard/catalog"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Draft or paused"
          value={products.length - publishedCount}
          detail="Review and publish when ready"
          href="/dashboard/catalog?status=draft"
        />
        <SummaryCard
          label="Creator applications"
          value={creatorStats.received}
          detail={`${creatorStats.reviewing} in review · ${creatorStats.approved} approved`}
          href="/dashboard/creators"
        />
        <SummaryCard
          label="Media kit requests"
          value={creatorStats.mediaKitRequested}
          detail={
            creatorStats.mediaKitFailed
              ? `${creatorStats.mediaKitFailed} delivery issues`
              : creatorStats.overdue
                ? `${creatorStats.overdue} waiting > ${settings.mediaKitSlaHours}h`
                : 'Send assets or resend if needed'
          }
          href="/dashboard/creators?filter=media-kit"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ActionCard
          title="Edit homepage headlines"
          description="Refresh hero copy, collection cards, and the creator CTA to keep the storefront current."
          ctaLabel="Open homepage editor"
          href="/dashboard/homepage"
        />
        <ActionCard
          title="Review creator pipeline"
          description="Approve new partners, assign tiers, and resend media kits in one place."
          ctaLabel="Manage creator program"
          href="/dashboard/creators"
        />
      </section>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  detail,
  href,
}: {
  label: string
  value: string | number
  detail: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border-subtle bg-surface-base px-5 py-6 shadow-soft transition hover:-translate-y-1 hover:border-accent-primary hover:shadow-medium"
    >
      <Typography variant="caption" className="uppercase tracking-[0.18em] text-text-muted">
        {label}
      </Typography>
      <Typography as="p" variant="title" className="py-2 text-text-primary">
        {value}
      </Typography>
      <Typography variant="body" className="text-text-secondary">
        {detail}
      </Typography>
      <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-primary transition group-hover:text-text-primary">
        View details →
      </span>
    </Link>
  )
}

function ActionCard({
  title,
  description,
  ctaLabel,
  href,
}: {
  title: string
  description: string
  ctaLabel: string
  href: string
}) {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border-subtle bg-surface-base px-6 py-6 shadow-soft md:flex-row md:items-center">
      <div className="space-y-2">
        <Typography as="h2" variant="title" className="text-text-primary">
          {title}
        </Typography>
        <Typography variant="body" className="text-text-secondary">
          {description}
        </Typography>
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-full border border-border-subtle px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary transition hover:border-accent-primary hover:text-text-primary"
      >
        {ctaLabel}
      </Link>
    </div>
  )
}
