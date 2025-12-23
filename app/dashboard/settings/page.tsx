import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type React from 'react'

import { Typography } from '@/components/ui'
import { getAdminSettings, updateAdminSettings } from '@/services/admin/settings'

interface SettingsPageProps {
  searchParams?: Record<string, string | string[]>
}

export default async function DashboardSettingsPage({ searchParams }: SettingsPageProps) {
  const notice = getParam(searchParams, 'saved')
  const settings = await getAdminSettings()

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <Typography as="h1" variant="heading">
          Admin settings
        </Typography>
        <Typography variant="body" className="text-text-secondary">
          Configure creator notifications, automation rules, and fulfillment reminders for the GlowGlitch dashboard.
        </Typography>
      </header>

      {notice === '1' ? (
        <div className="rounded-2xl border border-accent-secondary/50 bg-accent-secondary/10 px-4 py-3 text-sm text-text-primary shadow-soft">
          Settings saved successfully.
        </div>
      ) : null}

      <section className="space-y-6 rounded-2xl border border-border-subtle bg-surface-base px-6 py-6 shadow-soft md:px-8 md:py-8">
        <div className="space-y-2">
          <Typography as="h2" variant="title" className="text-text-primary">
            Creator notifications
          </Typography>
          <Typography variant="body" className="text-text-secondary">
            Choose who receives creator application alerts and how media-kit follow-ups are automated.
          </Typography>
        </div>

        <form action={updateSettingsAction} className="space-y-6">
          <Field label="Notification email" htmlFor="notifyEmail">
            <input
              id="notifyEmail"
              name="notifyEmail"
              type="email"
              defaultValue={settings.notifyEmail}
              placeholder="team@glowglitch.com"
              className="w-full rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-secondary/40"
            />
          </Field>

          <Field label="Slack webhook URL" htmlFor="slackWebhook">
            <input
              id="slackWebhook"
              name="slackWebhook"
              defaultValue={settings.slackWebhook}
              placeholder="https://hooks.slack.com/services/..."
              className="w-full rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-secondary/40"
            />
            <span className="text-xs text-text-muted">Use a Slack incoming webhook to receive creator alerts in a channel.</span>
          </Field>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface-panel px-4 py-4 text-sm text-text-secondary shadow-soft">
              <input
                type="checkbox"
                name="autoSendMediaKit"
                defaultChecked={settings.autoSendMediaKit}
                className="mt-1 h-5 w-5 rounded border border-border-subtle text-accent-primary focus:ring-accent-primary"
              />
              <span>
                <span className="block text-sm font-semibold text-text-primary">Auto-send media kit when reviewing</span>
                Enable to automatically email the latest media kit as soon as a creator is moved into review.
              </span>
            </label>

            <Field label="Media kit follow-up SLA (hours)" htmlFor="mediaKitSlaHours">
              <input
                id="mediaKitSlaHours"
                name="mediaKitSlaHours"
                type="number"
                min={1}
                defaultValue={settings.mediaKitSlaHours}
                className="w-full rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-secondary/40"
              />
              <span className="text-xs text-text-muted">Used to flag pending applications in the dashboard overview.</span>
            </Field>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-accent-primary px-5 py-2.5 text-sm font-semibold tracking-[0.08em] text-surface-base shadow-soft transition hover:bg-accent-primary/90"
            >
              Save settings
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function getParam(params: SettingsPageProps['searchParams'], key: string) {
  const value = params?.[key]
  if (!value) return undefined
  return Array.isArray(value) ? value[0] : value
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-2 text-body" htmlFor={htmlFor}>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">{label}</span>
      {children}
    </label>
  )
}

async function updateSettingsAction(formData: FormData) {
  'use server'

  const notifyEmail = String(formData.get('notifyEmail') ?? '').trim()
  const slackWebhook = String(formData.get('slackWebhook') ?? '').trim()
  const autoSendMediaKit = formData.get('autoSendMediaKit') === 'on'
  const mediaKitSlaHoursRaw = Number(formData.get('mediaKitSlaHours') ?? '')
  const mediaKitSlaHours = Number.isFinite(mediaKitSlaHoursRaw) && mediaKitSlaHoursRaw > 0 ? mediaKitSlaHoursRaw : 72

  await updateAdminSettings({
    notifyEmail: notifyEmail.length ? notifyEmail : undefined,
    slackWebhook: slackWebhook.length ? slackWebhook : undefined,
    autoSendMediaKit,
    mediaKitSlaHours,
  })

  revalidatePath('/dashboard/settings')
  redirect('/dashboard/settings?saved=1')
}
