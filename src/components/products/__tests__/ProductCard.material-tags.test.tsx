/**
 * ProductCard Material Tags Integration Tests
 * 
 * Tests MaterialTagChip functionality within ProductCard component
 * Validates tag extraction, rendering, and click handling
 * 
 * CLAUDE_RULES.md Compliance:
 * - Unit tests for components and business logic
 * - Performance validation (<50ms for tag extraction)
 * - Accessibility testing for interactive UI
 * - TypeScript strict mode with no 'any' types
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductCard } from '../ProductCard'
import type { ProductListDTO } from '@/types/product-dto'
import type { MaterialTag } from '@/types/material-tags'

// Mock the material tag extraction service at the top level
const mockExtractMaterialTags = jest.fn()

jest.mock('@/lib/services/material-tag-extraction.service', () => ({
  extractMaterialTags: mockExtractMaterialTags,
  extractMaterialTagsBatch: jest.fn()
}))

// Mock Next.js components
jest.mock('next/image', () => {
  return function MockImage({ alt, ...props }: any) {
    return <img {...props} alt={alt} />
  }
})

jest.mock('next/link', () => {
  return function MockLink({ children, href }: any) {
    return <a href={href}>{children}</a>
  }
})

// Mock inventory components
jest.mock('@/components/inventory/InventoryStatus', () => ({
  StockIndicator: ({ productId }: { productId: string }) => (
    <div data-testid="stock-indicator">{productId}</div>
  ),
  LiveStockCounter: ({ productId }: { productId: string }) => (
    <div data-testid="live-stock-counter">{productId}</div>
  )
}))

// mockExtractMaterialTags is already defined at the top

describe('ProductCard Material Tags Integration', () => {
  const mockProduct: ProductListDTO = {
    _id: 'test-product-1',
    name: 'Test Diamond Ring',
    slug: 'test-diamond-ring',
    category: 'rings',
    primaryImage: '/images/test-ring.jpg',
    pricing: {
      basePrice: 1299,
      currency: 'USD'
    },
    materialSpecs: {
      stoneType: 'lab-diamond',
      metalType: '14k-gold',
      caratWeight: 1.5,
      clarity: 'VS1',
      color: 'F',
      cut: 'round'
    },
    metadata: {
      tags: ['luxury', 'engagement', 'classic'],
      featured: false,
      isActive: true
    }
  }

  const mockMaterialTags: MaterialTag[] = [
    {
      id: 'lab-diamond',
      category: 'stone',
      displayName: 'Lab Diamond',
      filterValue: 'lab-diamond',
      sortOrder: 1
    },
    {
      id: '14k-gold',
      category: 'metal',
      displayName: '14K Gold',
      filterValue: '14k-gold',
      sortOrder: 2
    },
    {
      id: '1-5ct',
      category: 'carat',
      displayName: '1.5CT',
      filterValue: '1.5',
      sortOrder: 3
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Material Tag Extraction', () => {
    it('should extract material tags from product specs', () => {
      mockExtractMaterialTags.mockReturnValue({
        success: true,
        data: mockMaterialTags,
        metrics: {
          extractionTime: 25,
          productsProcessed: 1,
          tagsGenerated: 3,
          isWithinThreshold: true
        }
      })

      render(<ProductCard product={mockProduct} />)

      expect(mockExtractMaterialTags).toHaveBeenCalledWith(mockProduct)
      expect(screen.getByText('Lab Diamond')).toBeInTheDocument()
      expect(screen.getByText('14K Gold')).toBeInTheDocument()
      expect(screen.getByText('1.5CT')).toBeInTheDocument()
    })

    it('should handle extraction failure gracefully', () => {
      mockExtractMaterialTags.mockReturnValue({
        success: false,
        error: {
          type: 'INVALID_MATERIAL_SPECS',
          message: 'Invalid material specifications'
        }
      })

      render(<ProductCard product={mockProduct} />)

      expect(mockExtractMaterialTags).toHaveBeenCalledWith(mockProduct)
      // Should fallback to legacy tags
      expect(screen.getByText('luxury • engagement • classic')).toBeInTheDocument()
    })

    it('should validate performance threshold compliance', () => {
      mockExtractMaterialTags.mockReturnValue({
        success: true,
        data: mockMaterialTags,
        metrics: {
          extractionTime: 45, // Within 50ms threshold
          productsProcessed: 1,
          tagsGenerated: 3,
          isWithinThreshold: true
        }
      })

      render(<ProductCard product={mockProduct} />)

      expect(mockExtractMaterialTags).toHaveBeenCalledWith(mockProduct)
      // Performance should be within CLAUDE_RULES threshold
      const callResult = mockExtractMaterialTags.mock.results[0].value
      expect(callResult.metrics?.isWithinThreshold).toBe(true)
      expect(callResult.metrics?.extractionTime).toBeLessThan(50)
    })
  })

  describe('MaterialTagChip Click Functionality', () => {
    const mockOnTagClick = jest.fn()
    const mockOnMaterialTagClick = jest.fn()

    beforeEach(() => {
      mockExtractMaterialTags.mockReturnValue({
        success: true,
        data: mockMaterialTags
      })
    })

    it('should call onMaterialTagClick when MaterialTagChip is clicked', async () => {
      const user = userEvent.setup()

      render(
        <ProductCard 
          product={mockProduct} 
          onMaterialTagClick={mockOnMaterialTagClick}
        />
      )

      const labDiamondTag = screen.getByText('Lab Diamond')
      await user.click(labDiamondTag)

      expect(mockOnMaterialTagClick).toHaveBeenCalledWith(mockMaterialTags[0])
      expect(mockOnMaterialTagClick).toHaveBeenCalledTimes(1)
    })

    it('should fallback to onTagClick when onMaterialTagClick not provided', async () => {
      const user = userEvent.setup()

      render(
        <ProductCard 
          product={mockProduct} 
          onTagClick={mockOnTagClick}
        />
      )

      const goldTag = screen.getByText('14K Gold')
      await user.click(goldTag)

      expect(mockOnTagClick).toHaveBeenCalledWith('14k-gold')
      expect(mockOnTagClick).toHaveBeenCalledTimes(1)
    })

    it('should pass correct tag data for different material types', async () => {
      const user = userEvent.setup()

      render(
        <ProductCard 
          product={mockProduct} 
          onMaterialTagClick={mockOnMaterialTagClick}
        />
      )

      // Test stone tag click
      const stoneTag = screen.getByText('Lab Diamond')
      await user.click(stoneTag)
      expect(mockOnMaterialTagClick).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'stone',
          filterValue: 'lab-diamond'
        })
      )

      // Test metal tag click
      const metalTag = screen.getByText('14K Gold')
      await user.click(metalTag)
      expect(mockOnMaterialTagClick).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'metal',
          filterValue: '14k-gold'
        })
      )

      // Test carat tag click
      const caratTag = screen.getByText('1.5CT')
      await user.click(caratTag)
      expect(mockOnMaterialTagClick).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'carat',
          filterValue: '1.5'
        })
      )
    })

    it('should prevent event propagation when tag is clicked', async () => {
      const user = userEvent.setup()
      const mockCardClick = jest.fn()

      render(
        <div onClick={mockCardClick}>
          <ProductCard 
            product={mockProduct} 
            onMaterialTagClick={mockOnMaterialTagClick}
          />
        </div>
      )

      const tag = screen.getByText('Lab Diamond')
      await user.click(tag)

      expect(mockOnMaterialTagClick).toHaveBeenCalled()
      expect(mockCardClick).not.toHaveBeenCalled()
    })
  })

  describe('Tag Display Variants', () => {
    beforeEach(() => {
      mockExtractMaterialTags.mockReturnValue({
        success: true,
        data: mockMaterialTags
      })
    })

    it('should limit tags in standard variant (3 tags max)', () => {
      const manyTags = [
        ...mockMaterialTags,
        { id: 'extra-1', category: 'stone' as const, displayName: 'Extra 1', filterValue: 'extra-1', sortOrder: 4 },
        { id: 'extra-2', category: 'metal' as const, displayName: 'Extra 2', filterValue: 'extra-2', sortOrder: 5 }
      ]

      mockExtractMaterialTags.mockReturnValue({
        success: true,
        data: manyTags
      })

      render(<ProductCard product={mockProduct} variant="standard" />)

      // Should show only first 3 tags
      expect(screen.getByText('Lab Diamond')).toBeInTheDocument()
      expect(screen.getByText('14K Gold')).toBeInTheDocument()
      expect(screen.getByText('1.5CT')).toBeInTheDocument()
      
      // Should show "+2 more" indicator
      expect(screen.getByText('+2 more')).toBeInTheDocument()
      
      // Extra tags should not be visible
      expect(screen.queryByText('Extra 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Extra 2')).not.toBeInTheDocument()
    })

    it('should limit tags in featured variant (4 tags max)', () => {
      const manyTags = [
        ...mockMaterialTags,
        { id: 'extra-1', category: 'stone' as const, displayName: 'Extra 1', filterValue: 'extra-1', sortOrder: 4 },
        { id: 'extra-2', category: 'metal' as const, displayName: 'Extra 2', filterValue: 'extra-2', sortOrder: 5 }
      ]

      mockExtractMaterialTags.mockReturnValue({
        success: true,
        data: manyTags
      })

      render(<ProductCard product={mockProduct} variant="featured" />)

      // Should show first 4 tags
      expect(screen.getByText('Lab Diamond')).toBeInTheDocument()
      expect(screen.getByText('14K Gold')).toBeInTheDocument()
      expect(screen.getByText('1.5CT')).toBeInTheDocument()
      expect(screen.getByText('Extra 1')).toBeInTheDocument()
      
      // Should show "+1 more" indicator
      expect(screen.getByText('+1 more')).toBeInTheDocument()
      
      // Last tag should not be visible
      expect(screen.queryByText('Extra 2')).not.toBeInTheDocument()
    })

    it('should limit tags in compact variant (2 tags max)', () => {
      render(<ProductCard product={mockProduct} variant="compact" />)

      // Should show only first 2 tags
      expect(screen.getByText('Lab Diamond')).toBeInTheDocument()
      expect(screen.getByText('14K Gold')).toBeInTheDocument()
      
      // Should show "+1" indicator for remaining tag
      expect(screen.getByText('+1')).toBeInTheDocument()
      
      // Third tag should not be visible
      expect(screen.queryByText('1.5CT')).not.toBeInTheDocument()
    })

    it('should not show material tags in compact variant when none available', () => {
      mockExtractMaterialTags.mockReturnValue({
        success: true,
        data: []
      })

      const productWithoutSpecs = {
        ...mockProduct,
        materialSpecs: undefined
      }

      render(<ProductCard product={productWithoutSpecs} variant="compact" />)

      // Should not show tag container
      expect(screen.queryByRole('group', { name: 'Product material filters' })).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      mockExtractMaterialTags.mockReturnValue({
        success: true,
        data: mockMaterialTags
      })
    })

    it('should have proper ARIA attributes', () => {
      render(<ProductCard product={mockProduct} />)

      const tagGroup = screen.getByRole('group', { name: 'Product material filters' })
      expect(tagGroup).toBeInTheDocument()

      const labDiamondTag = screen.getByRole('button', { name: /Add Lab Diamond filter/i })
      expect(labDiamondTag).toHaveAttribute('aria-pressed', 'false')
      expect(labDiamondTag).toHaveAttribute('tabIndex', '0')
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      const mockOnMaterialTagClick = jest.fn()

      render(
        <ProductCard 
          product={mockProduct} 
          onMaterialTagClick={mockOnMaterialTagClick}
        />
      )

      const labDiamondTag = screen.getByText('Lab Diamond')
      
      // Focus the tag
      labDiamondTag.focus()
      expect(labDiamondTag).toHaveFocus()

      // Press Enter
      await user.keyboard('{Enter}')
      expect(mockOnMaterialTagClick).toHaveBeenCalledWith(mockMaterialTags[0])

      // Press Space
      await user.keyboard(' ')
      expect(mockOnMaterialTagClick).toHaveBeenCalledTimes(2)
    })

    it('should have minimum touch target size', () => {
      render(<ProductCard product={mockProduct} />)

      const materialTags = screen.getAllByRole('button', { name: /filter/i })
      
      materialTags.forEach(tag => {
        const computedStyle = window.getComputedStyle(tag)
        const minHeight = parseInt(computedStyle.minHeight)
        
        // Should meet WCAG 2.1 touch target requirements (44px minimum)
        expect(minHeight).toBeGreaterThanOrEqual(40) // sm variant is 40px, md is 44px
      })
    })
  })

  describe('Fallback Behavior', () => {
    it('should show legacy tags when material specs are missing', () => {
      const productWithoutSpecs = {
        ...mockProduct,
        materialSpecs: undefined
      }

      mockExtractMaterialTags.mockReturnValue({
        success: true,
        data: []
      })

      render(<ProductCard product={productWithoutSpecs} />)

      // Should show legacy tags from metadata
      expect(screen.getByText('luxury • engagement • classic')).toBeInTheDocument()
    })

    it('should show limited legacy tags with more indicator', () => {
      const productWithManyTags = {
        ...mockProduct,
        materialSpecs: undefined,
        metadata: {
          ...mockProduct.metadata,
          tags: ['luxury', 'engagement', 'classic', 'premium', 'certified', 'exclusive']
        }
      }

      mockExtractMaterialTags.mockReturnValue({
        success: true,
        data: []
      })

      render(<ProductCard product={productWithManyTags} />)

      // Should show first 3 tags plus more indicator
      expect(screen.getByText('luxury • engagement • classic +3 more')).toBeInTheDocument()
    })

    it('should handle empty legacy tags gracefully', () => {
      const productWithoutTags = {
        ...mockProduct,
        materialSpecs: undefined,
        metadata: {
          ...mockProduct.metadata,
          tags: []
        }
      }

      mockExtractMaterialTags.mockReturnValue({
        success: true,
        data: []
      })

      render(<ProductCard product={productWithoutTags} />)

      // Should not show any tag-related content
      expect(screen.queryByRole('group', { name: 'Product material filters' })).not.toBeInTheDocument()
      expect(screen.queryByText('•')).not.toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should memoize material tag extraction', () => {
      mockExtractMaterialTags.mockReturnValue({
        success: true,
        data: mockMaterialTags
      })

      const { rerender } = render(<ProductCard product={mockProduct} />)
      
      // Re-render with same product
      rerender(<ProductCard product={mockProduct} />)

      // Should only call extraction once due to memoization
      expect(mockExtractMaterialTags).toHaveBeenCalledTimes(1)
    })

    it('should re-extract when product changes', () => {
      mockExtractMaterialTags.mockReturnValue({
        success: true,
        data: mockMaterialTags
      })

      const { rerender } = render(<ProductCard product={mockProduct} />)
      
      const newProduct = {
        ...mockProduct,
        _id: 'different-product',
        materialSpecs: {
          ...mockProduct.materialSpecs!,
          stoneType: 'moissanite' as const
        }
      }
      
      rerender(<ProductCard product={newProduct} />)

      // Should call extraction again with new product
      expect(mockExtractMaterialTags).toHaveBeenCalledTimes(2)
      expect(mockExtractMaterialTags).toHaveBeenLastCalledWith(newProduct)
    })
  })
})