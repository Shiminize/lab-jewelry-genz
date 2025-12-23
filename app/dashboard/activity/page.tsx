import { revalidatePath } from 'next/cache'

import { getActivityForUndo, listAdminActivity, markActivityUndone } from '@/services/admin/activityLog'
import { getAdminProduct, updateAdminProduct } from '@/services/admin/catalog'
import { updateHomepageContent } from '@/services/homepageContent'

export default async function ActivityDashboardPage() {
  const activities = await listAdminActivity(60)

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-text-primary">Activity log</h1>
        <p className="text-sm text-text-secondary">
          See the latest changes made in the dashboard. Use undo to revert a product or homepage update if needed.
        </p>
      </header>

      <div className="space-y-4 rounded-2xl border border-border-subtle bg-surface-base px-6 py-6 shadow-soft">
        {activities.length ? (
          activities.map((activity) => (
            <form
              key={activity.id}
              action={undoActivityAction}
              className="flex flex-col gap-3 border-b border-border-subtle pb-4 last:border-b-0 last:pb-0"
            >
              <input type="hidden" name="activityId" value={activity.id} />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-text-primary">{activity.summary}</p>
                  <p className="text-xs text-text-secondary">
                    {activity.entityType} • {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                {activity.undoAvailable ? (
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full border border-border-subtle px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary transition hover:border-accent-primary hover:text-text-primary"
                  >
                    Undo
                  </button>
                ) : (
                  <span className="rounded-full border border-border-subtle px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-text-muted">
                    Undone
                  </span>
                )}
              </div>
            </form>
          ))
        ) : (
          <p className="text-center text-sm text-text-muted">No admin activity recorded yet.</p>
        )}
      </div>
    </div>
  )
}

async function undoActivityAction(formData: FormData) {
  'use server'
  const id = String(formData.get('activityId') ?? '')
  if (!id) return

  const activity = await getActivityForUndo(id)
  if (!activity || !activity.before) {
    return
  }

  try {
    if (activity.entityType === 'product') {
      const before = activity.before as any
      await updateAdminProduct(activity.entityId, {
        name: before.name,
        category: before.category,
        basePrice: before.basePrice ?? 0,
        featured: Boolean(before.featured),
        bestseller: Boolean(before.bestseller),
        status: before.status ?? 'draft',
        description: before.description ?? '',
        collections: Array.isArray(before.collections) ? before.collections : [],
      }, { skipLog: true })
    }

    if (activity.entityType === 'homepage') {
      await updateHomepageContent(activity.before as any, { skipLog: true })
    }

    await markActivityUndone(id)
    revalidatePath('/dashboard/activity')
    revalidatePath('/dashboard/catalog')
    revalidatePath('/dashboard/homepage')
    revalidatePath('/')
  } catch (error) {
    console.error('Failed to undo activity', error)
  }
}
