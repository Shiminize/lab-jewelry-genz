import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-app px-6 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-border-subtle bg-surface-base/90 px-10 py-14 text-center shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Access denied</p>
        <h1 className="mt-4 text-4xl font-semibold text-text-primary">You need additional permissions</h1>
        <p className="mt-4 text-base text-text-secondary">
          This area is reserved for GlowGlitch admins. Sign in with an admin account or return to the main site.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl border border-border-subtle px-6 py-3 text-sm font-semibold text-text-primary transition hover:border-accent hover:text-accent"
          >
            Sign in again
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-black transition hover:bg-accent/90"
          >
            Back to GlowGlitch
          </Link>
        </div>
      </div>
    </section>
  )
}
