import { homepageContent, type HomepageContent } from '@/content/homepage'
import prisma from '@/lib/prisma'
import { logAdminActivity } from './admin/activityLog'

export interface HomepageContentUpdates {
  hero?: {
    kicker?: string
    headline?: string
    body?: string
    primaryCtaLabel?: string
    primaryCtaHref?: string
    secondaryCtaLabel?: string
    secondaryCtaHref?: string
  }
  collectionSection?: {
    title?: string
    description?: string
  }
  creatorCta?: {
    headline?: string
    subheadline?: string
    supporting?: string
    proofText?: string
    proofHref?: string
    proofLinkLabel?: string
    primaryCtaLabel?: string
    primaryCtaHref?: string
    secondaryCtaLabel?: string
    secondaryCtaHref?: string
  }
}

export async function getHomepageContent(): Promise<HomepageContent> {
  try {
    const settings = await prisma.homepageSettings.findUnique({
      where: { id: 'homepage' }
    });

    if (!settings) {
      return homepageContent
    }

    // Helper to extract JSON fields
    const dbHero = (settings.hero as any) || {};
    const dbCollection = (settings.collectionSection as any) || {};
    const dbCreator = (settings.creatorCta as any) || {};

    const hero = {
      ...homepageContent.hero,
      ...dbHero,
      // Merge nested if needed but assuming JSON blob replaces or is structured.
      // The original code merged deeply. Let's replicate merging.
      primaryCta: { ...homepageContent.hero.primaryCta, ...(dbHero.primaryCta || {}) },
      secondaryCta: { ...homepageContent.hero.secondaryCta, ...(dbHero.secondaryCta || {}) }
    }

    const collectionSection = {
      ...homepageContent.collectionSection,
      ...dbCollection
    }

    const creatorCta = {
      ...homepageContent.creatorCta,
      ...dbCreator,
      proof: { ...homepageContent.creatorCta.proof, ...(dbCreator.proof || {}) },
      primaryCta: { ...homepageContent.creatorCta.primaryCta, ...(dbCreator.primaryCta || {}) },
      secondaryCta: { ...homepageContent.creatorCta.secondaryCta, ...(dbCreator.secondaryCta || {}) },
    }

    return {
      ...homepageContent,
      hero,
      collectionSection,
      creatorCta,
    }
  } catch (error) {
    console.warn('Falling back to default homepage content', error)
    return homepageContent
  }
}

export async function updateHomepageContent(updates: HomepageContentUpdates, options?: { skipLog?: boolean }) {
  // We need to fetch existing to merge effectively before saving JSON if we don't want to overwrite deep keys
  // existing code did $set with dot notation "hero.title" which merges deeply in Mongo.
  // Prisma JSON update replaces the "hero" object if we provide it.

  const existing = await prisma.homepageSettings.findUnique({ where: { id: 'homepage' } }) || { hero: {}, collectionSection: {}, creatorCta: {} }

  // Deep merge updates into existing JSON state
  // This simplistic merge mimics the mongo dot notation intention
  const newHero = { ...(existing.hero as any), ...updates.hero };
  const newCollection = { ...(existing.collectionSection as any), ...updates.collectionSection };
  const newCreator = { ...(existing.creatorCta as any), ...updates.creatorCta };

  const after = await prisma.homepageSettings.upsert({
    where: { id: 'homepage' },
    create: {
      id: 'homepage',
      hero: newHero,
      collectionSection: newCollection,
      creatorCta: newCreator
    },
    update: {
      hero: newHero,
      collectionSection: newCollection,
      creatorCta: newCreator,
      updatedAt: new Date()
    }
  });

  if (!options?.skipLog) {
    await logAdminActivity({
      action: 'update_homepage',
      entityType: 'homepage',
      entityId: 'homepage',
      summary: 'Updated homepage messaging',
      before: existing as any, // casting for log
      after: updates as Record<string, unknown>,
    })
  }
}
