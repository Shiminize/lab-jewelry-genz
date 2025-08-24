/**
 * TouchGestureService - Touch Gesture Recognition for 3D Viewer
 * Handles pan, pinch, tap gestures with momentum physics integration
 * CLAUDE_RULES.md compliant with performance targets and RAF integration
 */

'use client'

export interface GestureState {
  // Pan gesture state
  isPanning: boolean
  panStart: { x: number; y: number }
  panCurrent: { x: number; y: number }
  panVelocity: { x: number; y: number }
  
  // Pinch gesture state
  isPinching: boolean
  pinchStart: number
  pinchCurrent: number
  pinchCenter: { x: number; y: number }
  
  // Tap gesture state
  isTapping: boolean
  tapStart: { x: number; y: number; time: number }
  
  // Gesture timing
  gestureStartTime: number
  lastUpdateTime: number
}

export interface GestureCallbacks {
  onPanStart: (position: { x: number; y: number }) => void
  onPanMove: (delta: { x: number; y: number }, velocity: { x: number; y: number }) => void
  onPanEnd: (velocity: { x: number; y: number }) => void
  onPinchStart: (scale: number, center: { x: number; y: number }) => void
  onPinchMove: (scale: number, center: { x: number; y: number }) => void
  onPinchEnd: (finalScale: number) => void
  onTap: (position: { x: number; y: number }) => void
  onDoubleTap: (position: { x: number; y: number }) => void
}

export class TouchGestureService {
  private gestureState: GestureState
  private callbacks: Partial<GestureCallbacks>
  private element: HTMLElement | null = null
  private lastTapTime = 0
  private doubleTapDelay = 300 // ms
  private panThreshold = 10 // pixels
  private velocityHistory: Array<{ x: number; y: number; time: number }> = []
  private maxVelocityHistory = 5

  constructor(callbacks: Partial<GestureCallbacks> = {}) {
    this.callbacks = callbacks
    this.gestureState = this.createInitialState()
  }

  private createInitialState(): GestureState {
    return {
      isPanning: false,
      panStart: { x: 0, y: 0 },
      panCurrent: { x: 0, y: 0 },
      panVelocity: { x: 0, y: 0 },
      isPinching: false,
      pinchStart: 1,
      pinchCurrent: 1,
      pinchCenter: { x: 0, y: 0 },
      isTapping: false,
      tapStart: { x: 0, y: 0, time: 0 },
      gestureStartTime: 0,
      lastUpdateTime: 0
    }
  }

  public attachToElement(element: HTMLElement): void {
    this.detachFromElement()
    this.element = element

    // Add touch event listeners with passive: false for preventDefault capability
    element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false })
    element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false })

    // Prevent context menu on long press
    element.addEventListener('contextmenu', (e) => e.preventDefault())
  }

  public detachFromElement(): void {
    if (!this.element) return

    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this))
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this))
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this))
    this.element.removeEventListener('touchcancel', this.handleTouchCancel.bind(this))
    this.element.removeEventListener('contextmenu', (e) => e.preventDefault())
    
    this.element = null
  }

  private handleTouchStart(event: TouchEvent): void {
    const currentTime = performance.now()
    this.gestureState.gestureStartTime = currentTime
    this.gestureState.lastUpdateTime = currentTime

    if (event.touches.length === 1) {
      // Single touch - potential pan or tap
      const touch = event.touches[0]
      const position = { x: touch.clientX, y: touch.clientY }

      this.gestureState.tapStart = { ...position, time: currentTime }
      this.gestureState.panStart = position
      this.gestureState.panCurrent = position
      this.gestureState.isTapping = true

      // Initialize velocity history
      this.velocityHistory = [{ ...position, time: currentTime }]

    } else if (event.touches.length === 2) {
      // Dual touch - pinch gesture
      event.preventDefault() // Prevent zoom
      
      const touch1 = event.touches[0]
      const touch2 = event.touches[1]
      
      const distance = this.calculateDistance(touch1, touch2)
      const center = this.calculateCenter(touch1, touch2)

      this.gestureState.isPinching = true
      this.gestureState.pinchStart = distance
      this.gestureState.pinchCurrent = distance
      this.gestureState.pinchCenter = center
      this.gestureState.isTapping = false // Cancel tap on multi-touch

      this.callbacks.onPinchStart?.(1, center)
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault() // Prevent scrolling
    
    const currentTime = performance.now()
    this.gestureState.lastUpdateTime = currentTime

    if (event.touches.length === 1 && this.gestureState.isTapping) {
      // Single touch movement
      const touch = event.touches[0]
      const position = { x: touch.clientX, y: touch.clientY }

      // Update velocity history
      this.updateVelocityHistory(position, currentTime)

      // Check if movement exceeds tap threshold
      const deltaX = position.x - this.gestureState.panStart.x
      const deltaY = position.y - this.gestureState.panStart.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      if (distance > this.panThreshold) {
        // Convert to pan gesture
        this.gestureState.isTapping = false
        this.gestureState.isPanning = true
        
        // Calculate velocity for momentum
        const velocity = this.calculateVelocity()
        this.gestureState.panVelocity = velocity

        this.callbacks.onPanStart?.(this.gestureState.panStart)
      }

      // Update current position
      this.gestureState.panCurrent = position

      // Emit pan events if panning
      if (this.gestureState.isPanning) {
        const delta = {
          x: position.x - this.gestureState.panStart.x,
          y: position.y - this.gestureState.panStart.y
        }
        
        this.callbacks.onPanMove?.(delta, this.gestureState.panVelocity)
      }

    } else if (event.touches.length === 2 && this.gestureState.isPinching) {
      // Dual touch movement - pinch gesture
      const touch1 = event.touches[0]
      const touch2 = event.touches[1]
      
      const distance = this.calculateDistance(touch1, touch2)
      const center = this.calculateCenter(touch1, touch2)
      const scale = distance / this.gestureState.pinchStart

      this.gestureState.pinchCurrent = distance
      this.gestureState.pinchCenter = center

      this.callbacks.onPinchMove?.(scale, center)
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    const currentTime = performance.now()

    if (this.gestureState.isTapping && event.touches.length === 0) {
      // Handle tap gesture
      const tapDuration = currentTime - this.gestureState.tapStart.time
      const tapPosition = { 
        x: this.gestureState.tapStart.x, 
        y: this.gestureState.tapStart.y 
      }

      if (tapDuration < 200) { // Quick tap
        // Check for double tap
        if (currentTime - this.lastTapTime < this.doubleTapDelay) {
          this.callbacks.onDoubleTap?.(tapPosition)
        } else {
          this.callbacks.onTap?.(tapPosition)
        }
        this.lastTapTime = currentTime
      }

    } else if (this.gestureState.isPanning && event.touches.length === 0) {
      // Handle pan end with momentum
      const velocity = this.calculateVelocity()
      this.callbacks.onPanEnd?.(velocity)

    } else if (this.gestureState.isPinching && event.touches.length < 2) {
      // Handle pinch end
      const finalScale = this.gestureState.pinchCurrent / this.gestureState.pinchStart
      this.callbacks.onPinchEnd?.(finalScale)
    }

    // Reset gesture state if no touches remain
    if (event.touches.length === 0) {
      this.gestureState = this.createInitialState()
    }
  }

  private handleTouchCancel(event: TouchEvent): void {
    // Reset all gesture states on cancel
    this.gestureState = this.createInitialState()
  }

  private calculateDistance(touch1: Touch, touch2: Touch): number {
    const deltaX = touch2.clientX - touch1.clientX
    const deltaY = touch2.clientY - touch1.clientY
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  }

  private calculateCenter(touch1: Touch, touch2: Touch): { x: number; y: number } {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    }
  }

  private updateVelocityHistory(position: { x: number; y: number }, time: number): void {
    this.velocityHistory.push({ ...position, time })
    
    // Keep only recent history for accurate velocity calculation
    if (this.velocityHistory.length > this.maxVelocityHistory) {
      this.velocityHistory.shift()
    }
  }

  private calculateVelocity(): { x: number; y: number } {
    if (this.velocityHistory.length < 2) {
      return { x: 0, y: 0 }
    }

    const recent = this.velocityHistory[this.velocityHistory.length - 1]
    const previous = this.velocityHistory[this.velocityHistory.length - 2]

    const deltaTime = recent.time - previous.time
    if (deltaTime === 0) return { x: 0, y: 0 }

    return {
      x: (recent.x - previous.x) / deltaTime * 1000, // pixels per second
      y: (recent.y - previous.y) / deltaTime * 1000
    }
  }

  // Utility methods for integration
  public getCurrentGestureState(): GestureState {
    return { ...this.gestureState }
  }

  public isGestureActive(): boolean {
    return this.gestureState.isPanning || this.gestureState.isPinching || this.gestureState.isTapping
  }

  public updateCallbacks(callbacks: Partial<GestureCallbacks>): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  public destroy(): void {
    this.detachFromElement()
    this.velocityHistory = []
    this.gestureState = this.createInitialState()
  }
}

// Factory function for easier instantiation
export function createTouchGestureService(callbacks: Partial<GestureCallbacks> = {}): TouchGestureService {
  return new TouchGestureService(callbacks)
}

export default TouchGestureService