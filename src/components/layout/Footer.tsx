'use client'

import React from 'react'
import Link from 'next/link'
import { Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { H4, BodyText, MutedText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

interface FooterProps {
  className?: string
}

const footerLinks = {
  shop: [
    { name: 'Rings', href: '/rings' },
    { name: 'Necklaces', href: '/necklaces' },
    { name: 'Earrings', href: '/earrings' },
    { name: 'Bracelets', href: '/bracelets' },
    { name: 'Gift Cards', href: '/gift-cards' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Sustainability', href: '/sustainability' },
    { name: 'Creator Program', href: '/creators' },
    { name: 'Press', href: '/press' },
    { name: 'Careers', href: '/careers' },
  ],
  support: [
    { name: 'Contact Us', href: '/contact' },
    { name: 'Size Guide', href: '/size-guide' },
    { name: 'Care Instructions', href: '/care' },
    { name: 'Shipping & Returns', href: '/shipping' },
    { name: 'FAQ', href: '/faq' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Accessibility', href: '/accessibility' },
  ],
}

const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com/glowglitch', icon: Instagram },
  { name: 'YouTube', href: 'https://youtube.com/@glowglitch', icon: Youtube },
]

export function Footer({ className }: FooterProps) {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement newsletter signup
    console.log('Newsletter signup submitted')
  }

  return (
    <footer className={cn('bg-foreground border-t border-foreground', className)}>
      <div className="container mx-auto px-4">
        {/* Main footer content */}
        <div className="py-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company info and newsletter */}
          <div className="lg:col-span-2">
            <img src="/glitchglow_logo_empty_gold.png" alt="GlowGlitch Logo" className="h-32 mb-4" />
            <BodyText size="sm" className="text-background mb-6 max-w-md">
              Sustainable luxury jewelry crafted with lab-grown diamonds. 
              Customize your perfect piece with our 3D technology and join 
              the ethical jewelry revolution.
            </BodyText>

            {/* Newsletter signup */}
            <div className="mb-6">
              <H4 level="h4" className="mb-2">Stay Connected</H4>
              <BodyText size="sm" className="text-background mb-3">
                Get exclusive access to new collections and sustainability updates.
              </BodyText>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1"
                  required
                />
                <Button type="submit" size="md">
                  Subscribe
                </Button>
              </form>
            </div>

            {/* Social links */}
            <div>
              <BodyText size="sm" weight="medium" className="mb-3">
                Follow Us
              </BodyText>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <Button
                    key={social.name}
                    variant="ghost"
                    size="icon"
                    asChild
                  >
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow us on ${social.name}`}
                    >
                      <social.icon size={20} />
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <H4 level="h4" className="mb-4">Shop</H4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-background hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <H4 level="h4" className="mb-4">Company</H4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-background hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <H4 level="h4" className="mb-4">Support</H4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-background hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <H4 level="h4" className="mb-4">Contact</H4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Mail size={16} className="text-background mt-0.5 flex-shrink-0" />
                <div>
                  <BodyText size="sm" className="text-background">
                    <a href="mailto:hello@glowglitch.com" className="hover:text-accent transition-colors">
                      hello@glowglitch.com
                    </a>
                  </BodyText>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone size={16} className="text-background mt-0.5 flex-shrink-0" />
                <div>
                  <BodyText size="sm" className="text-background">
                    <a href="tel:+1-555-GLOW-GEM" className="hover:text-accent transition-colors">
                      +1 (555) GLOW-GEM
                    </a>
                  </BodyText>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin size={16} className="text-background mt-0.5 flex-shrink-0" />
                <div>
                  <BodyText size="sm" className="text-background">
                    Available 24/7<br />
                    Virtual consultations
                  </BodyText>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sustainability highlight */}
        <div className="py-8 border-t border-background/20 -mx-4 px-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div>
              <H4 level="h4" className="mb-2 text-background">🌱 100% Sustainable</H4>
              <BodyText size="sm" className="text-background">
                Lab-grown diamonds with zero environmental impact
              </BodyText>
            </div>
            <div>
              <H4 level="h4" className="mb-2 text-background">✨ Ethically Sourced</H4>
              <BodyText size="sm" className="text-background">
                Conflict-free materials and fair labor practices
              </BodyText>
            </div>
            <div>
              <H4 level="h4" className="mb-2 text-background">🎨 Fully Customizable</H4>
              <BodyText size="sm" className="text-background">
                Design your perfect piece with our 3D customizer
              </BodyText>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-border flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap justify-center md:justify-start space-x-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-background hover:text-accent transition-colors text-sm"
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          <MutedText size="sm" className="text-background md:text-right">
            © 2025 GlowGlitch (Lumina Lab). All rights reserved.
          </MutedText>
        </div>
      </div>
    </footer>
  )
}