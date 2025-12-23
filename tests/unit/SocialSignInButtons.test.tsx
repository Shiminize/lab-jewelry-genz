import { render, screen } from '@testing-library/react'
import { SocialSignInButtons } from '@/components/auth/SocialSignInButtons'

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}))

describe('SocialSignInButtons', () => {
  it('renders a button for each provider', () => {
    render(<SocialSignInButtons redirectTo="/" providers={['google', 'apple', 'facebook']} />)
    expect(screen.getByText('Continue with Google')).toBeInTheDocument()
    expect(screen.getByText('Continue with Apple')).toBeInTheDocument()
    expect(screen.getByText('Continue with Facebook')).toBeInTheDocument()
  })
})
