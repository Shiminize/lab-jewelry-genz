'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Accordion } from '@/components/ui/Accordion'
import { Section, SectionContainer } from '@/components/layout/Section'
import { ProductGallery } from '@/components/product/ProductGallery'
import { MaterialSelector, MATERIAL_OPTIONS, MaterialOptionId } from '@/components/product/MaterialSelector'
import type { ProductDetail } from '@/content/products'

interface ProductDetailViewProps {
    product: ProductDetail
}

const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
})

export function ProductDetailView({ product }: ProductDetailViewProps) {
    const [selectedMaterialId, setSelectedMaterialId] = React.useState<MaterialOptionId>('silver')

    const selectedMaterial = MATERIAL_OPTIONS.find((m) => m.id === selectedMaterialId) || MATERIAL_OPTIONS[0]
    const currentPrice = product.price + selectedMaterial.priceMod

    const galleryImages = product.gallery?.length ? product.gallery : [product.heroImage]
    const uniqueImages = Array.from(new Set([product.heroImage, ...galleryImages]))

    const accordionItems = [
        {
            value: 'story',
            trigger: 'Design Story',
            content: <p className="leading-relaxed font-body text-text-secondary">{product.story}</p>,
        },
        {
            value: 'materials',
            trigger: 'Materials',
            content: (
                <ul className="space-y-3 font-body">
                    {product.materials?.map((item) => (
                        <li key={item} className="flex items-center gap-3 text-text-secondary text-sm">
                            <span className="h-0.5 w-3 bg-border-strong" />
                            {item}
                        </li>
                    )) || <li className="text-text-secondary text-sm">No materials listed</li>}
                </ul>
            ),
        },
        {
            value: 'dimensions',
            trigger: 'Dimensions',
            content: (
                <ul className="space-y-3 font-body">
                    {product.dimensions?.map((item) => (
                        <li key={item} className="flex items-center gap-3 text-text-secondary text-sm">
                            <span className="h-0.5 w-3 bg-border-strong" />
                            {item}
                        </li>
                    )) || <li className="text-text-secondary text-sm">Dimensions not available</li>}
                </ul>
            ),
        },
        {
            value: 'care',
            trigger: 'Care Notes',
            content: (
                <ul className="space-y-3 font-body">
                    {product.care?.map((note) => (
                        <li key={note} className="flex items-center gap-3 text-text-secondary text-sm">
                            <span className="h-0.5 w-3 bg-border-strong" />
                            {note}
                        </li>
                    )) || <li className="text-text-secondary text-sm">No care instructions available</li>}
                </ul>
            ),
        },
    ]

    return (
        <Section spacing="relaxed" className="pb-32 bg-surface-base">
            <SectionContainer>
                {/* Breadcrumb / Back Link */}
                <div className="mb-8">
                    <Link
                        href="/collections"
                        className="group inline-flex items-center gap-2 type-caption text-xs tracking-[0.2em] text-text-muted transition-colors hover:text-text-primary"
                    >
                        <span className="h-px w-4 bg-border-strong group-hover:w-6 transition-all duration-300" />
                        Back to collections
                    </Link>
                </div>

                <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-24 lg:items-start">
                    {/* Media Column - Sticky on Desktop */}
                    <div className="flex flex-col gap-6 lg:sticky lg:top-32">
                        <ProductGallery
                            images={uniqueImages}
                            productName={product.title}
                            tone={product.slug === 'coral-orbit' ? 'magenta' : 'cyan'} // Dynamic tone
                        />
                    </div>

                    {/* Customizer Column */}
                    <div className="flex flex-col space-y-12">

                        {/* Header Info */}
                        <div className="space-y-4">
                            <span className="type-eyebrow text-text-muted block">
                                {product.brand}
                            </span>
                            <h1 className="heading-xl text-text-primary">
                                {product.title}
                            </h1>
                            <p className="body-text text-text-secondary leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Customizer Controls */}
                        <div className="space-y-10">
                            <MaterialSelector
                                selected={selectedMaterialId}
                                onSelect={setSelectedMaterialId}
                            />
                        </div>

                        {/* Selection Summary / Action */}
                        <div className="space-y-6 pt-8 border-t border-border-strong">
                            <h3 className="text-xl font-heading font-medium text-text-primary">Your Configuration</h3>

                            <div className="flex flex-col gap-1 text-sm text-text-secondary">
                                <div className="flex justify-between">
                                    <span>Selected Variant</span>
                                    <span className="text-text-primary">Standard Gradient</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Finish</span>
                                    <span className="text-text-primary font-medium">{selectedMaterial.label}</span>
                                </div>
                            </div>

                            {/* Zero-Radius Fix: Removed rounded-lg */}
                            <button
                                type="button"
                                onClick={() => window.dispatchEvent(new CustomEvent('widget:toggle'))}
                                className="flex flex-col gap-2 bg-white p-4 shadow-sm border border-border-subtle text-left transition-colors duration-200 hover:border-accent-primary/40 hover:shadow-md w-full"
                            >
                                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold uppercase tracking-widest bg-text-muted/10 text-text-primary px-2 py-1">New</span>
                                        <span className="font-heading font-medium text-text-primary">Concierge</span>
                                    </div>
                                    <span className="text-sm text-text-muted group-hover:text-text-primary transition-colors">Chat with us</span>
                                </div>
                                <p className="text-xs text-text-muted leading-relaxed">
                                    Our team is available 24/7 to assist with sizing, styling advice, and custom requests.
                                </p>
                            </button>

                            {/* Desktop CTA */}
                            <div className="hidden lg:block pt-2">
                                <Button
                                    size="lg"
                                    variant="primary"
                                    className="w-full rounded-none"
                                >
                                    Add to Bag — {usdFormatter.format(currentPrice)}
                                </Button>
                                <p className="mt-4 text-center text-xs text-text-muted">
                                    Free shipping & returns within Japan
                                </p>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-border-strong">
                            <Accordion
                                items={accordionItems}
                                defaultValue="story"
                                className="rounded-none border-none"
                            />
                        </div>

                    </div>
                </div>
            </SectionContainer>

            {/* Mobile Sticky CTA */}
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-strong bg-surface-page/95 px-6 py-4 backdrop-blur lg:hidden">
                <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                        <span className="block type-caption text-text-muted truncate">{product.title}</span>
                        <span className="heading-lg line-clamp-1">{usdFormatter.format(currentPrice)}</span>
                    </div>
                    <Button size="lg" variant="primary" className="rounded-none px-8">
                        Reserve
                    </Button>
                </div>
            </div>
        </Section>
    )
}
