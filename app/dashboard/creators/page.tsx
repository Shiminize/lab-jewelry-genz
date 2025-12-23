import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import type React from 'react'

import {
  listCreatorApplications,
  getCreatorApplicationById,
  resendCreatorMediaKit,
  updateCreatorApplication,
} from '@/services/admin/creatorApplications'
import { getAdminSettings } from '@/services/admin/settings'
import { getCreatorWidgetStats } from '@/services/admin/creatorStats'
import { Typography } from '@/components/ui'

interface CreatorDashboardPageProps {
  searchParams?: Record<string, string | string[]>
}

export default async function CreatorDashboardPage({ searchParams }: CreatorDashboardPageProps) {
  const filter = getParam(searchParams, 'filter')
  const resendStatus = getParam(searchParams, 'resend')
  const resendMessage = getParam(searchParams, 'resendMessage')
  const [applications, widgetStats] = await Promise.all([
    listCreatorApplications(),
    getCreatorWidgetStats(),
  ])

  const filtered = (() => {
    switch (filter) {
      case 'media-kit':
        return applications.filter((app) => app.wantsMediaKit)
      case 'pending':
        return applications.filter((app) => app.status === 'received')
      case 'reviewing':
        return applications.filter((app) => app.status === 'reviewing')
      case 'approved':
        return applications.filter((app) => app.status === 'approved')
      case 'declined':
        return applications.filter((app) => app.status === 'declined')
      default:
        return applications
    }
  })()

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Typography as="h1" variant="heading">
          Creator program
        </Typography>
        <Typography variant="body" className="text-text-secondary">
          Review new applications, track onboarding steps, and update status as creators move through the pipeline.
        </Typography>
      </header>

      {resendStatus === 'success' ? (
        <Alert tone="success" title="Media kit resent">
          We sent the latest media kit to the creator.
        </Alert>
      ) : null}
      {resendStatus === 'error' ? (
        <Alert tone="error" title="Media kit delivery failed">
          {resendMessage ?? 'We could not deliver the media kit email. Please try again or contact support.'}
        </Alert>
      ) : null}

      {widgetStats.totalWidgetAssistedSales > 0 ? (
        <section className="space-y-6">
          <div className="relative w-full aspect-[4/1] overflow-hidden rounded-2xl bg-surface-base border border-border-subtle shadow-soft">
            <Image
              src="/images/catalog/Sora/creators/creators-analytic.webp"
              alt="Creators Analytics"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              label="Widget-Assisted Sales"
              value={widgetStats.totalWidgetAssistedSales.toString()}
              helper="Orders with Concierge interaction"
              accent
            />
            <StatCard
              label="Widget-Assisted Revenue"
              value={`$${widgetStats.totalWidgetAssistedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              helper="Total from widget-assisted orders"
            />
            <StatCard
              label="Creator Commissions"
              value={`$${widgetStats.widgetAssistedCommission.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              helper="From widget-assisted sales"
            />
            <StatCard
              label="Creators Benefiting"
              value={widgetStats.creatorBreakdown.length.toString()}
              helper="With widget-assisted orders"
            />
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-text-secondary">
        <FilterLink label="All" href="/dashboard/creators" active={!filter} />
        <FilterLink label="Pending review" href="/dashboard/creators?filter=pending" active={filter === 'pending'} />
        <FilterLink label="Reviewing" href="/dashboard/creators?filter=reviewing" active={filter === 'reviewing'} />
        <FilterLink label="Approved" href="/dashboard/creators?filter=approved" active={filter === 'approved'} />
        <FilterLink label="Declined" href="/dashboard/creators?filter=declined" active={filter === 'declined'} />
        <FilterLink label="Media kit requested" href="/dashboard/creators?filter=media-kit" active={filter === 'media-kit'} />
        <span className="ml-auto text-[0.65rem]">
          Showing {filtered.length} of {applications.length} applications
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-subtle shadow-soft">
        <table className="min-w-full divide-y divide-border-subtle text-sm">
          <thead className="bg-surface-panel">
            <tr className="text-left text-xs uppercase tracking-[0.18em] text-text-muted">
              <th className="px-5 py-3 font-semibold">Creator</th>
              <th className="px-5 py-3 font-semibold">Platform</th>
              <th className="px-5 py-3 font-semibold">Audience</th>
              <th className="px-5 py-3 font-semibold">Media kit</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Notes</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle bg-surface-base text-text-secondary">
            {filtered.map((application) => (
              <tr key={application.id}>
                <td className="px-5 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-text-primary">{application.name}</span>
                    <Link href={`mailto:${application.email}`} className="text-xs text-accent-primary hover:text-text-primary">
                      {application.email}
                    </Link>
                  </div>
                </td>
                <td className="px-5 py-4 capitalize">{application.platform}</td>
                <td className="px-5 py-4">{application.audience}</td>
                <td className="px-5 py-4 capitalize">
                  <span>{application.mediaKitStatus?.replace('-', ' ')}</span>
                  {application.mediaKitStatus === 'sent' && application.mediaKitSentAt ? (
                    <span className="mt-1 block text-[0.65rem] text-text-muted">
                      Sent {formatDateTime(application.mediaKitSentAt)}
                    </span>
                  ) : null}
                  {application.mediaKitStatus === 'failed' && application.mediaKitError ? (
                    <span className="mt-1 block text-[0.65rem] text-accent-primary">
                      Failed — {application.mediaKitError}
                    </span>
                  ) : null}
                </td>
                <td className="px-5 py-4">
                  <form action={updateCreatorStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={application.id} />
                    <select
                      name="status"
                      defaultValue={application.status}
                      className="rounded-full border border-border-subtle bg-surface-panel px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                    >
                      <option value="received">Received</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="approved">Approved</option>
                      <option value="declined">Declined</option>
                    </select>
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-full border border-border-subtle px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-text-secondary transition hover:border-accent-primary hover:text-text-primary"
                    >
                      Save
                    </button>
                  </form>
                </td>
                <td className="px-5 py-4">
                  <form action={updateCreatorNotesAction} className="flex flex-col gap-2">
                    <input type="hidden" name="id" value={application.id} />
                    <textarea
                      name="notes"
                      rows={2}
                      defaultValue={application.notes}
                      placeholder="Add an onboarding note"
                      className="w-full rounded-lg border border-border-subtle bg-surface-panel px-3 py-2 text-xs text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent-secondary"
                    />
                    <button
                      type="submit"
                      className="self-start rounded-full border border-border-subtle px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-text-secondary transition hover:border-accent-primary hover:text-text-primary"
                    >
                      Save note
                    </button>
                  </form>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <form action={markMediaKitSentAction}>
                      <input type="hidden" name="id" value={application.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-full border border-border-subtle px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary transition hover:border-accent-secondary hover:text-text-primary"
                        disabled={application.mediaKitStatus === 'sent'}
                      >
                        {application.mediaKitStatus === 'sent' ? 'Sent' : 'Mark kit sent'}
                      </button>
                    </form>
                    {application.wantsMediaKit &&
                      (application.mediaKitStatus === 'failed' || application.mediaKitStatus === 'pending') ? (
                      <form action={resendMediaKitAction}>
                        <input type="hidden" name="id" value={application.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 rounded-full border border-border-subtle px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent-primary transition hover:border-accent-primary hover:text-text-primary"
                        >
                          Resend kit
                        </button>
                      </form>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-text-muted">
                  No creator applications found for this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function getParam(params: CreatorDashboardPageProps['searchParams'], key: string) {
  const value = params?.[key]
  if (!value) return undefined
  return Array.isArray(value) ? value[0] : value
}

function FilterLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1.5 font-semibold transition ${active
        ? 'border-accent-primary bg-accent-primary/10 text-text-primary'
        : 'border-border-subtle text-text-secondary hover:border-accent-primary hover:text-text-primary'
        }`}
    >
      {label}
    </Link>
  )
}

function formatDateTime(date?: Date) {
  if (!date) return ''
  try {
    return date.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return date.toISOString()
  }
}

function Alert({ tone, title, children }: { tone: 'success' | 'error'; title: string; children?: React.ReactNode }) {
  const baseClass =
    tone === 'success'
      ? 'border-accent-secondary/60 bg-accent-secondary/10'
      : 'border-accent-primary/60 bg-accent-primary/10'

  return (
    <div className={`space-y-1 rounded-2xl border px-4 py-3 text-sm text-text-primary shadow-soft ${baseClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em]">{title}</p>
      {children ? <p className="text-sm">{children}</p> : null}
    </div>
  )
}

function StatCard({
  label,
  value,
  helper,
  accent = false,
}: {
  label: string
  value: string
  helper?: string
  accent?: boolean
}) {
  return (
    <div
      className={`space-y-1 rounded-2xl border px-5 py-6 shadow-soft ${accent
        ? 'border-accent-primary/20 bg-accent-primary/5'
        : 'border-border-subtle bg-surface-base'
        }`}
    >
      <Typography variant="caption" className="uppercase tracking-[0.18em] text-text-muted">
        {label}
      </Typography>
      <Typography variant="title" className={accent ? 'text-accent-primary' : 'text-text-primary'}>
        {value}
      </Typography>
      {helper ? (
        <Typography variant="caption" className="text-text-secondary">
          {helper}
        </Typography>
      ) : null}
    </div>
  )
}

async function updateCreatorStatusAction(formData: FormData) {
  'use server'

  try {
    const id = String(formData.get('id') ?? '')
    const status = String(formData.get('status') ?? 'received') as
      | 'received'
      | 'reviewing'
      | 'approved'
      | 'declined'

    await updateCreatorApplication(id, { status })

    if (status === 'reviewing') {
      try {
        const settings = await getAdminSettings()
        if (settings.autoSendMediaKit) {
          const application = await getCreatorApplicationById(id)
          if (application && application.wantsMediaKit && application.mediaKitStatus !== 'sent') {
            await resendCreatorMediaKit(id)
          }
        }
      } catch (automationError) {
        console.error('Auto media kit send failed', automationError)
      }
    }

    revalidatePath('/dashboard/creators')
  } catch (error) {
    console.error('Failed to update creator status', error)
  }
}

async function updateCreatorNotesAction(formData: FormData) {
  'use server'
  try {
    const id = String(formData.get('id') ?? '')
    const notes = String(formData.get('notes') ?? '')

    await updateCreatorApplication(id, { notes })
    revalidatePath('/dashboard/creators')
  } catch (error) {
    console.error('Failed to save creator notes', error)
  }
}

async function markMediaKitSentAction(formData: FormData) {
  'use server'
  try {
    const id = String(formData.get('id') ?? '')
    await updateCreatorApplication(id, { mediaKitStatus: 'sent', mediaKitSentAt: new Date() })
    revalidatePath('/dashboard/creators')
  } catch (error) {
    console.error('Failed to mark media kit sent', error)
  }
}

async function resendMediaKitAction(formData: FormData) {
  'use server'

  const id = String(formData.get('id') ?? '')
  if (!id) {
    redirect('/dashboard/creators?resend=error')
  }

  try {
    const result = await resendCreatorMediaKit(id)
    revalidatePath('/dashboard/creators')

    const params = new URLSearchParams({ resend: result.success ? 'success' : 'error' })
    if (!result.success && result.reason) {
      params.set('resendMessage', result.reason)
    }

    redirect(`/dashboard/creators?${params.toString()}`)
  } catch (error) {
    console.error('Failed to resend media kit', error)
    redirect('/dashboard/creators?resend=error')
  }
}
