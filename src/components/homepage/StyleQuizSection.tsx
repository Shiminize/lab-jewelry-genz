'use client'

import React, { useState, useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { H2, H3, BodyText, MutedText } from '@/components/foundation/Typography'
import { ProductCard } from '@/components/products/ProductCard'
import { 
  Sparkles, 
  ArrowLeft, 
  Check, 
  RefreshCw,
  Share2,
  Heart,
  Gem,
  Crown,
  Star
} from 'lucide-react'

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface QuizAnswer {
  id: string
  text: string
  value: string
  icon?: React.ReactNode
  image?: string
  description?: string
}

export interface QuizQuestion {
  id: string
  question: string
  subtitle?: string
  answers: QuizAnswer[]
  type: 'single' | 'multiple'
  category: 'style' | 'occasion' | 'metal' | 'stone' | 'personality' | 'budget'
}

export interface QuizProgress {
  currentStep: number
  totalSteps: number
  answers: Record<string, string | string[]>
  startTime: number
}

export interface PersonalityType {
  id: string
  name: string
  description: string
  traits: string[]
  icon: React.ReactNode
  color: string
  styleGuide: {
    metals: string[]
    stones: string[]
    styles: string[]
    occasions: string[]
  }
}

export interface QuizResult {
  personalityType: PersonalityType
  confidence: number
  recommendations: QuizRecommendation[]
  completionTime: number
}

export interface QuizRecommendation {
  productId: string
  reason: string
  matchScore: number
}

// Mock product data for recommendations (in real app, this would come from API)
const mockProducts = [
  {
    _id: 'prod-1',
    name: 'Classic Solitaire Engagement Ring',
    category: 'rings' as const,
    basePrice: 2500,
    originalPrice: 3000,
    images: {
      primary: '/api/placeholder/300/300',
      gallery: [],
      thumbnail: '/api/placeholder/150/150'
    }
  },
  {
    _id: 'prod-2', 
    name: 'Vintage Art Deco Necklace',
    category: 'necklaces' as const,
    basePrice: 1800,
    images: {
      primary: '/api/placeholder/300/300',
      gallery: [],
      thumbnail: '/api/placeholder/150/150'
    }
  },
  {
    _id: 'prod-3',
    name: 'Minimalist Gold Hoops',
    category: 'earrings' as const, 
    basePrice: 650,
    images: {
      primary: '/api/placeholder/300/300',
      gallery: [],
      thumbnail: '/api/placeholder/150/150'
    }
  }
]

// =====================================================
// QUIZ DATA
// =====================================================

const personalityTypes: PersonalityType[] = [
  {
    id: 'minimalist-maven',
    name: 'Minimalist Maven',
    description: 'You appreciate clean lines, subtle elegance, and timeless design. Less is always more in your world.',
    traits: ['Clean aesthetic', 'Quality over quantity', 'Versatile pieces', 'Understated elegance'],
    icon: <Gem className="w-6 h-6" />,
    color: 'text-accent',
    styleGuide: {
      metals: ['White Gold', 'Platinum', 'Silver'],
      stones: ['Classic Solitaire', 'Simple Settings'],
      styles: ['Clean Lines', 'Geometric Shapes'],
      occasions: ['Everyday', 'Work']
    }
  },
  {
    id: 'statement-maker',
    name: 'Statement Maker', 
    description: 'Bold, confident, and unapologetic. You love pieces that turn heads and start conversations.',
    traits: ['Bold designs', 'Eye-catching pieces', 'Confident expression', 'Trend-forward'],
    icon: <Crown className="w-6 h-6" />,
    color: 'text-cta',
    styleGuide: {
      metals: ['Yellow Gold', 'Rose Gold'],
      stones: ['Colorful Gems', 'Large Centers'],
      styles: ['Bold Settings', 'Unique Designs'],
      occasions: ['Special Events', 'Date Night']
    }
  },
  {
    id: 'classic-romantic',
    name: 'Classic Romantic',
    description: 'You adore traditional beauty, vintage charm, and pieces with romantic storytelling.',
    traits: ['Vintage inspiration', 'Romantic details', 'Traditional beauty', 'Sentimental value'],
    icon: <Heart className="w-6 h-6" />,
    color: 'text-foreground',
    styleGuide: {
      metals: ['Rose Gold', 'Yellow Gold'],
      stones: ['Vintage Settings', 'Halo Designs'],
      styles: ['Ornate Details', 'Classic Cuts'],
      occasions: ['Special Events', 'Romantic Moments']
    }
  },
  {
    id: 'bohemian-spirit',
    name: 'Bohemian Spirit',
    description: 'Free-spirited and creative, you mix and match unique pieces that reflect your artistic soul.',
    traits: ['Artistic expression', 'Mixed metals', 'Unique combinations', 'Cultural influences'],
    icon: <Star className="w-6 h-6" />,
    color: 'text-foreground',
    styleGuide: {
      metals: ['Mixed Metals', 'Textured Finishes'],
      stones: ['Colorful Gems', 'Unique Cuts'],
      styles: ['Layered Looks', 'Organic Shapes'],
      occasions: ['Creative Events', 'Self-Expression']
    }
  }
]

const quizQuestions: QuizQuestion[] = [
  {
    id: 'style-preference',
    question: 'Which aesthetic speaks to you?',
    subtitle: 'Choose the style that resonates with your personal taste',
    type: 'single',
    category: 'style',
    answers: [
      {
        id: 'minimalist',
        text: 'Minimalist',
        value: 'minimalist',
        description: 'Clean lines, simple elegance',
        icon: <Gem className="w-8 h-8" />
      },
      {
        id: 'statement',
        text: 'Statement',
        value: 'statement', 
        description: 'Bold, eye-catching pieces',
        icon: <Crown className="w-8 h-8" />
      },
      {
        id: 'classic',
        text: 'Classic',
        value: 'classic',
        description: 'Timeless, traditional beauty',
        icon: <Heart className="w-8 h-8" />
      },
      {
        id: 'bohemian',
        text: 'Bohemian',
        value: 'bohemian',
        description: 'Artistic, free-spirited design',
        icon: <Star className="w-8 h-8" />
      }
    ]
  },
  {
    id: 'occasion-focus',
    question: 'When do you wear jewelry most?',
    subtitle: 'Think about your lifestyle and daily routine',
    type: 'single',
    category: 'occasion',
    answers: [
      {
        id: 'everyday',
        text: 'Everyday',
        value: 'everyday',
        description: 'Daily wear, versatile pieces'
      },
      {
        id: 'special-events',
        text: 'Special Events',
        value: 'special-events',
        description: 'Celebrations, parties, occasions'
      },
      {
        id: 'work',
        text: 'Work',
        value: 'work',
        description: 'Professional, polished look'
      },
      {
        id: 'date-night',
        text: 'Date Night',
        value: 'date-night',
        description: 'Romantic, elegant moments'
      }
    ]
  },
  {
    id: 'metal-preference',
    question: 'Which metal makes you feel confident?',
    subtitle: 'Your metal choice says a lot about your personal style',
    type: 'single',
    category: 'metal',
    answers: [
      {
        id: 'silver',
        text: 'Silver/White Gold',
        value: 'silver',
        description: 'Cool, modern, versatile'
      },
      {
        id: 'gold',
        text: 'Yellow Gold',
        value: 'gold',
        description: 'Warm, classic, luxurious'
      },
      {
        id: 'rose-gold',
        text: 'Rose Gold',
        value: 'rose-gold',
        description: 'Romantic, trendy, feminine'
      },
      {
        id: 'mixed',
        text: 'Mixed Metals',
        value: 'mixed',
        description: 'Creative, eclectic, artistic'
      }
    ]
  },
  {
    id: 'stone-style',
    question: 'What catches your eye?',
    subtitle: 'The gemstone setting that speaks to your soul',
    type: 'single',
    category: 'stone',
    answers: [
      {
        id: 'solitaire',
        text: 'Classic Solitaire',
        value: 'solitaire',
        description: 'Simple, elegant, timeless'
      },
      {
        id: 'colorful',
        text: 'Colorful Gems',
        value: 'colorful',
        description: 'Vibrant, unique, expressive'
      },
      {
        id: 'vintage',
        text: 'Vintage Settings',
        value: 'vintage',
        description: 'Ornate, detailed, romantic'
      },
      {
        id: 'geometric',
        text: 'Modern Geometric',
        value: 'geometric',
        description: 'Contemporary, angular, bold'
      }
    ]
  },
  {
    id: 'personality',
    question: 'How do you express yourself?',
    subtitle: 'Your jewelry should reflect your inner personality',
    type: 'single',
    category: 'personality',
    answers: [
      {
        id: 'subtle',
        text: 'Subtle Elegance',
        value: 'subtle',
        description: 'Refined, understated, graceful'
      },
      {
        id: 'bold',
        text: 'Bold Statement',
        value: 'bold',
        description: 'Confident, dramatic, fearless'
      },
      {
        id: 'timeless',
        text: 'Timeless Classic',
        value: 'timeless',
        description: 'Traditional, sophisticated, enduring'
      },
      {
        id: 'creative',
        text: 'Creative Artist',
        value: 'creative',
        description: 'Unique, expressive, unconventional'
      }
    ]
  },
  {
    id: 'budget-range',
    question: 'What\'s your comfort zone?',
    subtitle: 'Investment level for your perfect piece',
    type: 'single',
    category: 'budget',
    answers: [
      {
        id: 'budget-1',
        text: '$500 - $1,000',
        value: '500-1000',
        description: 'Quality everyday pieces'
      },
      {
        id: 'budget-2',
        text: '$1,000 - $2,500',
        value: '1000-2500',
        description: 'Special occasion jewelry'
      },
      {
        id: 'budget-3',
        text: '$2,500 - $5,000',
        value: '2500-5000',
        description: 'Investment pieces'
      },
      {
        id: 'budget-4',
        text: '$5,000+',
        value: '5000+',
        description: 'Luxury collections'
      }
    ]
  }
]

// =====================================================
// COMPONENT VARIANTS
// =====================================================

const quizSectionVariants = cva(
  'w-full bg-background',
  {
    variants: {
      variant: {
        default: 'py-16 lg:py-24',
        compact: 'py-12 lg:py-16',
        hero: 'py-20 lg:py-32'
      },
      background: {
        default: 'bg-background',
        muted: 'bg-muted/20',
        accent: 'bg-accent/5'
      }
    },
    defaultVariants: {
      variant: 'default',
      background: 'default'
    }
  }
)

const questionCardVariants = cva(
  'bg-background border border-border rounded-xl p-6 lg:p-8 transition-all duration-300',
  {
    variants: {
      state: {
        default: 'shadow-sm',
        active: 'shadow-lg border-accent/50',
        completed: 'shadow-sm bg-accent/5'
      }
    },
    defaultVariants: {
      state: 'default'
    }
  }
)

const answerButtonVariants = cva(
  'w-full p-4 border border-border rounded-lg text-left transition-all duration-200 group hover:border-accent/50 hover:bg-accent/5',
  {
    variants: {
      selected: {
        true: 'border-accent bg-accent/10 shadow-sm',
        false: 'border-border bg-background'
      },
      size: {
        default: 'p-4',
        compact: 'p-3',
        large: 'p-6'
      }
    },
    defaultVariants: {
      selected: false,
      size: 'default'
    }
  }
)

// =====================================================
// MAIN COMPONENT
// =====================================================

interface StyleQuizSectionProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof quizSectionVariants> {
  onQuizComplete?: (result: QuizResult) => void
  showSocialShare?: boolean
}

export function StyleQuizSection({
  className,
  variant,
  background,
  onQuizComplete,
  showSocialShare = true,
  ...props
}: StyleQuizSectionProps) {
  // Quiz state management
  const [quizState, setQuizState] = useState<'intro' | 'taking' | 'results'>('intro')
  const [progress, setProgress] = useState<QuizProgress>({
    currentStep: 0,
    totalSteps: quizQuestions.length,
    answers: {},
    startTime: 0
  })
  const [result, setResult] = useState<QuizResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Auto-save to localStorage
  useEffect(() => {
    if (quizState === 'taking' && Object.keys(progress.answers).length > 0) {
      localStorage.setItem('styleQuizProgress', JSON.stringify(progress))
    }
  }, [progress, quizState])

  // Load saved progress on mount
  useEffect(() => {
    const saved = localStorage.getItem('styleQuizProgress')
    if (saved) {
      try {
        const savedProgress = JSON.parse(saved)
        setProgress(savedProgress)
      } catch (error) {
        console.error('Failed to load saved quiz progress:', error)
      }
    }
  }, [])

  // Start quiz
  const startQuiz = () => {
    setQuizState('taking')
    setProgress({
      currentStep: 0,
      totalSteps: quizQuestions.length,
      answers: {},
      startTime: Date.now()
    })
  }

  // Handle answer selection
  const handleAnswer = (questionId: string, answerId: string) => {
    const newAnswers = { ...progress.answers }
    newAnswers[questionId] = answerId
    
    setProgress(prev => ({
      ...prev,
      answers: newAnswers
    }))
  }

  // Navigate questions
  const goToNextQuestion = () => {
    if (progress.currentStep < progress.totalSteps - 1) {
      setProgress(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1
      }))
    } else {
      completeQuiz()
    }
  }

  const goToPreviousQuestion = () => {
    if (progress.currentStep > 0) {
      setProgress(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1
      }))
    }
  }

  // Complete quiz and calculate results
  const completeQuiz = async () => {
    setIsLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const calculatedResult = calculatePersonalityType(progress.answers)
    setResult(calculatedResult)
    setQuizState('results')
    setIsLoading(false)
    
    // Clear saved progress
    localStorage.removeItem('styleQuizProgress')
    
    // Callback for parent component
    onQuizComplete?.(calculatedResult)
  }

  // Reset quiz
  const resetQuiz = () => {
    setQuizState('intro')
    setProgress({
      currentStep: 0,
      totalSteps: quizQuestions.length,
      answers: {},
      startTime: 0
    })
    setResult(null)
    localStorage.removeItem('styleQuizProgress')
  }

  // Calculate personality type based on answers
  const calculatePersonalityType = (answers: Record<string, string>): QuizResult => {
    const scores: Record<string, number> = {
      'minimalist-maven': 0,
      'statement-maker': 0,
      'classic-romantic': 0,
      'bohemian-spirit': 0
    }

    // Scoring algorithm based on answer patterns
    Object.entries(answers).forEach(([questionId, answerId]) => {
      switch (answerId) {
        case 'minimalist':
        case 'everyday':
        case 'silver':
        case 'solitaire':
        case 'subtle':
        case '500-1000':
          scores['minimalist-maven'] += 1
          break
        case 'statement':
        case 'special-events':
        case 'gold':
        case 'geometric':
        case 'bold':
        case '5000+':
          scores['statement-maker'] += 1
          break
        case 'classic':
        case 'date-night':
        case 'rose-gold':
        case 'vintage':
        case 'timeless':
        case '2500-5000':
          scores['classic-romantic'] += 1
          break
        case 'bohemian':
        case 'work':
        case 'mixed':
        case 'colorful':
        case 'creative':
        case '1000-2500':
          scores['bohemian-spirit'] += 1
          break
      }
    })

    // Find highest scoring personality
    const topPersonality = Object.entries(scores).reduce((max, [key, score]) => 
      score > max.score ? { id: key, score } : max
    , { id: '', score: 0 })

    const personalityType = personalityTypes.find(p => p.id === topPersonality.id) || personalityTypes[0]
    const confidence = Math.min(95, Math.max(65, (topPersonality.score / Object.keys(answers).length) * 100))
    
    // Generate product recommendations (simplified)
    const recommendations: QuizRecommendation[] = mockProducts.map((product, index) => ({
      productId: product._id,
      reason: `Perfect match for your ${personalityType.name.toLowerCase()} style`,
      matchScore: Math.max(75, confidence - (index * 10))
    }))

    return {
      personalityType,
      confidence,
      recommendations,
      completionTime: Date.now() - progress.startTime
    }
  }

  // Share result
  const shareResult = async () => {
    if (!result) return
    
    const text = `I'm a ${result.personalityType.name}! 💎 Find your jewelry personality with GlowGlitch's Style Quiz.`
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({ text, url })
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard?.writeText(`${text} ${url}`)
      }
    } else {
      navigator.clipboard?.writeText(`${text} ${url}`)
    }
  }

  const currentQuestion = quizQuestions[progress.currentStep]
  const currentAnswer = progress.answers[currentQuestion?.id] as string

  return (
    <section 
      className={cn(quizSectionVariants({ variant, background }), className)}
      aria-labelledby="style-quiz-heading"
      {...props}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* INTRO STATE */}
        {quizState === 'intro' && (
          <div className="text-center max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
            </div>
            
            <H2 id="style-quiz-heading" className="mb-4">
              Style Quiz: Find Your Vibe
            </H2>
            
            <BodyText size="lg" className="mb-8 text-foreground">
              Don't know where to start? Our 2-minute quiz helps you discover the perfect piece that fits your personality
            </BodyText>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {personalityTypes.map((type) => (
                <div key={type.id} className="text-center p-4 bg-muted/10 rounded-lg">
                  <div className={cn('flex justify-center mb-2', type.color)}>
                    {type.icon}
                  </div>
                  <MutedText size="sm" className="font-medium">
                    {type.name}
                  </MutedText>
                </div>
              ))}
            </div>
            
            <Button 
              size="lg" 
              onClick={startQuiz}
              className="min-w-48"
            >
              Take the Quiz
            </Button>
          </div>
        )}

        {/* TAKING QUIZ STATE */}
        {quizState === 'taking' && currentQuestion && (
          <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <MutedText size="sm">
                  Question {progress.currentStep + 1} of {progress.totalSteps}
                </MutedText>
                <MutedText size="sm">
                  {Math.round(((progress.currentStep + 1) / progress.totalSteps) * 100)}% Complete
                </MutedText>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-2">
                <div 
                  className="bg-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((progress.currentStep + 1) / progress.totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className={cn(questionCardVariants({ state: 'active' }))}>
              <H3 className="mb-2">{currentQuestion.question}</H3>
              {currentQuestion.subtitle && (
                <MutedText className="mb-6">{currentQuestion.subtitle}</MutedText>
              )}
              
              {/* Answers */}
              <div className="space-y-3">
                {currentQuestion.answers.map((answer) => (
                  <button
                    key={answer.id}
                    onClick={() => handleAnswer(currentQuestion.id, answer.value)}
                    className={cn(
                      answerButtonVariants({ 
                        selected: currentAnswer === answer.value 
                      })
                    )}
                    aria-pressed={currentAnswer === answer.value}
                  >
                    <div className="flex items-center space-x-4">
                      {answer.icon && (
                        <div className={cn(
                          'flex-shrink-0 transition-colors',
                          currentAnswer === answer.value ? 'text-accent' : 'text-foreground'
                        )}>
                          {answer.icon}
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <BodyText weight="medium" className="mb-1">
                          {answer.text}
                        </BodyText>
                        {answer.description && (
                          <MutedText size="sm">
                            {answer.description}
                          </MutedText>
                        )}
                      </div>
                      {currentAnswer === answer.value && (
                        <Check className="w-5 h-5 text-accent flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <Button
                variant="ghost"
                onClick={goToPreviousQuestion}
                disabled={progress.currentStep === 0}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <Button
                onClick={goToNextQuestion}
                disabled={!currentAnswer}
                isLoading={isLoading && progress.currentStep === progress.totalSteps - 1}
                className="flex items-center"
              >
                {progress.currentStep === progress.totalSteps - 1 ? 'Get Results' : 'Next'}
              </Button>
            </div>
          </div>
        )}

        {/* RESULTS STATE */}
        {quizState === 'results' && result && (
          <div className="max-w-4xl mx-auto">
            {/* Results Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center">
                  <div className={cn('transition-colors', result.personalityType.color)}>
                    {result.personalityType.icon}
                  </div>
                </div>
              </div>
              
              <H2 className="mb-4">
                You're a {result.personalityType.name}!
              </H2>
              
              <BodyText size="lg" className="mb-6 max-w-2xl mx-auto">
                {result.personalityType.description}
              </BodyText>
              
              <div className="flex justify-center items-center space-x-6 mb-8">
                <div className="text-center">
                  <BodyText weight="semibold" className="text-accent">
                    {Math.round(result.confidence)}%
                  </BodyText>
                  <MutedText size="sm">Match Confidence</MutedText>
                </div>
                <div className="text-center">
                  <BodyText weight="semibold" className="text-accent">
                    {Math.round(result.completionTime / 1000)}s
                  </BodyText>
                  <MutedText size="sm">Completion Time</MutedText>
                </div>
              </div>
            </div>

            {/* Personality Traits */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-muted/10 rounded-xl p-6">
                <H3 className="mb-4">Your Style Traits</H3>
                <div className="space-y-2">
                  {result.personalityType.traits.map((trait, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-accent flex-shrink-0" />
                      <BodyText size="sm">{trait}</BodyText>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-muted/10 rounded-xl p-6">
                <H3 className="mb-4">Perfect For You</H3>
                <div className="space-y-3">
                  <div>
                    <MutedText size="sm" className="font-medium mb-1">Metals</MutedText>
                    <BodyText size="sm">{result.personalityType.styleGuide.metals.join(', ')}</BodyText>
                  </div>
                  <div>
                    <MutedText size="sm" className="font-medium mb-1">Stones</MutedText>
                    <BodyText size="sm">{result.personalityType.styleGuide.stones.join(', ')}</BodyText>
                  </div>
                  <div>
                    <MutedText size="sm" className="font-medium mb-1">Occasions</MutedText>
                    <BodyText size="sm">{result.personalityType.styleGuide.occasions.join(', ')}</BodyText>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Recommendations */}
            <div className="mb-12">
              <H3 className="mb-6 text-center">Curated Just For You</H3>
              <div className="grid md:grid-cols-3 gap-6">
                {result.recommendations.slice(0, 3).map((rec, index) => {
                  const product = mockProducts.find(p => p._id === rec.productId)
                  if (!product) return null
                  
                  return (
                    <div key={rec.productId} className="relative">
                      <ProductCard 
                        product={product}
                        variant="featured"
                      />
                      <div className="absolute -top-2 -right-2 bg-accent text-background px-2 py-1 rounded-full text-xs font-semibold">
                        {rec.matchScore}% Match
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" className="min-w-48">
                Shop Your Style
              </Button>
              
              {showSocialShare && (
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={shareResult}
                  className="min-w-48"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Results
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                onClick={resetQuiz}
                className="flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retake Quiz
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default StyleQuizSection