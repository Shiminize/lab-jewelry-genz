import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getHomepageContent, updateHomepageContent } from '@/services/homepageContent'
import { Typography } from '@/components/ui'

interface HomepageDashboardPageProps {
  searchParams?: Record<string, string | string[]>
}

export default async function HomepageDashboardPage({ searchParams }: HomepageDashboardPageProps) {
  const content = await getHomepageContent()
  const notice = getParam(searchParams, 'saved')

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <Typography as="h1" variant="heading">
          Homepage content
        </Typography>
        <Typography variant="body" className="text-text-secondary">
          Update hero copy, collection messaging, and the creator CTA so the storefront always matches your current
          campaigns.
        </Typography>
      </header>

      {notice ? (
        <div className="rounded-2xl border border-accent-secondary/50 bg-accent-secondary/10 px-4 py-3 text-sm text-text-primary shadow-soft">
          {notice === 'hero' ? 'Hero copy updated.' : notice === 'collection' ? 'Collection section updated.' : 'Creator CTA updated.'}
        </div>
      ) : null}

      <section className="space-y-6 rounded-2xl border border-border-subtle bg-surface-base px-6 py-6 shadow-soft md:px-8 md:py-8">
        <div className="space-y-2">
          <Typography as="h2" variant="title" className="text-text-primary">
            Hero section
          </Typography>
          <Typography variant="body" className="text-text-secondary">
            Control the primary headline and CTA buttons at the top of the homepage.
          </Typography>
        </div>
        <form action={updateHeroAction}>
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Kicker" name="kicker" defaultValue={content.hero.kicker} />
            <Field label="Headline" name="headline" defaultValue={content.hero.headlineLine1} />
          </div>
          <Field label="Body copy" name="body" defaultValue={content.hero.body} textarea />
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Primary CTA label" name="primaryLabel" defaultValue={content.hero.primaryCta.label} />
            <Field label="Primary CTA link" name="primaryHref" defaultValue={content.hero.primaryCta.href} />
            <Field
              label="Secondary CTA label"
              name="secondaryLabel"
              defaultValue={content.hero.secondaryCta?.label ?? ''}
            />
            <Field
              label="Secondary CTA link"
              name="secondaryHref"
              defaultValue={content.hero.secondaryCta?.href ?? ''}
            />
          </div>
          <SaveButton />
        </form>
      </section>

      <section className="space-y-6 rounded-2xl border border-border-subtle bg-surface-base px-6 py-6 shadow-soft md:px-8 md:py-8">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-text-primary">Collection section</h2>
          <p className="text-sm text-text-secondary">Adjust the headline and description that appear above the collection cards.</p>
        </div>
        <form action={updateCollectionAction} className="space-y-4">
          <Field label="Section title" name="collectionTitle" defaultValue={content.collectionSection.title} />
          <Field
            label="Section description"
            name="collectionDescription"
            defaultValue={content.collectionSection.description}
            textarea
          />
          <SaveButton />
        </form>
      </section>

      <section className="space-y-6 rounded-2xl border border-border-subtle bg-surface-base px-6 py-6 shadow-soft md:px-8 md:py-8">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-text-primary">Creator CTA</h2>
          <p className="text-sm text-text-secondary">
            Keep the creator program pitch fresh with updated proof points and button links.
          </p>
        </div>
        <form action={updateCreatorCtaAction} className="space-y-4">
          <Field label="Headline" name="ctaHeadline" defaultValue={content.creatorCta.headline} />
          <Field label="Subheadline" name="ctaSubheadline" defaultValue={content.creatorCta.subheadline} />
          <Field label="Supporting copy" name="ctaSupporting" defaultValue={content.creatorCta.supporting} textarea />
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Proof text" name="ctaProofText" defaultValue={content.creatorCta.proof.text} />
            <Field label="Proof link label" name="ctaProofLinkLabel" defaultValue={content.creatorCta.proof.linkLabel} />
            <Field label="Proof link href" name="ctaProofHref" defaultValue={content.creatorCta.proof.href} />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Primary CTA label" name="ctaPrimaryLabel" defaultValue={content.creatorCta.primaryCta.label} />
            <Field label="Primary CTA href" name="ctaPrimaryHref" defaultValue={content.creatorCta.primaryCta.href} />
            <Field label="Secondary CTA label" name="ctaSecondaryLabel" defaultValue={content.creatorCta.secondaryCta.label} />
            <Field label="Secondary CTA href" name="ctaSecondaryHref" defaultValue={content.creatorCta.secondaryCta.href} />
          </div>
          <SaveButton />
        </form>
      </section>
    </div>
  )
}

function getParam(params: HomepageDashboardPageProps['searchParams'], key: string) {
  const value = params?.[key]
  if (!value) return undefined
  return Array.isArray(value) ? value[0] : value
}

function Field({
  label,
  name,
  defaultValue,
  textarea,
}: {
  label: string
  name: string
  defaultValue?: string
  textarea?: boolean
}) {
  return (
    <label className="flex flex-col gap-2 text-body" htmlFor={name}>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">{label}</span>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          rows={3}
          defaultValue={defaultValue}
          className="w-full rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-secondary/40"
        />
      ) : (
        <input
          id={name}
          name={name}
          defaultValue={defaultValue}
          className="w-full rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-secondary/40"
        />
      )}
    </label>
  )
}

function SaveButton() {
  return (
    <div className="pt-4">
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-accent-primary px-5 py-2.5 text-sm font-semibold tracking-[0.08em] text-surface-base shadow-soft transition hover:bg-accent-primary/90"
      >
        Save changes
      </button>
    </div>
  )
}

async function updateHeroAction(formData: FormData) {
  'use server'

  try {
    await updateHomepageContent({
      hero: {
        kicker: optionalString(formData.get('kicker')),
        headline: optionalString(formData.get('headline')),
        body: optionalString(formData.get('body')),
        primaryCtaLabel: optionalString(formData.get('primaryLabel')),
        primaryCtaHref: optionalString(formData.get('primaryHref')),
        secondaryCtaLabel: optionalString(formData.get('secondaryLabel')),
        secondaryCtaHref: optionalString(formData.get('secondaryHref')),
      },
    })
    revalidatePath('/')
    revalidatePath('/dashboard/homepage')
    redirect('/dashboard/homepage?saved=hero')
  } catch (error) {
    console.error('Failed to update hero content', error)
    redirect('/dashboard/homepage?error=hero')
  }
}

async function updateCollectionAction(formData: FormData) {
  'use server'

  try {
    await updateHomepageContent({
      collectionSection: {
        title: optionalString(formData.get('collectionTitle')),
        description: optionalString(formData.get('collectionDescription')),
      },
    })
    revalidatePath('/')
    revalidatePath('/dashboard/homepage')
    redirect('/dashboard/homepage?saved=collection')
  } catch (error) {
    console.error('Failed to update collection section', error)
    redirect('/dashboard/homepage?error=collection')
  }
}

async function updateCreatorCtaAction(formData: FormData) {
  'use server'

  try {
    await updateHomepageContent({
      creatorCta: {
        headline: optionalString(formData.get('ctaHeadline')),
        subheadline: optionalString(formData.get('ctaSubheadline')),
        supporting: optionalString(formData.get('ctaSupporting')),
        proofText: optionalString(formData.get('ctaProofText')),
        proofLinkLabel: optionalString(formData.get('ctaProofLinkLabel')),
        proofHref: optionalString(formData.get('ctaProofHref')),
        primaryCtaLabel: optionalString(formData.get('ctaPrimaryLabel')),
        primaryCtaHref: optionalString(formData.get('ctaPrimaryHref')),
        secondaryCtaLabel: optionalString(formData.get('ctaSecondaryLabel')),
        secondaryCtaHref: optionalString(formData.get('ctaSecondaryHref')),
      },
    })
    revalidatePath('/')
    revalidatePath('/dashboard/homepage')
    redirect('/dashboard/homepage?saved=creator')
  } catch (error) {
    console.error('Failed to update creator CTA', error)
    redirect('/dashboard/homepage?error=creator')
  }
}

function optionalString(input: FormDataEntryValue | null): string | undefined {
  if (typeof input !== 'string') return undefined
  const value = input.trim()
  return value.length ? value : undefined
}
