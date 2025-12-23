'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export function FitSelector() {
    const [selected, setSelected] = React.useState<number | null>(null)
    const sizes = [5, 6, 7, 8, 9]

    return (
        <div className="space-y-4">
            <span className="font-accent text-xs uppercase tracking-[0.2em] text-text-muted">
                Fit Option
            </span>
            <h3 className="text-lg font-medium text-text-primary">Choose your fit</h3>

            <div className="flex w-full gap-4">
                {sizes.map((size) => (
                    <button
                        key={size}
                        type="button"
                        onClick={() => setSelected(size)}
                        className={cn(
                            'flex-1 h-12 flex items-center justify-center font-body text-sm transition-all duration-200',
                            selected === size
                                ? 'bg-text-primary text-surface-base'
                                : 'bg-white text-text-primary hover:bg-border-subtle/50'
                        )}
                    >
                        {size}
                    </button>
                ))}
            </div>
        </div>
    )
}
