'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  XIcon, 
  ChevronRightIcon, 
  SearchIcon, 
  HeartIcon, 
  ShoppingBagIcon,
  UserIcon,
  SparklesIcon,
  DiamondIcon,
  PaletteIcon
} from 'lucide-react';

// Mobile Navigation Types
interface AuroraMobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface MobileNavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: MobileNavigationItem[];
  badge?: string;
  isNew?: boolean;
}

// Mobile Navigation Data - Optimized for Touch
const mobileNavigationItems: MobileNavigationItem[] = [
  {
    id: 'shop',
    label: 'Shop All Jewelry',
    icon: <DiamondIcon size={20} />,
    children: [
      { id: 'rings', label: 'Engagement Rings', href: '/catalog?category=engagement-rings', badge: '45' },
      { id: 'bands', label: 'Wedding Bands', href: '/catalog?category=wedding-bands', badge: '32' },
      { id: 'necklaces', label: 'Necklaces', href: '/catalog?category=necklaces', badge: '28' },
      { id: 'earrings', label: 'Earrings', href: '/catalog?category=earrings', badge: '38' },
      { id: 'bracelets', label: 'Bracelets', href: '/catalog?category=bracelets', badge: '15' }
    ]
  },
  {
    id: 'lab-grown',
    label: 'Lab-Grown Diamonds',
    href: '/lab-grown-diamonds',
    icon: <SparklesIcon size={20} />,
    isNew: true
  },
  {
    id: 'customize',
    label: '3D Customizer',
    href: '/customizer',
    icon: <PaletteIcon size={20} />,
    children: [
      { id: 'ring-designer', label: 'Ring Designer', href: '/customizer?type=ring' },
      { id: 'necklace-builder', label: 'Necklace Builder', href: '/customizer?type=necklace' },
      { id: 'earring-maker', label: 'Earring Maker', href: '/customizer?type=earrings' },
      { id: 'complete-set', label: 'Complete Set', href: '/customizer?type=set' }
    ]
  },
  {
    id: 'creators',
    label: 'Creator Collections',
    href: '/creators',
    icon: <UserIcon size={20} />,
    children: [
      { id: 'featured', label: 'Featured Creators', href: '/creators/featured' },
      { id: 'emma', label: 'Emma\'s Collection', href: '/creators/emma', isNew: true },
      { id: 'alex', label: 'Alex\'s Bold Designs', href: '/creators/alex' },
      { id: 'jordan', label: 'Jordan\'s Vintage', href: '/creators/jordan' },
      { id: 'apply', label: 'Become a Creator', href: '/creators/apply' }
    ]
  },
  {
    id: 'account',
    label: 'My Account',
    icon: <UserIcon size={20} />,
    children: [
      { id: 'profile', label: 'My Profile', href: '/account/profile' },
      { id: 'orders', label: 'My Orders', href: '/account/orders' },
      { id: 'wishlist', label: 'Wishlist', href: '/wishlist' },
      { id: 'addresses', label: 'Addresses', href: '/account/addresses' },
      { id: 'settings', label: 'Settings', href: '/account/settings' }
    ]
  }
];

const AuroraMobileNav: React.FC<AuroraMobileNavProps> = ({ 
  isOpen, 
  onClose, 
  className = '' 
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleLinkClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <React.Fragment>
      {/* Backdrop */}
      <div 
        className="aurora-mobile-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Mobile Navigation Drawer */}
      <div className={`aurora-mobile-nav ${className}`}>
        {/* Header */}
        <div className="aurora-mobile-nav-header">
          <Link 
            href="/" 
            className="aurora-mobile-brand"
            onClick={handleLinkClick}
          >
            GlowGlitch
          </Link>
          <button 
            className="aurora-mobile-close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <XIcon size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="aurora-mobile-search">
          <div className="aurora-mobile-search-input-wrapper">
            <SearchIcon size={18} className="aurora-mobile-search-icon" />
            <input
              type="text"
              placeholder="Search jewelry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="aurora-mobile-search-input"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="aurora-mobile-quick-actions">
          <Link 
            href="/wishlist" 
            className="aurora-mobile-quick-action"
            onClick={handleLinkClick}
          >
            <HeartIcon size={20} />
            <span>Wishlist</span>
          </Link>
          <Link 
            href="/cart" 
            className="aurora-mobile-quick-action"
            onClick={handleLinkClick}
          >
            <ShoppingBagIcon size={20} />
            <span>Cart</span>
          </Link>
          <Link 
            href="/customizer" 
            className="aurora-mobile-quick-action aurora-mobile-cta"
            onClick={handleLinkClick}
          >
            <PaletteIcon size={20} />
            <span>Create Custom</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="aurora-mobile-nav-content">
          <ul className="aurora-mobile-nav-list">
            {mobileNavigationItems.map((item) => (
              <li key={item.id} className="aurora-mobile-nav-item">
                {item.href && !item.children ? (
                  <Link
                    href={item.href}
                    className="aurora-mobile-nav-link"
                    onClick={handleLinkClick}
                  >
                    {item.icon && <span className="aurora-mobile-nav-icon">{item.icon}</span>}
                    <span className="aurora-mobile-nav-text">{item.label}</span>
                    {item.badge && <span className="aurora-mobile-nav-badge">{item.badge}</span>}
                    {item.isNew && <span className="aurora-mobile-nav-new">New</span>}
                  </Link>
                ) : (
                  <>
                    <button
                      className={`aurora-mobile-nav-link ${expandedItems.has(item.id) ? 'expanded' : ''}`}
                      onClick={() => item.children ? toggleExpanded(item.id) : undefined}
                    >
                      {item.icon && <span className="aurora-mobile-nav-icon">{item.icon}</span>}
                      <span className="aurora-mobile-nav-text">{item.label}</span>
                      {item.isNew && <span className="aurora-mobile-nav-new">New</span>}
                      {item.children && (
                        <ChevronRightIcon 
                          size={18} 
                          className={`aurora-mobile-nav-chevron ${expandedItems.has(item.id) ? 'expanded' : ''}`} 
                        />
                      )}
                    </button>
                    
                    {/* Submenu */}
                    {item.children && expandedItems.has(item.id) && (
                      <ul className="aurora-mobile-nav-submenu">
                        {item.href && (
                          <li>
                            <Link
                              href={item.href}
                              className="aurora-mobile-nav-sublink aurora-mobile-nav-all"
                              onClick={handleLinkClick}
                            >
                              View All {item.label}
                            </Link>
                          </li>
                        )}
                        {item.children.map((subItem) => (
                          <li key={subItem.id}>
                            <Link
                              href={subItem.href!}
                              className="aurora-mobile-nav-sublink"
                              onClick={handleLinkClick}
                            >
                              <span>{subItem.label}</span>
                              {subItem.badge && <span className="aurora-mobile-nav-badge">{subItem.badge}</span>}
                              {subItem.isNew && <span className="aurora-mobile-nav-new">New</span>}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>

          {/* Support Links */}
          <div className="aurora-mobile-nav-footer">
            <div className="aurora-mobile-nav-divider" />
            <ul className="aurora-mobile-nav-support">
              <li>
                <Link href="/support" onClick={handleLinkClick}>Help & Support</Link>
              </li>
              <li>
                <Link href="/sizing" onClick={handleLinkClick}>Ring Sizing</Link>
              </li>
              <li>
                <Link href="/care" onClick={handleLinkClick}>Jewelry Care</Link>
              </li>
              <li>
                <Link href="/returns" onClick={handleLinkClick}>Returns & Exchanges</Link>
              </li>
            </ul>
            
            {/* Trust Signals */}
            <div className="aurora-mobile-trust-signals">
              <div className="aurora-mobile-trust-item">
                <SparklesIcon size={16} />
                <span>Certified Lab-Grown</span>
              </div>
              <div className="aurora-mobile-trust-item">
                <DiamondIcon size={16} />
                <span>IGI Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default AuroraMobileNav;