import { render, screen, fireEvent } from '@testing-library/react'
import { ProductGallery } from '@/components/product/ProductGallery'

describe('ProductGallery', () => {
  it('renders the hero image and switches when thumbnail is clicked', () => {
    const images = ['/images/a.jpg', '/images/b.jpg']

    render(<ProductGallery images={images} productName="Halo Ring" tone="magenta" />)

    const hero = screen.getByAltText('Halo Ring preview')
    expect(hero).toBeInTheDocument()

    const secondThumb = screen.getByRole('button', { name: /image 2/i })
    fireEvent.click(secondThumb)

    expect(screen.getByAltText('Halo Ring preview')).toHaveAttribute('src', expect.stringContaining('b.jpg'))
  })

  it('shows lightbox when full size button is pressed', () => {
    const images = ['/images/a.jpg']

    render(<ProductGallery images={images} productName="Halo Ring" tone="magenta" />)

    const viewFullSize = screen.getByRole('button', { name: /view full size/i })
    fireEvent.click(viewFullSize)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByAltText('Halo Ring full size')).toBeInTheDocument()
  })

  it('renders fallback state when no images present', () => {
    render(<ProductGallery images={[]} productName="Mystery Capsule" tone="volt" />)

    expect(screen.getByText(/imagery coming soon/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /view full size/i })).not.toBeInTheDocument()
  })
})
