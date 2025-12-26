
"use client"

import { useState } from "react"
import { Typography } from "@/components/ui"

export default function PromotionForm({ action, initialData }: { action: any, initialData?: any }) {
    const [type, setType] = useState(initialData?.type || "PERCENTAGE")

    return (
        <form action={action} className="space-y-6">
            <input type="hidden" name="id" value={initialData?.id} />

            <div className="grid gap-6 md:grid-cols-2">
                <Field label="Code" htmlFor="code">
                    <input
                        id="code"
                        name="code"
                        defaultValue={initialData?.code}
                        required
                        className="w-full rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary uppercase tracking-wider shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-secondary/40"
                        placeholder="SUMMER20"
                    />
                </Field>

                <Field label="Active" htmlFor="isActive">
                    <select
                        id="isActive"
                        name="isActive"
                        defaultValue={String(initialData?.isActive ?? true)}
                        className="w-full rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-secondary/40"
                    >
                        <option value="true">Active</option>
                        <option value="false">Disabled</option>
                    </select>
                </Field>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Field label="Type" htmlFor="type">
                    <select
                        id="type"
                        name="type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-secondary/40"
                    >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FIXED">Fixed Amount ($)</option>
                    </select>
                </Field>

                <Field label={type === 'PERCENTAGE' ? "Percentage Value" : "Amount ($)"} htmlFor="value">
                    <input
                        id="value"
                        name="value"
                        type="number"
                        min="0"
                        step={type === 'PERCENTAGE' ? "1" : "0.01"}
                        defaultValue={initialData?.value}
                        required
                        className="w-full rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-secondary/40"
                    />
                </Field>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Field label="Min Spend ($)" htmlFor="minSpend">
                    <input
                        id="minSpend"
                        name="minSpend"
                        type="number"
                        min="0"
                        defaultValue={initialData?.minSpend || 0}
                        className="w-full rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-secondary/40"
                    />
                </Field>

                {type === 'PERCENTAGE' && (
                    <Field label="Max Discount Cap ($)" htmlFor="maxDiscount">
                        <input
                            id="maxDiscount"
                            name="maxDiscount"
                            type="number"
                            min="0"
                            defaultValue={initialData?.maxDiscount || ''}
                            placeholder="Optional"
                            className="w-full rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-secondary/40"
                        />
                        {/* <span className="text-xs text-text-muted">Max discount amount allowed</span> */}
                    </Field>
                )}

                <Field label="Usage Limit" htmlFor="maxUsage">
                    <input
                        id="maxUsage"
                        name="maxUsage"
                        type="number"
                        min="0"
                        defaultValue={initialData?.maxUsage || ''}
                        placeholder="Unlimited"
                        className="w-full rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-secondary/40"
                    />
                </Field>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full bg-accent-primary px-8 py-3 text-sm font-semibold tracking-[0.08em] text-surface-base shadow-soft transition hover:bg-accent-primary/90"
                >
                    Save Promotion
                </button>
            </div>
        </form>
    )
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
