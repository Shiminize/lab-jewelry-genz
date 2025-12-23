import { redirect } from 'next/navigation'
import { requireAdminSession } from '@/lib/auth/roleGuards'
import { signOut } from '@/lib/auth/server'
import { AdminSidebar } from './components/AdminSidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/catalog', label: 'Catalog', icon: '💎' },
  { href: '/dashboard/homepage', label: 'Homepage', icon: '🛋️' },
  { href: '/dashboard/creators', label: 'Creators', icon: '🤝' },
  { href: '/dashboard/orders', label: 'Orders', icon: '🧾' },
  { href: '/dashboard/support', label: 'Support Queue', icon: '💬' },
  { href: '/dashboard/analytics/concierge', label: 'Concierge Analytics', icon: '📈' },
  { href: '/dashboard/activity', label: 'Activity', icon: '📝' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
]

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await requireAdminSession()
  if (!session) {
    redirect(`/login?from=${encodeURIComponent('/dashboard')}`)
  }

  async function signOutAction() {
    'use server'
    await signOut({ redirectTo: '/login' })
  }

  return (
    <div className="flex min-h-screen bg-app">
      <AdminSidebar navItems={navItems} session={{ user: session.user }} signOutAction={signOutAction} />
      <main className="flex-1 px-6 pb-16 pt-10 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-10">{children}</div>
      </main>
    </div>
  )
}
