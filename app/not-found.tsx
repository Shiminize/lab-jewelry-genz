import Image from 'next/image'
import Link from 'next/link'
import { Button, Typography } from '@/components/ui'
import { Section, SectionContainer } from '@/components/layout/Section'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-app">
      <SectionContainer size="content" className="space-y-6 rounded-xl border border-border-subtle bg-surface-base/95 px-10 py-16 text-center shadow-soft">
        <Typography variant="eyebrow" className="text-body-muted">
          Error 404
        </Typography>
        <Typography as="h1" variant="heading">
          This constellation is out of orbit
        </Typography>
        <Typography variant="body" className="text-body">
          The page you&apos;re looking for has drifted beyond the Coral & Sky grid. Head back to design your next icon piece.
        </Typography>
        <div className="mx-auto mt-4 mb-2 max-w-3xl overflow-hidden rounded-[12px] border border-border-subtle/60 bg-surface-base/80 shadow-soft">
          <div className="relative aspect-[3/2]">
            <Image
              src="/images/catalog/Sora/fallback/fallback_all_missing_3x2_line.webp"
              alt=""
              fill
              sizes="(min-width: 1280px) 900px, 100vw"
              className="object-cover"
              aria-hidden
              priority
            />
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 md:flex-row md:justify-center">
          <Button href="/" variant="accent" tone="coral" className="min-w-[12.5rem] justify-center">
            Return home
          </Button>
          <Button href="/collections" variant="outline" tone="sky" className="min-w-[12.5rem] justify-center">
            Explore jewelry
          </Button>
        </div>
      </SectionContainer>
    </div>
  )
}
