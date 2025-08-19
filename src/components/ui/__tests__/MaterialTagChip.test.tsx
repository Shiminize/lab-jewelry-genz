import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MaterialTagChip } from '../MaterialTagChip'
import type { MaterialTag } from '@/types/material-tags'

// Mock material tags for testing
const mockStoneTag: MaterialTag = {
  id: 'lab-diamond-1ct',
  category: 'stone',
  displayName: '1CT Lab Diamond',
  filterValue: 'lab-diamond',
  sortOrder: 1
}

const mockMetalTag: MaterialTag = {
  id: '14k-gold',
  category: 'metal',
  displayName: '14K Gold',
  filterValue: '14k-gold',
  sortOrder: 2
}

const mockCaratTag: MaterialTag = {
  id: 'carat-1ct',
  category: 'carat',
  displayName: '1CT',
  filterValue: '1',
  sortOrder: 3
}

describe('MaterialTagChip', () => {
  describe('Rendering', () => {
    it('renders stone tag with correct styling', () => {
      render(<MaterialTagChip tag={mockStoneTag} />)
      
      const chip = screen.getByRole('button', { name: /add 1ct lab diamond filter/i })
      expect(chip).toBeInTheDocument()
      expect(chip).toHaveTextContent('1CT Lab Diamond')
      expect(chip).toHaveClass('text-accent', 'bg-white')
    })

    it('renders metal tag with correct styling', () => {
      render(<MaterialTagChip tag={mockMetalTag} />)
      
      const chip = screen.getByRole('button', { name: /add 14k gold filter/i })
      expect(chip).toBeInTheDocument()
      expect(chip).toHaveTextContent('14K Gold')
      expect(chip).toHaveClass('text-foreground', 'bg-muted')
    })

    it('renders carat tag with correct styling', () => {
      render(<MaterialTagChip tag={mockCaratTag} />)
      
      const chip = screen.getByRole('button', { name: /add 1ct filter/i })
      expect(chip).toBeInTheDocument()
      expect(chip).toHaveTextContent('1CT')
      expect(chip).toHaveClass('text-foreground', 'bg-white')
    })

    it('renders with icon when provided', () => {
      const TestIcon = () => <span data-testid="test-icon">💎</span>
      
      render(
        <MaterialTagChip 
          tag={mockStoneTag} 
          icon={<TestIcon />}
        />
      )
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
      expect(screen.getByText('1CT Lab Diamond')).toBeInTheDocument()
    })
  })

  describe('Selection States', () => {
    it('renders unselected state correctly', () => {
      render(<MaterialTagChip tag={mockStoneTag} selected={false} />)
      
      const chip = screen.getByRole('button')
      expect(chip).toHaveAttribute('aria-pressed', 'false')
      expect(chip).toHaveAttribute('aria-label', 'Add 1CT Lab Diamond filter')
      expect(chip).not.toHaveClass('text-background', 'bg-cta')
    })

    it('renders selected state correctly', () => {
      render(<MaterialTagChip tag={mockStoneTag} selected={true} />)
      
      const chip = screen.getByRole('button')
      expect(chip).toHaveAttribute('aria-pressed', 'true')
      expect(chip).toHaveAttribute('aria-label', 'Remove 1CT Lab Diamond filter')
      expect(chip).toHaveClass('text-background', 'bg-cta')
    })
  })

  describe('Size Variants', () => {
    it('renders small size correctly', () => {
      render(<MaterialTagChip tag={mockStoneTag} size="sm" />)
      
      const chip = screen.getByRole('button')
      expect(chip).toHaveClass('min-h-10', 'px-3', 'py-2', 'text-sm')
    })

    it('renders medium size correctly (default)', () => {
      render(<MaterialTagChip tag={mockStoneTag} size="md" />)
      
      const chip = screen.getByRole('button')
      expect(chip).toHaveClass('min-h-11', 'px-4', 'py-2.5', 'text-sm')
    })

    it('uses medium size as default', () => {
      render(<MaterialTagChip tag={mockStoneTag} />)
      
      const chip = screen.getByRole('button')
      expect(chip).toHaveClass('min-h-11', 'px-4', 'py-2.5', 'text-sm')
    })
  })

  describe('Interaction', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup()
      const handleClick = jest.fn()
      
      render(<MaterialTagChip tag={mockStoneTag} onClick={handleClick} />)
      
      const chip = screen.getByRole('button')
      await user.click(chip)
      
      expect(handleClick).toHaveBeenCalledWith(mockStoneTag)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('calls onClick on Enter key press', async () => {
      const user = userEvent.setup()
      const handleClick = jest.fn()
      
      render(<MaterialTagChip tag={mockStoneTag} onClick={handleClick} />)
      
      const chip = screen.getByRole('button')
      chip.focus()
      await user.keyboard('{Enter}')
      
      expect(handleClick).toHaveBeenCalledWith(mockStoneTag)
    })

    it('calls onClick on Space key press', async () => {
      const user = userEvent.setup()
      const handleClick = jest.fn()
      
      render(<MaterialTagChip tag={mockStoneTag} onClick={handleClick} />)
      
      const chip = screen.getByRole('button')
      chip.focus()
      await user.keyboard(' ')
      
      expect(handleClick).toHaveBeenCalledWith(mockStoneTag)
    })

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup()
      const handleClick = jest.fn()
      
      render(
        <MaterialTagChip 
          tag={mockStoneTag} 
          onClick={handleClick} 
          disabled={true} 
        />
      )
      
      const chip = screen.getByRole('button')
      await user.click(chip)
      
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('prevents event propagation on click', () => {
      const handleClick = jest.fn()
      const handleContainerClick = jest.fn()
      
      render(
        <div onClick={handleContainerClick}>
          <MaterialTagChip tag={mockStoneTag} onClick={handleClick} />
        </div>
      )
      
      const chip = screen.getByRole('button')
      fireEvent.click(chip)
      
      expect(handleClick).toHaveBeenCalledWith(mockStoneTag)
      expect(handleContainerClick).not.toHaveBeenCalled()
    })
  })

  describe('Disabled State', () => {
    it('renders disabled styling when disabled', () => {
      render(<MaterialTagChip tag={mockStoneTag} disabled={true} />)
      
      const chip = screen.getByRole('button')
      expect(chip).toBeDisabled()
      expect(chip).toHaveClass('opacity-50', 'cursor-not-allowed', 'pointer-events-none')
      expect(chip).toHaveAttribute('tabIndex', '-1')
    })

    it('does not respond to keyboard events when disabled', async () => {
      const user = userEvent.setup()
      const handleClick = jest.fn()
      
      render(
        <MaterialTagChip 
          tag={mockStoneTag} 
          onClick={handleClick} 
          disabled={true} 
        />
      )
      
      const chip = screen.getByRole('button')
      chip.focus()
      await user.keyboard('{Enter}')
      await user.keyboard(' ')
      
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<MaterialTagChip tag={mockStoneTag} />)
      
      const chip = screen.getByRole('button')
      expect(chip).toHaveAttribute('type', 'button')
      expect(chip).toHaveAttribute('aria-pressed', 'false')
      expect(chip).toHaveAttribute('aria-label', 'Add 1CT Lab Diamond filter')
      expect(chip).toHaveAttribute('tabIndex', '0')
    })

    it('meets minimum touch target size (44px)', () => {
      render(<MaterialTagChip tag={mockStoneTag} size="md" />)
      
      const chip = screen.getByRole('button')
      expect(chip).toHaveClass('min-h-11') // 44px minimum height
    })

    it('has proper focus management', async () => {
      const user = userEvent.setup()
      
      render(<MaterialTagChip tag={mockStoneTag} />)
      
      const chip = screen.getByRole('button')
      await user.tab()
      
      expect(chip).toHaveFocus()
    })

    it('has focus ring styles', () => {
      render(<MaterialTagChip tag={mockStoneTag} />)
      
      const chip = screen.getByRole('button')
      expect(chip).toHaveClass('focus:ring-2', 'focus:ring-accent', 'focus:ring-offset-2')
    })
  })

  describe('Category-Specific Styling', () => {
    it('applies stone category styling correctly', () => {
      render(<MaterialTagChip tag={mockStoneTag} />)
      
      const chip = screen.getByRole('button')
      expect(chip).toHaveClass('text-accent', 'bg-white', 'border-accent/20')
    })

    it('applies metal category styling correctly', () => {
      render(<MaterialTagChip tag={mockMetalTag} />)
      
      const chip = screen.getByRole('button')
      expect(chip).toHaveClass('text-foreground', 'bg-muted', 'border-border')
    })

    it('applies carat category styling correctly', () => {
      render(<MaterialTagChip tag={mockCaratTag} />)
      
      const chip = screen.getByRole('button')
      expect(chip).toHaveClass('text-foreground', 'bg-white', 'border-border')
    })

    it('overrides category styling when selected', () => {
      render(<MaterialTagChip tag={mockStoneTag} selected={true} />)
      
      const chip = screen.getByRole('button')
      expect(chip).toHaveClass('text-background', 'bg-cta', 'border-cta')
    })
  })

  describe('Custom Props', () => {
    it('accepts and applies custom className', () => {
      render(
        <MaterialTagChip 
          tag={mockStoneTag} 
          className="custom-class" 
        />
      )
      
      const chip = screen.getByRole('button')
      expect(chip).toHaveClass('custom-class')
    })

    it('forwards other button props', () => {
      render(
        <MaterialTagChip 
          tag={mockStoneTag} 
          data-testid="custom-chip"
          title="Custom title"
        />
      )
      
      const chip = screen.getByTestId('custom-chip')
      expect(chip).toHaveAttribute('title', 'Custom title')
    })
  })
})