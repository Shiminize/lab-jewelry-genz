import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { JournalArticlePage } from '@/components/page-templates/JournalArticlePage'
import { journalArticles } from '@/content/journal/articles'

type PageParams = {
  params: { section: string; slug: string }
}

const sectionToPath = (section: string) => section.toLowerCase().replace(/[^a-z0-9]+/g, '-')

export function generateStaticParams() {
  return journalArticles.map((article) => ({
    section: sectionToPath(article.section),
    slug: article.slug,
  }))
}

export function generateMetadata({ params }: PageParams): Metadata {
  const article = findArticle(params.section, params.slug)
  if (!article) {
    return {
      title: 'Journal — GlowGlitch',
      description: 'Editorial inspiration from the GlowGlitch studio.',
    }
  }
  return {
    title: `${article.title} — GlowGlitch Journal`,
    description: article.summary,
  }
}

export default function JournalArticleRoute({ params }: PageParams) {
  const article = findArticle(params.section, params.slug)
  if (!article) {
    notFound()
  }

  const related = journalArticles
    .filter(
      (entry) =>
        entry.slug !== article.slug &&
        entry.tags.some((tag) => article.tags.includes(tag)),
    )
    .slice(0, 3)
    .map((entry) => ({
      title: entry.title,
      summary: entry.summary,
      href: `/journal/${sectionToPath(entry.section)}/${entry.slug}`,
    }))

  return (
    <JournalArticlePage
      article={{
        title: article.title,
        section: article.section,
        summary: article.summary,
        tags: article.tags,
        pullQuotes: article.pullQuotes,
        publishedAt: article.publishedAt,
        body: article.body,
      }}
      related={related}
    />
  )
}

function findArticle(sectionParam: string, slug: string) {
  return journalArticles.find(
    (entry) => sectionToPath(entry.section) === sectionParam && entry.slug === slug,
  )
}
