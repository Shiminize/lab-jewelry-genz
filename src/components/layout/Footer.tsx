'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { Instagram, Youtube, Mail, Phone, MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { H4, BodyText, MutedText } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

interface FooterProps {
  className?: string
}

// Types for our sections
interface LinkItem {
  name: string
  href: string
}

interface FAQItem {
  question: string
  answer: string
}

interface SectionContent {
  title: string
  items?: string[]
  links?: LinkItem[]
  faqs?: FAQItem[]
}

// Footer content structure - James Allen inspired
const footerSections: Record<string, SectionContent> = {
  about: {
    title: 'ABOUT GLOWGLITCH',
    links: [
      { name: 'Shop Catalog', href: '/catalog' },
      { name: '3D Customizer', href: '/customizer' },
      { name: 'Creator Program', href: '/creators/apply' },
      { name: 'My Wishlist', href: '/wishlist' },
      { name: 'Design System', href: '/ui-showcase' },
      { name: 'Sign In', href: '/login' },
      { name: 'Reviews', href: '/reviews' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
    ]
  },
  why: {
    title: 'WHY CHOOSE GLOWGLITCH?',
    items: [
      "Free Shipping Worldwide",
      "Lifetime Warranty",
      "Conflict-Free Lab Diamonds",
      "Jewelry Insurance",
      "Jewelry Protection Plans",
      "1 Year Free Resizing",
      "Free Engraving",
      "Tax & Duty Calculator"
    ]
  },
  experience: {
    title: 'EXPERIENCE GLOWGLITCH',
    items: [
      "3D Customizer Technology",
      "AR Virtual Try-On",
      "Personal Jewelry Consultant",
      "Creator Collaboration Program",
      "Virtual Showroom Experience"
    ],
    faqs: [
      {
        question: "How does 3D customization work?",
        answer: "Our 3D customizer uses advanced rendering to let you design jewelry in real-time. Select your base design, choose materials, adjust settings, and watch your creation come to life instantly."
      },
      {
        question: "What materials do you offer?",
        answer: "We exclusively use lab-grown diamonds, moissanite, and premium lab gems paired with recycled gold, platinum, and sterling silver. Every stone is conflict-free and scientifically superior."
      },
      {
        question: "How do I get my perfect fit?",
        answer: "Use our digital size guide, schedule a virtual consultation, or visit partner locations. We offer free resizing within one year of purchase."
      },
      {
        question: "What's included with my purchase?",
        answer: "Every piece includes lifetime warranty, jewelry insurance, authentication certificate, luxury packaging, and access to our creator community."
      },
      {
        question: "How does the Creator Program work?",
        answer: "Join our creator community to earn commissions, collaborate on designs, and access exclusive tools. Share your unique code and earn rewards."
      }
    ]
  }
}

// Social links
const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com/glowglitch', icon: Instagram },
  { name: 'YouTube', href: 'https://youtube.com/@glowglitch', icon: Youtube },
]

// Legal links
const legalLinks = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Cookie Policy', href: '/cookies' },
  { name: 'Accessibility', href: '/accessibility' },
]

// Accordion Section Component
interface AccordionSectionProps {
  section: SectionContent
  isOpen: boolean
  onToggle: () => void
  sectionKey: string
}

function AccordionSection({ section, isOpen, onToggle, sectionKey }: AccordionSectionProps) {
  const [openFAQs, setOpenFAQs] = useState<Record<number, boolean>>({})
  
  const toggleFAQ = useCallback((index: number) => {
    setOpenFAQs(prev => ({ ...prev, [index]: !prev[index] }))
  }, [])
  
  const contentId = `${sectionKey}-content`
  
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center py-4 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <H4 level="h4" className="text-background group-hover:text-accent transition-colors duration-300">
          {section.title}
        </H4>
        <div className="text-background group-hover:text-accent transition-transform duration-300">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>
      
      <div
        id={contentId}
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
        aria-hidden={!isOpen}
      >
        <div className="pb-6">
          {/* Render navigation links */}
          {section.links && (
            <div className="grid grid-cols-2 gap-3">
              {section.links.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="flex items-center space-x-2 text-background hover:text-accent transition-colors duration-300 py-1"
                >
                  <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                  <BodyText size="sm" className="text-current">{link.name}</BodyText>
                </Link>
              ))}
            </div>
          )}
          
          {/* Render value proposition items */}
          {section.items && (
            <ul className="space-y-3">
              {section.items.map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                  <BodyText size="sm" className="text-background">
                    {item}
                  </BodyText>
                </li>
              ))}
            </ul>
          )}
          
          {/* Render FAQ section */}
          {section.faqs && (
            <div className="mt-4 space-y-3">
              <BodyText size="sm" weight="medium" className="text-background mb-3">
                Frequently Asked Questions
              </BodyText>
              {section.faqs.map((faq, index) => {
                const isOpenFAQ = openFAQs[index] || false
                const faqId = `${sectionKey}-faq-${index}`
                
                return (
                  <div key={index} className="border-l-2 border-accent/30 pl-3">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      aria-expanded={isOpenFAQ}
                      aria-controls={faqId}
                    >
                      <div className="flex justify-between items-start py-2">
                        <BodyText size="sm" className="text-background group-hover:text-accent transition-colors pr-2">
                          {faq.question}
                        </BodyText>
                        <div className="text-background group-hover:text-accent transition-transform duration-300 flex-shrink-0">
                          {isOpenFAQ ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </div>
                    </button>
                    <div
                      id={faqId}
                      className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        isOpenFAQ ? "max-h-32 opacity-100 pb-2" : "max-h-0 opacity-0"
                      )}
                      aria-hidden={!isOpenFAQ}
                    >
                      <BodyText size="sm" className="text-background opacity-90">
                        {faq.answer}
                      </BodyText>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function Footer({ className }: FooterProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    about: false,
    why: false,
    experience: false
  })
  
  const toggleSection = useCallback((key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])
  
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Newsletter signup submitted')
  }
  
  return (
    <footer className={cn('bg-foreground', className)}>
      <div className="container mx-auto px-4">
        {/* Mobile Accordion Sections */}
        <div className="lg:hidden py-6 space-y-px">
          <AccordionSection
            section={footerSections.about}
            isOpen={openSections.about}
            onToggle={() => toggleSection('about')}
            sectionKey="about"
          />
          <AccordionSection
            section={footerSections.why}
            isOpen={openSections.why}
            onToggle={() => toggleSection('why')}
            sectionKey="why"
          />
          <AccordionSection
            section={footerSections.experience}
            isOpen={openSections.experience}
            onToggle={() => toggleSection('experience')}
            sectionKey="experience"
          />
        </div>
        
        {/* Desktop Expanded Sections */}
        <div className="hidden lg:grid grid-cols-3 gap-8 py-12">
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <H4 level="h4" className="text-background mb-4">{section.title}</H4>
              
              {/* Desktop navigation links */}
              {section.links && (
                <div className="space-y-2">
                  {section.links.map((link, index) => (
                    <Link
                      key={index}
                      href={link.href}
                      className="flex items-center space-x-2 text-background hover:text-accent transition-colors duration-300"
                    >
                      <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                      <BodyText size="sm" className="text-current">{link.name}</BodyText>
                    </Link>
                  ))}
                </div>
              )}
              
              {/* Desktop value items */}
              {section.items && (
                <ul className="space-y-2">
                  {section.items.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5" />
                      <BodyText size="sm" className="text-background">
                        {item}
                      </BodyText>
                    </li>
                  ))}
                </ul>
              )}
              
              {/* Desktop FAQ */}
              {section.faqs && (
                <div className="mt-4 space-y-2">
                  <BodyText size="sm" weight="medium" className="text-background mb-3">
                    FAQ
                  </BodyText>
                  {section.faqs.map((faq, index) => (
                    <details key={index} className="group cursor-pointer">
                      <summary className="flex items-start space-x-2 text-background hover:text-accent transition-colors list-none">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5" />
                        <BodyText size="sm">{faq.question}</BodyText>
                      </summary>
                      <div className="mt-2 ml-4 pl-3 border-l-2 border-accent/30">
                        <BodyText size="sm" className="text-background opacity-90">
                          {faq.answer}
                        </BodyText>
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Bottom Section - Logo, Newsletter, Contact */}
        <div className="py-8 border-t border-background/10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Logo & Newsletter */}
            <div className="lg:col-span-2">
              <img src="/glitchglow_logo_empty_gold.png" alt="GlowGlitch" className="h-24 mb-4" />
              <BodyText size="sm" className="text-background mb-6 max-w-md">
                Sustainable luxury jewelry crafted with lab-grown diamonds. 
                Design your perfect piece with our 3D technology.
              </BodyText>
              
              {/* Newsletter */}
              <div className="max-w-md">
                <H4 level="h4" className="text-background mb-2">Stay Connected</H4>
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
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
            </div>
            
            {/* Contact & Social */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail size={16} className="text-background" />
                  <a href="mailto:hello@glowglitch.com" className="text-background hover:text-accent transition-colors">
                    <BodyText size="sm">hello@glowglitch.com</BodyText>
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone size={16} className="text-background" />
                  <a href="tel:+1-555-GLOW-GEM" className="text-background hover:text-accent transition-colors">
                    <BodyText size="sm">+1 (555) GLOW-GEM</BodyText>
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={16} className="text-background" />
                  <BodyText size="sm" className="text-background">
                    Available 24/7 Virtual consultations
                  </BodyText>
                </div>
              </div>
              
              {/* Social Links */}
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
        </div>
        
        {/* Legal Links */}
        <div className="py-6 border-t border-background/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              {legalLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-background hover:text-accent transition-colors"
                >
                  <MutedText size="sm">{link.name}</MutedText>
                </Link>
              ))}
            </div>
            <MutedText size="sm" className="text-background">
              © 2025 GlowGlitch (Lumina Lab). All rights reserved.
            </MutedText>
          </div>
        </div>
      </div>
    </footer>
  )
}