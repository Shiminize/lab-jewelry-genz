import Image from 'next/image'
import Link from 'next/link'

import { Section, SectionContainer } from '@/components/layout/Section'
import { cn } from '@/lib/utils'
import type { HomepageCollectionType } from '@/content/homepage'

interface CollectionTypesSectionProps {
  items: HomepageCollectionType[]
  className?: string
}

export function CollectionTypesSection({ items, className }: CollectionTypesSectionProps) {
  if (!items?.length) return null

  return (
    <Section spacing="compact" className={cn("bg-ink text-accent-contrast", className)}>
      <SectionContainer size="full" className="px-0">
        <div className="grid gap-[clamp(8px,2vw,24px)] md:grid-cols-2">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="group relative min-h-[clamp(220px,40vw,520px)] rounded-none overflow-hidden no-underline text-inherit focus-visible:outline-2 focus-visible:outline-accent-contrast focus-visible:outline-offset-4">
              <div className="absolute inset-0">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1280px) 40vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-400 group-hover:scale-105 group-focus-visible:scale-105"
                    priority={false}
                  />
                ) : (
                  <span className="sr-only">Collection preview for {item.title}</span>
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-ink)_8%,transparent)_0%,color-mix(in_oklab,var(--color-ink)_80%,transparent)_100%)]" aria-hidden />
              </div>
              <div className="relative z-10 flex flex-col justify-center items-center text-center h-full p-[clamp(20px,5vw,48px)] gap-[var(--space-fluid-sm)]">
                <p className="m-0 font-accent text-xs tracking-[0.24em] uppercase text-[color-mix(in_oklab,var(--color-accent-contrast)_70%,transparent)]">Read More</p>
                <h3 className="m-0 font-heading text-[clamp(1.6rem,3vw,2rem)] text-accent-contrast capitalize">{item.title}</h3>
                <p className="m-0 max-w-[24ch] text-base leading-[1.6] text-[color-mix(in_oklab,var(--color-accent-contrast)_75%,transparent)]">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </SectionContainer>
    </Section>
  )
}
