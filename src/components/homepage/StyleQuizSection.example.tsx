'use client'

import React from 'react'
import { StyleQuizSection } from './StyleQuizSection'
import type { QuizResult } from './StyleQuizSection'

/**
 * StyleQuizSection Component Examples
 * 
 * Demonstrates various configurations of the interactive style quiz
 * for personality-based product recommendations.
 */

// Example 1: Default Configuration
export function StyleQuizExample() {
  const handleQuizComplete = (result: QuizResult) => {

    // In a real app, you might:
    // - Track analytics event
    // - Save to user profile
    // - Navigate to personalized catalog
    // - Show follow-up recommendations
  }

  return (
    <div className="space-y-16">
      {/* Default Quiz Section */}
      <StyleQuizSection 
        onQuizComplete={handleQuizComplete}
        showSocialShare={true}
      />
    </div>
  )
}

// Example 2: Compact Version
export function StyleQuizCompactExample() {
  return (
    <StyleQuizSection 
      variant="compact"
      background="muted"
      showSocialShare={false}
      onQuizComplete={(result) => {
        // Handle result without social sharing

      }}
    />
  )
}

// Example 3: Hero Version
export function StyleQuizHeroExample() {
  return (
    <StyleQuizSection 
      variant="hero"
      background="accent"
      className="min-h-screen flex items-center"
      onQuizComplete={(result) => {
        // Redirect to personalized shopping experience
        window.location.href = `/catalog?personality=${result.personalityType.id}`
      }}
    />
  )
}

// Example 4: Homepage Integration
export function HomepageWithQuiz() {
  return (
    <main className="space-y-0">
      {/* Other homepage sections would go here */}
      
      {/* Style Quiz Section */}
      <StyleQuizSection 
        variant="default"
        background="default"
        onQuizComplete={(result) => {
          // Analytics tracking
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'quiz_completed', {
              personality_type: result.personalityType.id,
              confidence_score: result.confidence,
              completion_time: result.completionTime
            })
          }
          
          // Save to localStorage for personalization
          localStorage.setItem('userPersonality', JSON.stringify(result.personalityType))
          
          // Show success message or redirect

        }}
        showSocialShare={true}
      />
      
      {/* More homepage sections would follow */}
    </main>
  )
}

// Example 5: Custom Styling
export function StyleQuizCustomExample() {
  return (
    <StyleQuizSection 
      className="bg-gradient-to-br from-background to-muted/20"
      variant="default"
      onQuizComplete={(result) => {
        // Custom handling with API call
        fetch('/api/user/personality', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personalityType: result.personalityType.id,
            confidence: result.confidence,
            answers: result // Include full result for analysis
          })
        })
      }}
    />
  )
}

// Usage in different page contexts
export const examples = {
  // Homepage implementation
  homepage: HomepageWithQuiz,
  
  // Standalone quiz page
  standalone: StyleQuizExample,
  
  // Compact version for sidebars or modals
  compact: StyleQuizCompactExample,
  
  // Hero landing page
  hero: StyleQuizHeroExample,
  
  // Custom styled version
  custom: StyleQuizCustomExample
}

export default StyleQuizExample