import { act, renderHook, waitFor } from '@testing-library/react'
import { useCustomizerState } from '@/features/customizer/hooks/useCustomizerState'
import { defaultCustomizerConfig } from '@/config/customizerDefaults'

jest.mock('@/services/neon/customizerService', () => {
  const actual = jest.requireActual('@/services/neon/customizerService')
  return {
    ...actual,
    fetchCustomizerConfig: jest.fn(),
  }
})

jest.mock('@/features/customizer/hooks/useGlbVariant', () => ({
  useGlbVariant: jest.fn(),
}))

const mockFetchCustomizerConfig = require('@/services/neon/customizerService').fetchCustomizerConfig as jest.Mock
const { useGlbVariant: mockUseGlbVariant } = require('@/features/customizer/hooks/useGlbVariant') as {
  useGlbVariant: jest.Mock
}

const variantsById: Record<string, { id: string; name: string; src: string }> = {
  'astro-demo': {
    id: 'astro-demo',
    name: 'Astronaut Demo',
    src: '/models/astro.glb',
  },
  'ring-luxury-001': {
    id: 'ring-luxury-001',
    name: 'Ring Luxury 001',
    src: '/models/neon/ring-luxury-001.glb',
  },
  'ring-classic-002': {
    id: 'ring-classic-002',
    name: 'Ring Classic 002',
    src: '/models/neon/ring-classic-002.glb',
  },
}

const variantsList = Object.values(variantsById)

describe('useCustomizerState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGlbVariant.mockImplementation((variantId: string) => ({
      variant: variantsById[variantId] ?? undefined,
      variants: variantsList,
      isLoading: false,
      error: undefined,
    }))
  })

  it('loads config, material options, and calculates initial price', async () => {
    mockFetchCustomizerConfig.mockResolvedValue(defaultCustomizerConfig)

    const { result } = renderHook(() => useCustomizerState('astro-demo'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.materialOptions).toHaveLength(defaultCustomizerConfig.materials.length)
    expect(result.current.priceQuote?.total).toBe(180)
    expect(mockFetchCustomizerConfig).toHaveBeenCalledTimes(1)
  })

  it('updates price when selecting a different variant', async () => {
    mockFetchCustomizerConfig.mockResolvedValue(defaultCustomizerConfig)

    const { result } = renderHook(() => useCustomizerState('astro-demo'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.selectVariant('ring-luxury-001')
    })

    await waitFor(() => {
      expect(result.current.selectedVariantId).toBe('ring-luxury-001')
    })
    expect(result.current.priceQuote?.total).toBe(1600)
  })

  it('retries configuration loading when initial request fails', async () => {
    mockFetchCustomizerConfig
      .mockRejectedValueOnce(new Error('network failure'))
      .mockResolvedValueOnce(defaultCustomizerConfig)

    const { result } = renderHook(() => useCustomizerState('astro-demo'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('network failure')
    expect(result.current.materialOptions.length).toBeGreaterThan(0)

    act(() => {
      result.current.retry()
    })
    await waitFor(() => expect(mockFetchCustomizerConfig).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(result.current.error).toBeUndefined())
  })
})
