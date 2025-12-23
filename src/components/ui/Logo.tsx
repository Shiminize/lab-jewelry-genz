'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface LogoProps {
  className?: string
}

export function GlowGlitchLogo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn('inline-flex items-center gap-2', className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-coral-sky shadow-accent-glow">
        <span className="text-xs font-bold uppercase text-surface-base">GG</span>
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-base font-semibold tracking-[0.2em] text-text-primary">GlowGlitch</span>
        <span className="text-[0.625rem] uppercase tracking-[0.35em] text-text-muted">Coral Sky</span>
      </span>
    </Link>
  )
}
