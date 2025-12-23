import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import {
  type WidgetAction,
  type WidgetMessage,
  type WidgetState,
} from '@/lib/concierge/types'
import { getInitialMessages } from '@/lib/concierge/scripts'

const SESSION_STORAGE_KEY = 'aurora-concierge-session-v1'
const INTRO_LOCAL_KEY = 'aurora-concierge-intro-dismissed'

function createSessionId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `session-${Math.random().toString(36).slice(2)}`
}

function buildBaseState(): WidgetState {
  return {
    isOpen: false,
    messages: getInitialMessages(),
    session: {
      id: createSessionId(),
      shortlist: [],
      lastFilters: null,
      hasShownCsat: false,
      lastActive: Date.now(),
      lastOrder: null,
      introDismissedAt: null,
    },
    isProcessing: false,
  }
}

function getInitialState(): WidgetState {
  return buildBaseState()
}

function restoreStateFromStorage(stored: string): WidgetState | null {
  try {
    const parsed = JSON.parse(stored) as Partial<WidgetState>
    if (parsed.messages && parsed.session) {
      const base = buildBaseState()
      return {
        ...base,
        messages: parsed.messages as WidgetMessage[],
        session: {
          ...base.session,
          ...(parsed.session as WidgetState['session']),
          lastActive: Date.now(),
          lastOrder:
            (parsed.session as WidgetState['session']).lastOrder !== undefined
              ? (parsed.session as WidgetState['session']).lastOrder
              : null,
          lastFilters:
            (parsed.session as WidgetState['session']).lastFilters !== undefined
              ? (parsed.session as WidgetState['session']).lastFilters
              : null,
          introDismissedAt:
            (parsed.session as WidgetState['session']).introDismissedAt !== undefined
              ? (parsed.session as WidgetState['session']).introDismissedAt
              : null,
        },
      }
    }
  } catch (error) {
    console.warn('Failed to hydrate concierge session', error)
  }
  return null
}

function reducer(state: WidgetState, action: WidgetAction): WidgetState {
  switch (action.type) {
    case 'OPEN':
      return { ...state, isOpen: true }
    case 'CLOSE':
      return { ...state, isOpen: false }
    case 'APPEND_MESSAGES':
      return {
        ...state,
        messages: [...state.messages, ...action.messages],
        session: { ...state.session, lastActive: Date.now() },
      }
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: [...action.messages],
        session: { ...state.session, lastActive: Date.now() },
      }
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.value }
    case 'UPDATE_SESSION':
      return {
        ...state,
        session: {
          ...state.session,
          ...action.session,
          lastActive: Date.now(),
        },
      }
    case 'RESET':
      return getInitialState()
    case 'HYDRATE':
      return action.state
    default:
      return state
  }
}

export function useWidgetState() {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState)
  const stateRef = useRef(state)
  const [hasBootstrapped, setHasBootstrapped] = useState(false)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const stored = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (stored) {
      const restored = restoreStateFromStorage(stored)
      if (restored) {
        dispatch({ type: 'HYDRATE', state: restored })
        setHasBootstrapped(true)
        return
      }
    }
    const intro = window.localStorage.getItem(INTRO_LOCAL_KEY)
    if (intro) {
      dispatch({
        type: 'UPDATE_SESSION',
        session: { introDismissedAt: Number(intro) || Date.now() },
      })
    }
    setHasBootstrapped(true)
  }, [])

  // Persist to session storage
  useEffect(() => {
    if (typeof window === 'undefined' || !hasBootstrapped) {
      return
    }
    window.sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ messages: state.messages, session: state.session })
    )
    if (state.session.introDismissedAt) {
      window.localStorage.setItem(INTRO_LOCAL_KEY, String(state.session.introDismissedAt))
    }
  }, [state.messages, state.session, hasBootstrapped])

  const openWidget = useCallback(() => {
    dispatch({ type: 'OPEN' })
  }, [])

  const closeWidget = useCallback(() => {
    dispatch({ type: 'CLOSE' })
  }, [])

  const toggleWidget = useCallback(() => {
    dispatch({ type: state.isOpen ? 'CLOSE' : 'OPEN' })
  }, [state.isOpen])

  const appendMessages = useCallback((messages: WidgetMessage[]) => {
    if (messages.length === 0) return
    dispatch({ type: 'APPEND_MESSAGES', messages })
  }, [])

  const replaceMessages = useCallback((messages: WidgetMessage[]) => {
    dispatch({ type: 'SET_MESSAGES', messages })
  }, [])

  const updateSession = useCallback((patch: Partial<WidgetState['session']>) => {
    dispatch({ type: 'UPDATE_SESSION', session: patch })
  }, [])

  const setProcessing = useCallback((value: boolean) => {
    dispatch({ type: 'SET_PROCESSING', value })
  }, [])

  const resetWidget = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return {
    // State
    state,
    stateRef,
    isOpen: state.isOpen,
    messages: state.messages,
    session: state.session,
    isProcessing: state.isProcessing,
    
    // Actions
    openWidget,
    closeWidget,
    toggleWidget,
    appendMessages,
    updateSession,
    setProcessing,
    resetWidget,
    replaceMessages,
  }
}
