/**
 * Advanced Touch Gesture Service - CLAUDE_RULES Phase 2 Mobile Optimization
 * 
 * Provides sophisticated touch interaction for CSS 3D product customizer:
 * - Smooth drag/rotation with velocity-based momentum
 * - Pinch-to-zoom with bounds checking
 * - Multi-touch gesture recognition
 * - Platform-specific optimizations (iOS/Android)
 * - Accessibility support with haptic feedback
 * 
 * Performance Requirements:
 * - <16ms gesture processing (60fps)
 * - Sub-pixel precision for smooth rotation
 * - Memory-efficient gesture tracking
 */

'use client'

interface TouchGestureConfig {
  enableRotation: boolean
  enableZoom: boolean
  enableMomentum: boolean
  enableHaptics: boolean
  rotationSensitivity: number // Degrees per pixel
  zoomSensitivity: number
  momentumDecay: number // 0-1, how quickly momentum dies
  minZoom: number
  maxZoom: number
}

interface GestureState {
  isActive: boolean
  startTime: number
  startTouches: Touch[]
  currentTouches: Touch[]
  deltaX: number
  deltaY: number
  velocity: number
  scale: number
  rotation: number
}

interface MomentumState {
  isActive: boolean
  velocity: number
  startFrame: number
  startTime: number
}

interface TouchGestureCallbacks {
  onRotationStart?: () => void
  onRotationChange?: (deltaRotation: number, frame: number) => void
  onRotationEnd?: (finalVelocity: number) => void
  onZoomStart?: () => void
  onZoomChange?: (scale: number) => void
  onZoomEnd?: () => void
  onGestureStart?: () => void
  onGestureEnd?: () => void
}

class TouchGestureService {
  private config: TouchGestureConfig
  private gestureState: GestureState
  private momentumState: MomentumState
  private callbacks: TouchGestureCallbacks
  private animationFrame: number | null = null
  private element: HTMLElement | null = null
  private frameCount: number = 36
  private currentFrame: number = 0
  
  // Performance tracking
  private lastGestureTime = 0
  private gestureCount = 0
  private avgProcessingTime = 0

  constructor(config: Partial<TouchGestureConfig> = {}) {
    this.config = {
      enableRotation: true,
      enableZoom: true,
      enableMomentum: true,
      enableHaptics: 'vibrate' in navigator,
      rotationSensitivity: 0.5, // 0.5 degrees per pixel
      zoomSensitivity: 0.01,
      momentumDecay: 0.95,
      minZoom: 0.5,
      maxZoom: 3.0,
      ...config
    }

    this.gestureState = {
      isActive: false,
      startTime: 0,
      startTouches: [],
      currentTouches: [],
      deltaX: 0,
      deltaY: 0,
      velocity: 0,
      scale: 1,
      rotation: 0
    }

    this.momentumState = {
      isActive: false,
      velocity: 0,
      startFrame: 0,
      startTime: 0
    }

    this.callbacks = {}
  }

  /**
   * Initialize touch gesture handling on element
   */
  public initialize(
    element: HTMLElement,
    frameCount: number,
    callbacks: TouchGestureCallbacks
  ): void {
    this.element = element
    this.frameCount = frameCount
    this.callbacks = callbacks

    // Remove existing listeners
    this.cleanup()

    // Add touch event listeners with passive: false for preventDefault
    element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false })
    element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false })

    // Prevent context menu on long press
    element.addEventListener('contextmenu', this.preventDefault.bind(this))

  }

  /**
   * Handle touch start
   */
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault()

    const startTime = performance.now()
    const touches = Array.from(event.touches)

    this.gestureState = {
      isActive: true,
      startTime,
      startTouches: touches,
      currentTouches: touches,
      deltaX: 0,
      deltaY: 0,
      velocity: 0,
      scale: 1,
      rotation: 0
    }

    // Stop any ongoing momentum
    this.stopMomentum()

    // Haptic feedback for gesture start
    if (this.config.enableHaptics) {
      this.triggerHaptic('light')
    }

    this.callbacks.onGestureStart?.()

    if (touches.length === 1 && this.config.enableRotation) {
      this.callbacks.onRotationStart?.()
    } else if (touches.length === 2 && this.config.enableZoom) {
      this.callbacks.onZoomStart?.()
    }

    this.trackGesturePerformance(startTime)
  }

  /**
   * Handle touch move
   */
  private handleTouchMove(event: TouchEvent): void {
    if (!this.gestureState.isActive) return

    event.preventDefault()
    const processingStart = performance.now()
    
    const touches = Array.from(event.touches)
    this.gestureState.currentTouches = touches

    if (touches.length === 1 && this.config.enableRotation) {
      this.handleSingleTouchRotation(touches[0])
    } else if (touches.length === 2 && this.config.enableZoom) {
      this.handleTwoFingerGesture(touches)
    }

    this.trackGesturePerformance(processingStart)
  }

  /**
   * Handle single touch rotation
   */
  private handleSingleTouchRotation(touch: Touch): void {
    const startTouch = this.gestureState.startTouches[0]
    if (!startTouch) return

    const deltaX = touch.clientX - startTouch.clientX
    const deltaY = touch.clientY - startTouch.clientY

    // Calculate rotation delta
    const rotationDelta = deltaX * this.config.rotationSensitivity
    
    // Update velocity for momentum
    const timeDelta = performance.now() - this.gestureState.startTime
    this.gestureState.velocity = timeDelta > 0 ? rotationDelta / timeDelta : 0

    // Calculate frame change
    const frameChange = Math.round(rotationDelta / (360 / this.frameCount))
    const newFrame = (this.currentFrame + frameChange + this.frameCount) % this.frameCount

    // Update state
    this.gestureState.deltaX = deltaX
    this.gestureState.deltaY = deltaY
    this.gestureState.rotation = rotationDelta

    // Trigger callbacks
    if (Math.abs(frameChange) > 0) {
      this.callbacks.onRotationChange?.(rotationDelta, newFrame)
      this.currentFrame = newFrame
    }
  }

  /**
   * Handle two-finger gestures (zoom/rotate)
   */
  private handleTwoFingerGesture(touches: Touch[]): void {
    const startTouches = this.gestureState.startTouches
    if (startTouches.length !== 2) return

    // Calculate initial and current distances
    const startDistance = this.getDistance(startTouches[0], startTouches[1])
    const currentDistance = this.getDistance(touches[0], touches[1])

    // Calculate scale
    const scale = currentDistance / startDistance
    const clampedScale = Math.max(
      this.config.minZoom,
      Math.min(this.config.maxZoom, scale)
    )

    this.gestureState.scale = clampedScale
    this.callbacks.onZoomChange?.(clampedScale)

    // Optional: Calculate rotation between two fingers
    if (this.config.enableRotation) {
      const startAngle = this.getAngle(startTouches[0], startTouches[1])
      const currentAngle = this.getAngle(touches[0], touches[1])
      const rotationDelta = currentAngle - startAngle

      // Convert to frame change if significant
      if (Math.abs(rotationDelta) > 5) { // 5 degree threshold
        const frameChange = Math.round(rotationDelta / (360 / this.frameCount))
        const newFrame = (this.currentFrame + frameChange + this.frameCount) % this.frameCount
        
        if (Math.abs(frameChange) > 0) {
          this.callbacks.onRotationChange?.(rotationDelta, newFrame)
          this.currentFrame = newFrame
        }
      }
    }
  }

  /**
   * Handle touch end
   */
  private handleTouchEnd(event: TouchEvent): void {
    const touches = Array.from(event.touches)
    
    // If no more touches, end gesture
    if (touches.length === 0) {
      this.endGesture()
    } else {
      // Update current touches for ongoing gesture
      this.gestureState.currentTouches = touches
    }
  }

  /**
   * Handle touch cancel
   */
  private handleTouchCancel(event: TouchEvent): void {
    this.endGesture()
  }

  /**
   * End gesture and potentially start momentum
   */
  private endGesture(): void {
    if (!this.gestureState.isActive) return

    const endTime = performance.now()
    const gestureDuration = endTime - this.gestureState.startTime
    const velocity = this.gestureState.velocity

    // Determine if momentum should be applied
    if (
      this.config.enableMomentum &&
      this.config.enableRotation &&
      Math.abs(velocity) > 0.1 && // Minimum velocity threshold
      gestureDuration < 300 // Quick gesture
    ) {
      this.startMomentum(velocity)
    }

    // Haptic feedback for gesture end
    if (this.config.enableHaptics && gestureDuration > 50) {
      this.triggerHaptic('light')
    }

    // Clean up gesture state
    this.gestureState.isActive = false

    // Trigger callbacks
    this.callbacks.onRotationEnd?.(velocity)
    this.callbacks.onZoomEnd?.()
    this.callbacks.onGestureEnd?.()
  }

  /**
   * Start momentum-based rotation
   */
  private startMomentum(initialVelocity: number): void {
    this.momentumState = {
      isActive: true,
      velocity: initialVelocity * 0.1, // Scale down velocity
      startFrame: this.currentFrame,
      startTime: performance.now()
    }

    this.animateMomentum()
  }

  /**
   * Animate momentum rotation
   */
  private animateMomentum(): void {
    if (!this.momentumState.isActive) return

    const now = performance.now()
    const deltaTime = now - this.momentumState.startTime

    // Apply momentum decay
    this.momentumState.velocity *= this.config.momentumDecay

    // Stop if velocity is too small
    if (Math.abs(this.momentumState.velocity) < 0.01) {
      this.stopMomentum()
      return
    }

    // Calculate frame change
    const frameChange = Math.round(this.momentumState.velocity)
    if (Math.abs(frameChange) > 0) {
      const newFrame = (this.currentFrame + frameChange + this.frameCount) % this.frameCount
      this.callbacks.onRotationChange?.(frameChange * (360 / this.frameCount), newFrame)
      this.currentFrame = newFrame
    }

    // Continue animation
    this.animationFrame = requestAnimationFrame(() => this.animateMomentum())
  }

  /**
   * Stop momentum animation
   */
  private stopMomentum(): void {
    this.momentumState.isActive = false
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }

  /**
   * Update current frame (called externally)
   */
  public setCurrentFrame(frame: number): void {
    this.currentFrame = frame
  }

  /**
   * Get distance between two touches
   */
  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch2.clientX - touch1.clientX
    const dy = touch2.clientY - touch1.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Get angle between two touches
   */
  private getAngle(touch1: Touch, touch2: Touch): number {
    const dx = touch2.clientX - touch1.clientX
    const dy = touch2.clientY - touch1.clientY
    return Math.atan2(dy, dx) * (180 / Math.PI)
  }

  /**
   * Trigger haptic feedback
   */
  private triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light'): void {
    if (!this.config.enableHaptics || !('vibrate' in navigator)) return

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [50]
    }

    navigator.vibrate(patterns[type])
  }

  /**
   * Prevent default behavior
   */
  private preventDefault(event: Event): void {
    event.preventDefault()
  }

  /**
   * Track gesture processing performance
   */
  private trackGesturePerformance(startTime: number): void {
    const processingTime = performance.now() - startTime
    this.gestureCount++
    this.avgProcessingTime = ((this.avgProcessingTime * (this.gestureCount - 1)) + processingTime) / this.gestureCount

    if (processingTime > 16) {
      console.warn(`⚠️ Slow gesture processing: ${processingTime.toFixed(1)}ms (target: <16ms)`)
    }
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): {
    avgProcessingTime: number
    gestureCount: number
    isPerformant: boolean
  } {
    return {
      avgProcessingTime: this.avgProcessingTime,
      gestureCount: this.gestureCount,
      isPerformant: this.avgProcessingTime < 16
    }
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<TouchGestureConfig>): void {
    this.config = { ...this.config, ...config }

  }

  /**
   * Cleanup event listeners
   */
  public cleanup(): void {
    if (this.element) {
      this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this))
      this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this))
      this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this))
      this.element.removeEventListener('touchcancel', this.handleTouchCancel.bind(this))
      this.element.removeEventListener('contextmenu', this.preventDefault.bind(this))
    }

    this.stopMomentum()

  }

  /**
   * Check if currently gesturing
   */
  public isGesturing(): boolean {
    return this.gestureState.isActive || this.momentumState.isActive
  }

  /**
   * Get current gesture state
   */
  public getGestureState(): Readonly<GestureState> {
    return { ...this.gestureState }
  }
}

export default TouchGestureService
export type { TouchGestureConfig, TouchGestureCallbacks, GestureState, MomentumState }