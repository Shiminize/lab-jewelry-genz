// Quiz Logic - Extracted for CLAUDE_RULES compliance
import { PERSONALITY_TYPES, MOCK_PRODUCTS } from './quizData'
import type { QuizResult, QuizRecommendation } from './quizData'

/**
 * Calculate personality type based on quiz answers
 * Uses weighted scoring algorithm to determine best match
 */
export const calculatePersonalityType = (
  answers: Record<string, string>,
  startTime: number
): QuizResult => {
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

  const personalityType = PERSONALITY_TYPES.find(p => p.id === topPersonality.id) || PERSONALITY_TYPES[0]
  const confidence = Math.min(95, Math.max(65, (topPersonality.score / Object.keys(answers).length) * 100))
  
  // Generate product recommendations (simplified)
  const recommendations: QuizRecommendation[] = MOCK_PRODUCTS.map((product, index) => ({
    productId: product._id,
    reason: `Perfect match for your ${personalityType.name.toLowerCase()} style`,
    matchScore: Math.max(75, confidence - (index * 10))
  }))

  return {
    personalityType,
    confidence,
    recommendations,
    completionTime: Date.now() - startTime
  }
}

/**
 * Share quiz result using Web Share API or clipboard fallback
 */
export const shareQuizResult = async (personalityName: string, url: string): Promise<void> => {
  const text = `I'm a ${personalityName}! 💎 Find your jewelry personality with GlowGlitch's Style Quiz.`
  
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

/**
 * Quiz progress management utilities
 */
export const QuizStorageService = {
  STORAGE_KEY: 'styleQuizProgress',
  
  save: (progress: any) => {
    try {
      localStorage.setItem(QuizStorageService.STORAGE_KEY, JSON.stringify(progress))
    } catch (error) {
      console.error('Failed to save quiz progress:', error)
    }
  },
  
  load: () => {
    try {
      const saved = localStorage.getItem(QuizStorageService.STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('Failed to load saved quiz progress:', error)
      return null
    }
  },
  
  clear: () => {
    localStorage.removeItem(QuizStorageService.STORAGE_KEY)
  }
}