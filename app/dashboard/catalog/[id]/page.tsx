import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { getAdminProduct, updateAdminProduct } from '@/services/admin/catalog'
import { Typography } from '@/components/ui'

interface ProductEditPageProps {
  params: { id: string }
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const product = await getAdminProduct(decodeURIComponent(params.id))
  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Link href="/dashboard/catalog" className="text-xs uppercase tracking-[0.18em] text-accent-primary">
          ← Back to catalog
        </Link>
        <Typography as="h1" variant="heading">
          Edit product
        </Typography>
        <Typography variant="body" className="text-text-secondary">
          Update the details below and save to refresh the live catalog. Changes will appear across the storefront
          instantly.
        </Typography>
      </header>

      <form action={updateProductAction.bind(null, product.id)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Product name" htmlFor="name">
            <input
              id="name"
              name="name"
              defaultValue={product.name}
              required
              className="w-full rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-secondary/40"
            />
          </Field>
          <Field label="Category" htmlFor="category">
            <input
              id="category"
              name="category"
              defaultValue={product.category}
              required
              className="w-full rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-secondary/40"
            />
          </Field>
          <Field label="Base price (USD)" htmlFor="basePrice">
            <input
              id="basePrice"
              name="basePrice"
              type="number"
              min={0}
              step="0.01"
              defaultValue={product.basePrice}
              required
              className="w-full rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-secondary/40"
            />
          </Field>
          <Field label="Status" htmlFor="status">
            <select
              id="status"
              name="status"
              defaultValue={product.status ?? 'draft'}
              className="w-full rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-secondary/40"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Featured capsule" htmlFor="featured">
            <Toggle id="featured" name="featured" defaultChecked={product.featured} />
          </Field>
          <Field label="Bestseller" htmlFor="bestseller">
            <Toggle id="bestseller" name="bestseller" defaultChecked={product.bestseller} />
          </Field>
        </div>

        <Field label="Description" htmlFor="description">
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={product.description}
            className="w-full rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-secondary/40"
          />
        </Field>

        <Field label="Collections (comma separated)" htmlFor="collections">
          <input
            id="collections"
            name="collections"
            defaultValue={product.collections.join(', ')}
            className="w-full rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-secondary/40"
          />
        </Field>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-accent-primary px-5 py-2.5 text-sm font-semibold tracking-[0.08em] text-surface-base shadow-soft transition hover:bg-accent-primary/90"
          >
            Save changes
          </button>
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full border border-border-subtle px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary transition hover:border-accent-primary hover:text-text-primary"
          >
            View live page
          </Link>
        </div>
      </form>
    </div>
  )
}

async function updateProductAction(productId: string, formData: FormData) {
  'use server'

  try {
    const name = String(formData.get('name') ?? '').trim()
    const category = String(formData.get('category') ?? '').trim()
    const basePrice = Number(formData.get('basePrice') ?? 0)
    const status = String(formData.get('status') ?? 'draft').trim()
    const description = String(formData.get('description') ?? '')
    const collectionsInput = String(formData.get('collections') ?? '')
    const featured = formData.get('featured') === 'on'
    const bestseller = formData.get('bestseller') === 'on'

    const collections = collectionsInput
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    if (!name || !category || Number.isNaN(basePrice)) {
      throw new Error('Invalid form submission')
    }

    await updateAdminProduct(productId, {
      name,
      category,
      basePrice,
      status,
      description,
      featured,
      bestseller,
      collections,
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/catalog')
    revalidatePath(`/dashboard/catalog/${productId}`)
    revalidatePath('/collections')
    redirect('/dashboard/catalog?status=' + status)
  } catch (error) {
    console.error('Failed to update product', error)
    redirect(`/dashboard/catalog/${productId}?error=1`)
  }
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

function Toggle({
  id,
  name,
  defaultChecked,
}: {
  id: string
  name: string
  defaultChecked?: boolean
}) {
  return (
    <input
      id={id}
      name={name}
      type="checkbox"
      defaultChecked={defaultChecked}
      className="h-5 w-5 rounded border border-border-subtle text-accent-primary focus:ring-accent-primary"
    />
  )
}
