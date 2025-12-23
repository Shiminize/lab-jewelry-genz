'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Section, SectionContainer } from '@/components/layout/Section'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/ui/ProductCard'
import { quizQuestions, calculateQuizResult, QUIZ_RESULTS } from '@/content/quiz'
import { getQuizResultProduct } from '@/actions/quiz'
import { type CatalogProductDetail } from '@/services/neon/catalogRepository'
import { cn } from '@/lib/utils'

export function QuizSection() {
    const [step, setStep] = useState<'intro' | 'question' | 'result'>('intro')
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [resultId, setResultId] = useState<string | null>(null)
    const [productData, setProductData] = useState<CatalogProductDetail | null>(null)
    const [loading, setLoading] = useState(false)
    const [isTransitioning, setIsTransitioning] = useState(false)

    const currentQuestion = quizQuestions[currentQuestionIndex]

    const handleStart = () => {
        setStep('question')
        setCurrentQuestionIndex(0)
        setAnswers({})
        setResultId(null)
        setProductData(null)
        setIsTransitioning(false)
    }

    const handleOptionSelect = (value: string) => {
        if (isTransitioning) return
        setIsTransitioning(true)

        const newAnswers = { ...answers, [currentQuestion.id]: value }
        setAnswers(newAnswers)

        if (currentQuestionIndex < quizQuestions.length - 1) {
            setTimeout(() => {
                setCurrentQuestionIndex((prev) => prev + 1)
                setIsTransitioning(false)
            }, 250)
        } else {
            const result = calculateQuizResult(newAnswers)
            setResultId(result)
            setStep('result') // Move to result step immediately, but loading might be true
            setIsTransitioning(false)
        }
    }

    // Fetch product data when resultId is set
    useEffect(() => {
        if (resultId && step === 'result') {
            const fetchProduct = async () => {
                setLoading(true)
                try {
                    // Get the slug from the static mapping
                    const staticResult = QUIZ_RESULTS[resultId]
                    if (staticResult?.slug) {
                        const product = await getQuizResultProduct(staticResult.slug)
                        setProductData(product)
                    }
                } catch (error) {
                    console.error('Error fetching quiz result product:', error)
                } finally {
                    setLoading(false)
                }
            }

            fetchProduct()
        }
    }, [resultId, step])

    const handleRetake = () => {
        setStep('intro')
        setAnswers({})
        setResultId(null)
        setCurrentQuestionIndex(0)
        setProductData(null)
        setIsTransitioning(false)
    }

    const staticResult = resultId ? QUIZ_RESULTS[resultId] : null

    // Use fetched data if available, otherwise fallback to static, or null
    // We prioritize the dynamic data (productData)
    // If loading, we might show a loader or valid static data if we want instant feedback?
    // Let's rely on productData for the 'dynamic' requirement, falling back to static only if fetch fails or while loading if we want (but prompt said "instead of current result")
    // I'll show a loading state for better UX, then the product.

    const displayProduct = productData || staticResult

    return (
        <Section spacing="relaxed" className="relative overflow-hidden bg-[var(--color-ink)] text-surface-base">
            {/* Background Decor */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-primary/20 blur-[100px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-secondary/10 blur-[100px] rounded-full mix-blend-screen" />
            </div>

            <SectionContainer size="content" className="relative z-10 flex flex-col items-center justify-center min-h-[500px]">

                <AnimatePresence mode="wait">
                    {step === 'intro' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center max-w-2xl mx-auto space-y-8"
                        >
                            <div className="space-y-4">
                                <Typography variant="eyebrow" className="text-[var(--color-accent-secondary)] tracking-[0.2em]">
                                    Find Your Frequency
                                </Typography>
                                <Typography as="h2" variant="heading" className="text-surface-base">
                                    Which Ring Matches Your Energy?
                                </Typography>
                                <p className="text-lg text-surface-base/80 leading-relaxed">
                                    6 questions. 1 perfect match. Discover the piece that speaks to your unique vibe.
                                </p>
                            </div>
                            <Button
                                onClick={handleStart}
                                className="bg-[var(--color-accent-secondary)] text-[var(--color-ink)] hover:bg-[var(--color-accent-secondary)]/90 px-8 py-6 text-lg tracking-widest uppercase font-semibold"
                            >
                                Start Quiz
                            </Button>
                        </motion.div>
                    )}

                    {step === 'question' && (
                        <motion.div
                            key={`question-${currentQuestionIndex}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full max-w-3xl mx-auto space-y-10"
                        >
                            {currentQuestion && (
                                <>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-accent-secondary)]/60 uppercase tracking-widest">
                                            <span>Question {currentQuestionIndex + 1} / {quizQuestions.length}</span>
                                            <span className="flex-1 h-[1px] bg-white/10" />
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-heading text-surface-base leading-tight">
                                            {currentQuestion.text}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {currentQuestion.options.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => handleOptionSelect(option.value)}
                                                disabled={isTransitioning}
                                                className={cn(
                                                    "group relative flex items-start text-left p-6 border border-white/10 rounded-lg transition-all duration-300",
                                                    isTransitioning
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : "hover:bg-white/5 hover:border-[var(--color-accent-secondary)]/50"
                                                )}
                                            >
                                                <span className="w-4 h-4 mt-1 rounded-full border border-white/30 mr-4 flex-shrink-0 group-hover:border-[var(--color-accent-secondary)] group-hover:bg-[var(--color-accent-secondary)]/20 transition-colors" />
                                                <span className="text-lg text-surface-base/90 group-hover:text-[var(--color-accent-secondary)] transition-colors">
                                                    {option.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {step === 'result' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-4xl mx-auto"
                        >
                            {loading ? (
                                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                                    <div className="w-12 h-12 border-4 border-[var(--color-accent-secondary)]/30 border-t-[var(--color-accent-secondary)] rounded-full animate-spin" />
                                    <p className="text-surface-base/60 animate-pulse">Calculating your vibe...</p>
                                </div>
                            ) : displayProduct ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                    <div className="order-2 md:order-1 space-y-6 text-left">
                                        <div className="space-y-2">
                                            <Typography variant="eyebrow" className="text-[var(--color-accent-secondary)] tracking-[0.2em]">
                                                Your Match
                                            </Typography>
                                            <h3 className="text-4xl font-heading text-surface-base">
                                                {displayProduct.name}
                                            </h3>
                                            <p className="text-xl text-surface-base/80 italic font-serif">
                                                &quot;{displayProduct.tagline}&quot;
                                            </p>
                                        </div>
                                        <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                            <Button
                                                href={`/products/${displayProduct.slug}`}
                                                className="bg-[var(--color-accent-secondary)] text-[var(--color-ink)] hover:bg-[var(--color-accent-secondary)]/90 px-8 py-4 uppercase tracking-widest"
                                            >
                                                Shop this style
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={handleRetake}
                                                className="text-surface-base hover:text-[var(--color-accent-secondary)] hover:bg-white/5 border border-white/20 px-8 py-4 uppercase tracking-widest"
                                            >
                                                Retake Quiz
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="order-1 md:order-2 h-[400px]">
                                        <ProductCard
                                            {...displayProduct}
                                            surfaceTone="veil"
                                            className="h-full border-none shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <p className="text-surface-base/60 mb-8">Could not load your result. Please try again.</p>
                                    <Button onClick={handleRetake} variant="ghost" className="border-white/20">
                                        Retake Quiz
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

            </SectionContainer>
        </Section>
    )
}
