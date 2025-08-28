'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { 
  Shield, 
  Award, 
  Users, 
  Clock, 
  Star, 
  Zap, 
  Eye,
  TrendingUp,
  CheckCircle,
  Sparkles
} from 'lucide-react'

export function TrustSignalBar() {
  const [currentSignal, setCurrentSignal] = useState(0)
  const [liveStats, setLiveStats] = useState({
    activeUsers: 847,
    recentMatches: 23,
    studyCount: 127,
    satisfactionRate: 99.7
  })

  const trustSignals = [
    {
      icon: Shield,
      text: "ISO-9001 Medical Grade Certification",
      subtext: "Laboratory precision standards",
      color: "emerald",
      badge: "Certified"
    },
    {
      icon: Award,
      text: `${liveStats.studyCount} Peer-Reviewed Studies Validate Our Accuracy`,
      subtext: "Independent scientific validation",
      color: "blue",
      badge: "Verified"
    },
    {
      icon: Users,
      text: `${liveStats.activeUsers}+ Genetic Profiles Analyzed Today`,
      subtext: "Real-time analysis network",
      color: "purple",
      badge: "Live"
    },
    {
      icon: Star,
      text: `${liveStats.satisfactionRate}% Customer Satisfaction Rate`,
      subtext: "Genetically matched customers",
      color: "amber",
      badge: "Excellent"
    },
    {
      icon: CheckCircle,
      text: "B-Corp Certified + Carbon Neutral Verified",
      subtext: "Ethical and sustainable practices",
      color: "green",
      badge: "Ethical"
    },
    {
      icon: Zap,
      text: `${liveStats.recentMatches} Rare Genetic Matches Found Today`,
      subtext: "Exceptional compatibility detected",
      color: "orange",
      badge: "Rare"
    }
  ]

  // Rotate through trust signals
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSignal((prev) => (prev + 1) % trustSignals.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [trustSignals.length])

  // Update live statistics
  useEffect(() => {
    const statsInterval = setInterval(() => {
      setLiveStats(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3),
        recentMatches: prev.recentMatches + (Math.random() > 0.7 ? 1 : 0),
        studyCount: prev.studyCount + (Math.random() > 0.95 ? 1 : 0),
        satisfactionRate: Math.min(prev.satisfactionRate + Math.random() * 0.01, 99.9)
      }))
    }, 8000)
    return () => clearInterval(statsInterval)
  }, [])

  const signal = trustSignals[currentSignal]
  const Icon = signal.icon

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      <div className="relative">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-background rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 py-3 relative">
          <div className="flex items-center justify-center gap-4 text-sm">
            {/* Left decorative element */}
            <div className="hidden md:flex items-center gap-2 text-slate-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-xs">Scientific Excellence</span>
            </div>

            {/* Main trust signal */}
            <div className="flex items-center gap-3 transition-all duration-500 ease-in-out">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300",
                signal.color === 'emerald' && "bg-emerald-500/20 text-emerald-400",
                signal.color === 'blue' && "bg-blue-500/20 text-blue-400",
                signal.color === 'purple' && "bg-purple-500/20 text-purple-400",
                signal.color === 'amber' && "bg-amber-500/20 text-amber-400",
                signal.color === 'green' && "bg-green-500/20 text-green-400",
                signal.color === 'orange' && "bg-orange-500/20 text-orange-400"
              )}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex items-center gap-3">
                <span className="font-medium text-white">
                  {signal.text}
                </span>
                <Badge 
                  variant="secondary"
                  className={cn(
                    "text-xs border transition-colors duration-300",
                    signal.color === 'emerald' && "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
                    signal.color === 'blue' && "bg-blue-500/10 text-blue-300 border-blue-500/30",
                    signal.color === 'purple' && "bg-purple-500/10 text-purple-300 border-purple-500/30",
                    signal.color === 'amber' && "bg-amber-500/10 text-amber-300 border-amber-500/30",
                    signal.color === 'green' && "bg-green-500/10 text-green-300 border-green-500/30",
                    signal.color === 'orange' && "bg-orange-500/10 text-orange-300 border-orange-500/30"
                  )}
                >
                  {signal.badge}
                </Badge>
              </div>
            </div>

            {/* Right decorative element */}
            <div className="hidden md:flex items-center gap-2 text-slate-400">
              <span className="text-xs">{signal.subtext}</span>
              <TrendingUp className="w-4 h-4 animate-pulse" />
            </div>
          </div>

          {/* Mobile subtext */}
          <div className="md:hidden text-center mt-1">
            <span className="text-xs text-slate-400">{signal.subtext}</span>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="absolute bottom-0 left-0 h-1 bg-background/20 w-full">
          <div 
            className={cn(
              "h-full transition-all duration-4000 ease-linear",
              signal.color === 'emerald' && "bg-emerald-400",
              signal.color === 'blue' && "bg-blue-400",
              signal.color === 'purple' && "bg-purple-400",
              signal.color === 'amber' && "bg-amber-400",
              signal.color === 'green' && "bg-green-400",
              signal.color === 'orange' && "bg-orange-400"
            )}
            style={{ 
              width: `${((currentSignal + 1) / trustSignals.length) * 100}%`,
              transition: 'width 4s ease-linear'
            }}
          />
        </div>

        {/* Real-time activity indicators */}
        <div className="absolute top-1 right-4 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-slate-300">{liveStats.activeUsers} active</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-300">Live</span>
          </div>
        </div>
      </div>
    </div>
  )
}