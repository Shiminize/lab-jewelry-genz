'use client';

import React, { useState } from 'react';
import AuroraNavigation from './AuroraNavigation';
import AuroraMobileNav from './AuroraMobileNav';
import './aurora-navigation.css';

interface AuroraNavigationContainerProps {
  className?: string;
}

/**
 * Aurora Navigation Container - Complete Navigation System
 * 
 * Features:
 * - Pure Aurora Design System compliance
 * - Luxury jewelry-focused UX
 * - Desktop mega menu with 4-column layout
 * - Mobile bottom sheet navigation
 * - Visual material selector
 * - Creator collections integration
 * - Trust signals and certifications
 * - Performance optimized (<300ms interactions)
 * - WCAG 2.1 AA accessible
 */
const AuroraNavigationContainer: React.FC<AuroraNavigationContainerProps> = ({ 
  className = '' 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <AuroraNavigation 
        className={className}
        onMobileMenuToggle={handleMobileMenuToggle}
      />
      
      {/* Mobile Navigation */}
      <AuroraMobileNav
        isOpen={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
      />
    </>
  );
};

export default AuroraNavigationContainer;