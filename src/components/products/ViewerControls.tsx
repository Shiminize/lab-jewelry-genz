'use client'

/**
 * Viewer Controls Component
 * Controls for 3D viewer interaction and customization options
 * Includes view mode switching, auto-rotate, and reset functionality
 */

import { useState } from 'react'

interface ViewerControlsProps {
  viewMode: '3d' | 'gallery'
  onViewModeChange: (mode: '3d' | 'gallery') => void
  autoRotate: boolean
  onAutoRotateToggle: (enabled: boolean) => void
  onReset: () => void
  canReset: boolean
}

export default function ViewerControls({
  viewMode,
  onViewModeChange,
  autoRotate,
  onAutoRotateToggle,
  onReset,
  canReset
}: ViewerControlsProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div className="flex items-center justify-between bg-background rounded-lg shadow-sm border border-border p-3">
      {/* View Mode Toggle */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-foreground">View:</span>
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('3d')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              viewMode === '3d'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-aurora-nav-muted hover:text-foreground'
            }`}
          >
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>3D</span>
            </div>
          </button>
          <button
            onClick={() => onViewModeChange('gallery')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              viewMode === 'gallery'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-aurora-nav-muted hover:text-foreground'
            }`}
          >
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Photos</span>
            </div>
          </button>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center space-x-2">
        {/* 3D Controls */}
        {viewMode === '3d' && (
          <>
            {/* Auto Rotate Toggle */}
            <button
              onClick={() => onAutoRotateToggle(!autoRotate)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                autoRotate
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-muted text-aurora-nav-muted hover:bg-muted'
              }`}
              title={autoRotate ? 'Disable auto-rotation' : 'Enable auto-rotation'}
            >
              <svg className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* Camera Controls Info */}
            <div className="hidden md:flex items-center space-x-1 text-xs text-aurora-nav-muted">
              <span>•</span>
              <span>Drag to rotate</span>
              <span>•</span>
              <span>Scroll to zoom</span>
            </div>
          </>
        )}

        {/* Reset Button */}
        <button
          onClick={onReset}
          disabled={!canReset}
          className={`p-2 rounded-lg transition-all duration-200 ${
            canReset
              ? 'bg-muted text-aurora-nav-muted hover:bg-muted'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
          title="Reset customization"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={handleFullscreen}
          className="p-2 rounded-lg bg-muted text-aurora-nav-muted hover:bg-muted transition-all duration-200"
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
        </button>

        {/* Help/Info */}
        <div className="relative group">
          <button className="p-2 rounded-lg bg-muted text-aurora-nav-muted hover:bg-muted transition-all duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-foreground text-background text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            <div className="space-y-2">
              <div className="font-semibold">3D Viewer Controls:</div>
              <div>• <strong>Drag:</strong> Rotate the model</div>
              <div>• <strong>Scroll:</strong> Zoom in/out</div>
              <div>• <strong>Double-click:</strong> Reset view</div>
              <div>• <strong>R key:</strong> Reset customization</div>
              <div>• <strong>Arrow keys:</strong> Navigate gallery</div>
            </div>
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground"></div>
          </div>
        </div>
      </div>
    </div>
  )
}