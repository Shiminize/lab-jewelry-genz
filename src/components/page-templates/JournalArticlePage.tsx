import type { ReactNode } from 'react'
import Link from 'next/link'

import { Section, SectionContainer } from '@/components/layout/Section'
import { Typography } from '@/components/ui'

export type JournalArticle = {
  title: string
  section: string
  summary?: string
  tags: string[]
  pullQuotes?: string[]
  publishedAt?: string
  body: ReactNode
}

type RelatedStory = {
  title: string
  href: string
  summary?: string
}

interface JournalArticlePageProps {
  article: JournalArticle
  related?: RelatedStory[]
}

export function JournalArticlePage({ article, related = [] }: JournalArticlePageProps) {
  return (
    <div className="bg-app">
      <Section spacing="relaxed">
        <SectionContainer className="space-y-4">
          <Typography variant="eyebrow" className="uppercase tracking-[0.3em] text-text-muted">
            {article.section}
          </Typography>
          <Typography as="h1" variant="heading">
            {article.title}
          </Typography>
          {article.summary ? (
            <Typography variant="body" className="max-w-3xl text-text-secondary">
              {article.summary}
            </Typography>
          ) : null}
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
            {article.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-border-subtle/60 px-3 py-1">
                {tag}
              </span>
            ))}
          </div>
          {article.publishedAt ? (
            <Typography variant="caption" className="text-text-muted">
              Published {article.publishedAt}
            </Typography>
          ) : null}
        </SectionContainer>
      </Section>

      <Section spacing="compact">
        <SectionContainer className="space-y-10 md:grid md:grid-cols-[2fr_1fr] md:gap-12 md:space-y-0">
          <article className="prose prose-invert max-w-none">
            {article.body}
          </article>
          {article.pullQuotes?.length ? (
            <aside className="space-y-4 rounded-3xl border border-border-subtle/60 bg-surface-base/70 p-6 text-sm italic text-text-secondary">
              {article.pullQuotes.map((quote) => (
                <p key={quote} className="border-l-2 border-accent-primary/60 pl-4">
                  {quote}
                </p>
              ))}
            </aside>
          ) : null}
        </SectionContainer>
      </Section>

      {related.length ? (
        <Section spacing="compact">
          <SectionContainer className="space-y-4">
            <Typography as="h2" variant="title">
              Related stories
            </Typography>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((story) => (
                <Link
                  key={story.href}
                  href={story.href}
                  className="rounded-2xl border border-border-subtle/60 bg-surface-base/70 p-5 transition hover:border-accent-primary/60"
                >
                  <Typography as="h3" variant="body" className="font-semibold text-text-primary">
                    {story.title}
                  </Typography>
                  {story.summary ? (
                    <Typography variant="body" className="mt-2 text-text-secondary">
                      {story.summary}
                    </Typography>
                  ) : null}
                </Link>
              ))}
            </div>
          </SectionContainer>
        </Section>
      ) : null}
    </div>
  )
}
