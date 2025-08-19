'use client'

import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  User, 
  Search,
  LogOut,
  Settings,
  Shield,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BodyText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

export default function AdminHeader() {
  const [sessionInfo, setSessionInfo] = useState<{
    timeRemaining: number
    lastActivity: Date
    securityLevel: 'high' | 'medium' | 'low'
  } | null>(null)

  // Mock user data - will be replaced with actual auth
  const user = {
    name: 'Admin User',
    email: 'admin@glowglitch.com',
    role: 'Super Admin',
    twoFactorEnabled: true,
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  }

  // Mock notification count
  const notificationCount = 3

  // Mock session monitoring
  useEffect(() => {
    const updateSessionInfo = () => {
      setSessionInfo({
        timeRemaining: 6 * 60 * 60 * 1000, // 6 hours remaining
        lastActivity: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        securityLevel: user.twoFactorEnabled ? 'high' : 'medium'
      })
    }

    updateSessionInfo()
    const interval = setInterval(updateSessionInfo, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [user.twoFactorEnabled])

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const getSecurityIcon = (level: string) => {
    switch (level) {
      case 'high': return <Shield className="w-3 h-3 text-green-600" />
      case 'medium': return <Shield className="w-3 h-3 text-yellow-600" />
      case 'low': return <AlertTriangle className="w-3 h-3 text-red-600" />
      default: return <Shield className="w-3 h-3 text-gray-600" />
    }
  }

  return (
    <header className="sticky top-0 z-30 text-foreground bg-white border-b border-border shadow-sm" role="banner">
      <div className="flex items-center justify-between h-16 px-6">
        
        {/* Left Section - Search */}
        <div className="flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-accent" />
            <input
              type="search"
              placeholder="Search admin functions..."
              className={cn(
                "w-full pl-10 pr-4 py-2 text-sm font-body text-foreground bg-muted",
                "border border-border rounded-lg",
                "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:bg-white",
                "placeholder:text-gray-600"
              )}
            />
          </div>
        </div>

        {/* Right Section - Notifications & User */}
        <div className="flex items-center gap-4">
          
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="relative text-foreground hover:bg-muted"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Button>
          </div>

          {/* Session Security Info */}
          {sessionInfo && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
              {getSecurityIcon(sessionInfo.securityLevel)}
              <div className="text-xs">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeRemaining(sessionInfo.timeRemaining)}</span>
                </div>
              </div>
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <BodyText size="sm" className="text-foreground font-medium">
                {user.name}
              </BodyText>
              <div className="flex items-center gap-2">
                <BodyText size="xs" className="text-gray-600 bg-white">
                  {user.role}
                </BodyText>
                {user.twoFactorEnabled && (
                  <Shield className="w-3 h-3 text-green-600" title="2FA Enabled" />
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground hover:bg-muted"
                aria-label="User settings"
              >
                <User className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground hover:bg-muted"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground hover:bg-muted"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}