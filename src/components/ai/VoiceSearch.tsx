'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, Search, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

// Aurora Voice Search - AI Emotional Intelligence
interface VoiceSearchProps {
  onSearch?: (query: string, emotions: string[], intent: string) => void
  onClose?: () => void
  isOpen?: boolean
  className?: string
}

interface VoiceState {
  isListening: boolean
  isProcessing: boolean
  transcript: string
  confidence: number
  emotions: string[]
  intent: 'search' | 'discovery' | 'surprise' | 'browse'
  suggestions: string[]
}

// Aurora AI: Emotional Intelligence Keywords
const EMOTIONAL_KEYWORDS = {
  romantic: ['romantic', 'love', 'heart', 'valentine', 'anniversary', 'proposal', 'engagement'],
  bold: ['bold', 'statement', 'dramatic', 'striking', 'powerful', 'strong'],
  minimalist: ['simple', 'clean', 'minimal', 'subtle', 'delicate', 'understated'],
  vintage: ['vintage', 'antique', 'classic', 'art deco', 'retro', 'heritage'],
  elegant: ['elegant', 'sophisticated', 'graceful', 'refined', 'luxurious'],
  playful: ['fun', 'colorful', 'unique', 'creative', 'artistic', 'whimsical']
}

const INTENT_KEYWORDS = {
  search: ['find', 'show', 'looking for', 'want', 'need'],
  discovery: ['explore', 'browse', 'what do you have', 'options', 'varieties'],
  surprise: ['surprise', 'recommend', 'suggest', 'perfect for', 'best'],
  browse: ['see', 'look at', 'check out', 'view']
}

// Aurora AI: Voice Processing Simulation
const processVoiceInput = (transcript: string): { emotions: string[], intent: string, confidence: number } => {
  const lowerTranscript = transcript.toLowerCase()
  const detectedEmotions: string[] = []
  let intent = 'browse'
  let maxMatches = 0
  
  // Emotion detection
  Object.entries(EMOTIONAL_KEYWORDS).forEach(([emotion, keywords]) => {
    const matches = keywords.filter(keyword => lowerTranscript.includes(keyword)).length
    if (matches > 0) {
      detectedEmotions.push(emotion)
    }
  })
  
  // Intent detection
  Object.entries(INTENT_KEYWORDS).forEach(([intentType, keywords]) => {
    const matches = keywords.filter(keyword => lowerTranscript.includes(keyword)).length
    if (matches > maxMatches) {
      maxMatches = matches
      intent = intentType
    }
  })
  
  const confidence = Math.min(0.95, 0.6 + (detectedEmotions.length * 0.1) + (maxMatches * 0.05))
  
  return { emotions: detectedEmotions, intent, confidence }
}

export function VoiceSearch({ onSearch, onClose, isOpen = false, className }: VoiceSearchProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    transcript: '',
    confidence: 0,
    emotions: [],
    intent: 'browse',
    suggestions: []
  })
  
  const recognitionRef = useRef<any>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()
  
  // Aurora AI: Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      recognition.onstart = () => {
        setVoiceState(prev => ({ ...prev, isListening: true, transcript: '' }))
      }
      
      recognition.onresult = (event: any) => {
        const current = event.resultIndex
        const transcript = event.results[current][0].transcript
        const isFinal = event.results[current].isFinal
        
        setVoiceState(prev => ({ 
          ...prev, 
          transcript,
          confidence: event.results[current][0].confidence || 0.8
        }))
        
        if (isFinal) {
          // Process with Aurora AI
          setVoiceState(prev => ({ ...prev, isProcessing: true }))
          
          setTimeout(() => {
            const processed = processVoiceInput(transcript)
            setVoiceState(prev => ({
              ...prev,
              ...processed,
              isProcessing: false,
              isListening: false
            }))
            
            // Auto-execute search after processing
            setTimeout(() => {
              onSearch?.(transcript, processed.emotions, processed.intent)
            }, 1000)
          }, 800)
        }
      }
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setVoiceState(prev => ({ 
          ...prev, 
          isListening: false, 
          isProcessing: false 
        }))
      }
      
      recognition.onend = () => {
        setVoiceState(prev => ({ ...prev, isListening: false }))
      }
      
      recognitionRef.current = recognition
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [onSearch])
  
  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start()
    }
  }
  
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }
  
  const handleManualSearch = () => {
    if (voiceState.transcript) {
      const processed = processVoiceInput(voiceState.transcript)
      onSearch?.(voiceState.transcript, processed.emotions, processed.intent)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 backdrop-blur-xl',
          className
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative max-w-md w-full mx-4 bg-gradient-to-br from-white via-background to-white rounded-[34px] p-8 aurora-shimmer-overlay"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Aurora AI Header */}
          <div className="text-center mb-6">
            <motion.div
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-foreground to-accent rounded-full flex items-center justify-center"
              animate={{ 
                scale: voiceState.isListening ? [1, 1.1, 1] : 1,
                rotate: voiceState.isProcessing ? 360 : 0
              }}
              transition={{ 
                scale: { duration: 1.5, repeat: voiceState.isListening ? Infinity : 0 },
                rotate: { duration: 2, repeat: voiceState.isProcessing ? Infinity : 0 }
              }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            
            <h2 className="text-xl font-headline font-bold mb-2">
              Aurora Voice Search
            </h2>
            <p className="text-sm text-aurora-nav-muted/80">
              Tell me what you're looking for...
            </p>
          </div>
          
          {/* Voice Status */}
          <div className="mb-6">
            <AnimatePresence mode="wait">
              {voiceState.isListening && (
                <motion.div
                  key="listening"
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-3 h-3 bg-accent rounded-full mr-2" />
                    <span className="text-sm font-medium text-foreground">
                      Listening...
                    </span>
                  </div>
                  <div className="flex justify-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 h-4 bg-accent rounded-full aurora-pulse"
                        animate={{ 
                          scaleY: [1, 2, 1],
                          opacity: [0.6, 1, 0.6]
                        }}
                        transition={{ 
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.1
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              
              {voiceState.isProcessing && (
                <motion.div
                  key="processing"
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="h-2 bg-gradient-to-r from-foreground to-accent rounded-full mb-2 aurora-pulse" />
                  <span className="text-sm font-medium text-foreground">
                    Processing with Aurora AI...
                  </span>
                </motion.div>
              )}
              
              {!voiceState.isListening && !voiceState.isProcessing && (
                <motion.div
                  key="ready"
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <span className="text-sm text-aurora-nav-muted/80">
                    Tap the microphone to start
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Transcript Display */}
          {voiceState.transcript && (
            <motion.div
              className="mb-6 p-4 bg-background/50 rounded-lg border border-foreground/20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-sm text-foreground mb-2">"{voiceState.transcript}"</p>
              
              {/* Emotional Analysis */}
              {voiceState.emotions.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="text-xs text-aurora-nav-muted/70">Emotions detected:</span>
                  {voiceState.emotions.map((emotion) => (
                    <span
                      key={emotion}
                      className="px-2 py-1 text-xs bg-accent/10 text-aurora-nav-muted rounded-full border border-accent/20"
                    >
                      {emotion}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Intent & Confidence */}
              <div className="flex justify-between text-xs text-aurora-nav-muted/70">
                <span>Intent: {voiceState.intent}</span>
                <span>Confidence: {Math.round(voiceState.confidence * 100)}%</span>
              </div>
            </motion.div>
          )}
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              size="lg"
              onClick={onClose}
              className="flex-1 border border-border/20 hover:bg-muted/10"
            >
              Cancel
            </Button>
            
            <Button
              variant="primary"
              size="lg"
              onClick={voiceState.isListening ? stopListening : startListening}
              disabled={voiceState.isProcessing}
              className="flex-1 bg-cta text-background"
            >
              {voiceState.isListening ? (
                <>
                  <MicOff size={16} className="mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Mic size={16} className="mr-2" />
                  Listen
                </>
              )}
            </Button>
            
            {voiceState.transcript && !voiceState.isListening && (
              <Button
                variant="accent"
                size="lg"
                onClick={handleManualSearch}
                className="flex-1"
              >
                <Search size={16} className="mr-2" />
                Search
              </Button>
            )}
          </div>
          
          {/* Browser Support Warning */}
          {typeof window !== 'undefined' && !('webkitSpeechRecognition' in window) && (
            <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
              <p className="text-xs text-accent text-center">
                Voice search requires Chrome or Safari
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}