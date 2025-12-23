import { fireEvent, render, screen } from '@testing-library/react'
import { CustomizerExperience } from '@/features/customizer/components/CustomizerExperience'
import { useCustomizerState } from '@/features/customizer/hooks/useCustomizerState'

jest.mock('@/features/customizer/hooks/useCustomizerState')

const mockUseCustomizerState = useCustomizerState as jest.MockedFunction<typeof useCustomizerState>

const baseState = {
  variants: [],
  variant: undefined,
  materialOptions: [],
  priceQuote: undefined,
  selectedVariantId: undefined,
  selectedMaterialId: undefined,
  isLoading: false,
  error: undefined,
  selectVariant: jest.fn(),
  selectMaterial: jest.fn(),
  retry: jest.fn(),
}

const basePipeline = [{ title: 'Process assets', detail: 'Run scripts/glb-pack.js to compress and emit posters.' }]
const baseRoadmap = [{ title: 'Readme', description: 'Review the project overview.', reference: 'README.md' }]

describe('CustomizerExperience', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders a loading surface while manifest resolves', () => {
    mockUseCustomizerState.mockReturnValue({
      ...baseState,
      isLoading: true,
    })

    render(<CustomizerExperience pipelineSteps={basePipeline} roadmapItems={baseRoadmap} />)

    expect(screen.getByText(/Loading GLB manifest/i)).toBeInTheDocument()
  })

  it('renders error state with retry action', () => {
    const retry = jest.fn()
    mockUseCustomizerState.mockReturnValue({
      ...baseState,
      error: 'failed to fetch manifest',
      retry,
    })

    render(<CustomizerExperience pipelineSteps={basePipeline} roadmapItems={baseRoadmap} />)

    expect(screen.getByText(/failed to fetch manifest/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /retry manifest load/i }))
    expect(retry).toHaveBeenCalled()
  })

  it('renders variants, material options, and emits selection events', () => {
    const selectVariant = jest.fn()
    const selectMaterial = jest.fn()

    mockUseCustomizerState.mockReturnValue({
      ...baseState,
      variants: [
        { id: 'astro-demo', name: 'Astronaut Demo', src: '#', poster: undefined },
        { id: 'ring-luxury-001', name: 'Ring Luxury 001', src: '#', poster: undefined },
        { id: 'ring-classic-002', name: 'Ring Classic 002', src: '#', poster: undefined },
      ],
      variant: { id: 'ring-luxury-001', name: 'Ring Luxury 001', src: '#', poster: undefined },
      materialOptions: [
        { id: 'platinum-polish', label: 'Platinum Polish', description: 'Mirror finish', priceAdjustment: 180 },
        { id: '14k-rose-gold', label: '14K Rose Gold', description: 'Warm glow', priceAdjustment: 90 },
      ],
      priceQuote: {
        variantId: 'ring-luxury-001',
        materialId: 'platinum-polish',
        basePrice: 1420,
        materialAdjustment: 180,
        total: 1600,
        currency: 'USD',
      },
      selectedVariantId: 'ring-luxury-001',
      selectedMaterialId: 'platinum-polish',
      selectVariant,
      selectMaterial,
    })

    render(<CustomizerExperience pipelineSteps={basePipeline} roadmapItems={baseRoadmap} />)

    expect(screen.getByTestId('variant-name')).toHaveTextContent('Ring Luxury 001')
    expect(screen.getByTestId('price-base')).toHaveTextContent('1,420')
    expect(screen.getByTestId('price-total')).toHaveTextContent('$1,600')

    fireEvent.click(screen.getByTestId('variant-option-ring-classic-002'))
    expect(selectVariant).toHaveBeenCalledWith('ring-classic-002')

    fireEvent.click(screen.getByTestId('material-option-14k-rose-gold'))
    expect(selectMaterial).toHaveBeenCalledWith('14k-rose-gold')
  })
})
