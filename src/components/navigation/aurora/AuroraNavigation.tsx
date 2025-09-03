'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDownIcon, MenuIcon, SearchIcon, ShoppingBagIcon, HeartIcon } from 'lucide-react';
import './aurora-navigation.css';

// Aurora Navigation Types
interface AuroraNavigationProps {
  className?: string;
  onMobileMenuToggle?: () => void;
}

interface NavigationCategory {
  id: string;
  label: string;
  href?: string;
  sections: NavigationSection[];
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

interface NavigationItem {
  label: string;
  href: string;
  isNew?: boolean;
  count?: number;
}

interface MaterialOption {
  id: string;
  name: string;
  color: string;
  price: number;
}

// Navigation Data - Luxury Jewelry Focused
const navigationCategories: NavigationCategory[] = [
  {
    id: 'shop',
    label: 'Shop',
    sections: [
      {
        title: 'By Product Type',
        items: [
          { label: 'Engagement Rings', href: '/catalog?category=engagement-rings', count: 45 },
          { label: 'Wedding Bands', href: '/catalog?category=wedding-bands', count: 32 },
          { label: 'Necklaces', href: '/catalog?category=necklaces', count: 28 },
          { label: 'Earrings', href: '/catalog?category=earrings', count: 38 },
          { label: 'Bracelets', href: '/catalog?category=bracelets', count: 15 }
        ]
      },
      {
        title: 'By Occasion',
        items: [
          { label: 'Engagement & Wedding', href: '/catalog?occasion=engagement' },
          { label: 'Anniversary Gifts', href: '/catalog?occasion=anniversary' },
          { label: 'Everyday Luxury', href: '/catalog?occasion=daily' },
          { label: 'Special Moments', href: '/catalog?occasion=special' }
        ]
      },
      {
        title: 'Quick Filters',
        items: [
          { label: 'Under $1,000', href: '/catalog?price=under-1000' },
          { label: '$1,000 - $5,000', href: '/catalog?price=1000-5000' },
          { label: 'Above $5,000', href: '/catalog?price=above-5000' },
          { label: 'Lab-Grown Only', href: '/catalog?material=lab-grown', isNew: true }
        ]
      },
      {
        title: 'Inspiration',
        items: [
          { label: 'Featured Collection', href: '/collections/featured' },
          { label: 'Trending Styles', href: '/trending' },
          { label: 'Customer Stories', href: '/stories' },
          { label: 'Gift Guide', href: '/gifts' }
        ]
      }
    ]
  },
  {
    id: 'lab-grown',
    label: 'Lab-Grown Diamonds',
    href: '/lab-grown-diamonds',
    sections: [
      {
        title: 'Diamond Types',
        items: [
          { label: 'Classic Lab-Grown', href: '/lab-grown/classic' },
          { label: 'Colored Diamonds', href: '/lab-grown/colored' },
          { label: 'Certified Stones', href: '/lab-grown/certified' },
          { label: 'Custom Cuts', href: '/lab-grown/custom' }
        ]
      },
      {
        title: 'Education',
        items: [
          { label: 'Lab-Grown vs Natural', href: '/education/comparison' },
          { label: 'Certification Guide', href: '/education/certification' },
          { label: 'Sustainability Impact', href: '/education/sustainability' },
          { label: 'Care Instructions', href: '/care' }
        ]
      }
    ]
  },
  {
    id: 'customize',
    label: 'Customize',
    href: '/customizer',
    sections: [
      {
        title: '3D Customizer',
        items: [
          { label: 'Ring Designer', href: '/customizer?type=ring' },
          { label: 'Necklace Builder', href: '/customizer?type=necklace' },
          { label: 'Earring Maker', href: '/customizer?type=earrings' },
          { label: 'Complete Set', href: '/customizer?type=set' }
        ]
      },
      {
        title: 'Popular Options',
        items: [
          { label: 'Solitaire Rings', href: '/customizer/solitaire' },
          { label: 'Three Stone', href: '/customizer/three-stone' },
          { label: 'Vintage Inspired', href: '/customizer/vintage' },
          { label: 'Modern Minimalist', href: '/customizer/modern' }
        ]
      }
    ]
  },
  {
    id: 'creators',
    label: 'Creator Collections',
    href: '/creators',
    sections: [
      {
        title: 'Featured Creators',
        items: [
          { label: 'Emma\'s Minimalist Collection', href: '/creators/emma', isNew: true },
          { label: 'Alex\'s Bold Designs', href: '/creators/alex' },
          { label: 'Jordan\'s Vintage Revival', href: '/creators/jordan' },
          { label: 'Taylor\'s Modern Romance', href: '/creators/taylor' }
        ]
      },
      {
        title: 'Join as Creator',
        items: [
          { label: 'Creator Application', href: '/creators/apply' },
          { label: 'Commission Structure', href: '/creators/commissions' },
          { label: 'Creator Resources', href: '/creators/resources' },
          { label: 'Success Stories', href: '/creators/stories' }
        ]
      }
    ]
  }
];

// Material Options
const materialOptions: MaterialOption[] = [
  { id: 'rose-gold', name: '18K Rose Gold', color: '#E8B4A0', price: 0 },
  { id: 'white-gold', name: '18K White Gold', color: '#F5F5DC', price: 150 },
  { id: 'yellow-gold', name: '18K Yellow Gold', color: '#FFD700', price: 100 },
  { id: 'platinum', name: 'Platinum', color: '#E5E4E2', price: 400 }
];

const AuroraNavigation: React.FC<AuroraNavigationProps> = ({ 
  className = '', 
  onMobileMenuToggle 
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('rose-gold');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle menu hover
  const handleMenuHover = (categoryId: string) => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    setActiveMenu(categoryId);
  };

  const handleMenuLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  };

  const handleMegaMenuEnter = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
  };

  const handleMegaMenuLeave = () => {
    setActiveMenu(null);
  };

  // Handle material selection
  const handleMaterialSelect = (materialId: string) => {
    setSelectedMaterial(materialId);
    // Here you would typically dispatch to a global state or context
  };

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
    };
    
    // Listen for route changes (you may need to adjust based on your routing setup)
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  const selectedMaterialOption = materialOptions.find(m => m.id === selectedMaterial);

  return (
    <nav className={`aurora-navigation ${className}`}>
      <div className="aurora-navigation-content">
        {/* Brand Section */}
        <div className="aurora-brand">
          <Link href="/" className="aurora-brand-logo">
            GlowGlitch
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <ul className="aurora-nav-links">
          {navigationCategories.map((category) => (
            <li key={category.id} className="aurora-nav-item">
              {category.href ? (
                <Link 
                  href={category.href}
                  className="aurora-nav-link"
                  onMouseEnter={() => handleMenuHover(category.id)}
                  onMouseLeave={handleMenuLeave}
                >
                  {category.label}
                  <ChevronDownIcon size={16} />
                </Link>
              ) : (
                <button
                  className="aurora-nav-link"
                  onMouseEnter={() => handleMenuHover(category.id)}
                  onMouseLeave={handleMenuLeave}
                >
                  {category.label}
                  <ChevronDownIcon size={16} />
                </button>
              )}
              
              {/* Mega Menu */}
              {activeMenu === category.id && (
                <div 
                  className="aurora-mega-menu open"
                  onMouseEnter={handleMegaMenuEnter}
                  onMouseLeave={handleMegaMenuLeave}
                >
                  <div className="aurora-mega-menu-grid">
                    {category.sections.map((section, index) => (
                      <div key={index} className="aurora-mega-menu-column">
                        <h3 className="aurora-mega-menu-header">{section.title}</h3>
                        {section.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="aurora-mega-menu-subcategory"
                          >
                            {item.label}
                            {item.isNew && <span className="aurora-new-badge">New</span>}
                            {item.count && <span className="aurora-count">({item.count})</span>}
                          </Link>
                        ))}
                      </div>
                    ))}
                    
                    {/* Material Selector in Mega Menu */}
                    {category.id === 'customize' && (
                      <div className="aurora-mega-menu-column">
                        <h3 className="aurora-mega-menu-header">Quick Material Select</h3>
                        <div className="aurora-material-selector">
                          {materialOptions.map((material) => (
                            <button
                              key={material.id}
                              className={`aurora-material-swatch ${selectedMaterial === material.id ? 'active' : ''}`}
                              style={{ backgroundColor: material.color }}
                              onClick={() => handleMaterialSelect(material.id)}
                              title={`${material.name} ${material.price > 0 ? `+$${material.price}` : ''}`}
                              aria-label={`Select ${material.name}`}
                            />
                          ))}
                        </div>
                        <p className="aurora-material-info">
                          Selected: {selectedMaterialOption?.name}
                          {selectedMaterialOption?.price > 0 && (
                            <span> (+${selectedMaterialOption.price})</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Action Buttons */}
        <div className="aurora-nav-actions">
          <button className="aurora-action-button secondary" aria-label="Search">
            <SearchIcon size={20} />
          </button>
          
          <Link href="/wishlist" className="aurora-action-button secondary" aria-label="Wishlist">
            <HeartIcon size={20} />
          </Link>
          
          <Link href="/cart" className="aurora-action-button" aria-label="Shopping Cart">
            <ShoppingBagIcon size={20} />
            Cart
          </Link>
          
          <Link href="/customizer" className="aurora-action-button mobile-visible">
            Create Custom
          </Link>
          
          {/* Mobile Menu Trigger */}
          <button 
            className="aurora-mobile-trigger"
            onClick={onMobileMenuToggle}
            aria-label="Toggle mobile menu"
          >
            <MenuIcon size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AuroraNavigation;