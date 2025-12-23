'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export type VariantOption = 'astronaut-demo' | 'ring-classic-002' | 'ring-luxury-001'

export function VariantSelector() {
    const [selected, setSelected] = React.useState<VariantOption>('astronaut-demo')

    const options: { id: VariantOption; label: string; activeLabel: string }[] = [
        { id: 'astronaut-demo', label: 'Astronaut Demo', activeLabel: 'Active' },
        { id: 'ring-classic-002', label: 'Ring Classic 002', activeLabel: 'Tap to preview style' },
        { id: 'ring-luxury-001', label: 'Ring Luxury 001', activeLabel: 'Tap to preview style' },
    ]

    return (
        <div className="space-y-4">
            <span className="font-accent text-xs uppercase tracking-[0.2em] text-text-muted">
                Variant Selector
            </span>
            <h3 className="text-lg font-medium text-text-primary">Choose your style</h3>
            <p className="text-sm text-text-muted">Swap between demos without leaving the preview.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelected(option.id)}
                        className={cn(
                            'flex flex-col items-start justify-center p-6 text-left transition-all duration-300',
                            selected === option.id
                                ? 'bg-border-strong/30' // Darker/active bg
                                : 'bg-white hover:bg-border-subtle/20'
                        )}
                    >
                        <span className="font-heading text-lg font-semibold text-text-primary block mb-1">
                            {option.label}
                        </span>
                        <span className="text-xs text-text-secondary">
                            {option.activeLabel}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}
