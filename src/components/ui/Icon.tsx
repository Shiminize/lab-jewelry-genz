import React from 'react'
import { clsx } from 'clsx'
import * as AtlasIcons from '@vectoricons/atlas-icons-react'

// Type for all available Atlas Icons
type AtlasIconName = keyof typeof AtlasIcons

// Common icon mappings for easy migration from Lucide React
const ICON_MAPPINGS: Record<string, AtlasIconName> = {
  // Navigation icons
  'search': 'SearchMessage',
  'shopping-cart': 'ShoppingCart',
  'user': 'User',
  'menu': 'MenuSquare',
  'x': 'XmarkCircle',
  'close': 'XmarkCircle',
  
  // Product icons
  'heart': 'Heart',
  'star': 'Star',
  'arrow-left': 'ArrowLeft',
  'arrow-right': 'ArrowRight',
  'arrow-down': 'ArrowDown',
  'arrow-up': 'ArrowUpCircle',
  'chevron-down': 'ArrowDownLine',
  'chevron-up': 'ArrowUpLine',
  'chevron-left': 'ArrowLeft',
  'chevron-right': 'ArrowRight',
  
  // E-commerce icons
  'shopping-bag': 'ShoppingBag',
  'credit-card': 'CreditCard',
  'gift': 'GiftBox',
  'truck': 'DeliveryTruck',
  'package': 'Package',
  
  // UI icons
  'check': 'CheckCircle',
  'check-circle': 'CheckCircle',
  'alert-circle': 'ExclamationTriangle',
  'info': 'ClipboardInfo',
  'eye': 'Eye',
  'eye-off': 'EyeMinus',
  'edit': 'PencilEdit',
  'trash': 'Trash',
  'plus': 'Plus',
  'minus': 'BellMinus',
  'filter': 'Filter',
  'settings': 'CogwheelSettingsAccount',
  'home': 'Home',
  
  // Social icons
  'share': 'Share',
  'download': 'DownloadArrowDown',
  'upload': 'UploadArrowTray',
  'mail': 'Envelope',
  'phone': 'Phone',
  'calendar': 'Calendar',
  'clock': 'Clock',
  
  // Jewelry specific
  'sparkles': 'MagicWandSparkles',
  'gem': 'DiamondRing',
  'ring': 'DiamondRing'
}

export interface IconProps {
  /** Icon name - can be Atlas icon name or common mapping */
  name: string | AtlasIconName
  /** Icon size in pixels */
  size?: number
  /** Icon color - supports CSS color values or CSS variables */
  color?: string
  /** Additional CSS classes */
  className?: string
  /** Accessibility label */
  'aria-label'?: string
  /** Click handler */
  onClick?: () => void
}

/**
 * Universal Icon component supporting Atlas Icons
 * 
 * Provides easy migration from Lucide React with common icon mappings
 * Supports all Atlas Icons with full customization
 * 
 * @example
 * // Using common mappings
 * <Icon name="search" size={24} />
 * <Icon name="shopping-cart" color="var(--aurora-pink)" />
 * 
 * // Using Atlas icon names directly
 * <Icon name="SearchMessage" size={20} />
 * <Icon name="ShoppingCartAdd" className="text-aurora-pink" />
 */
export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 20, 
  color,
  className,
  'aria-label': ariaLabel,
  onClick
}) => {
  // Resolve icon name through mappings or use direct Atlas name
  const resolvedIconName = (ICON_MAPPINGS[name] || name) as AtlasIconName
  
  // Get the Atlas icon component
  const AtlasIconComponent = AtlasIcons[resolvedIconName]
  
  if (!AtlasIconComponent) {
    console.warn(`Icon "${name}" not found in Atlas Icons. Available icons: ${Object.keys(AtlasIcons).length} total`)
    return null
  }

  const iconProps = {
    size,
    ...(color && { color }),
    className: clsx(
      'inline-block',
      onClick && 'cursor-pointer',
      className
    ),
    'aria-label': ariaLabel || `${name} icon`,
    ...(onClick && { 
      onClick,
      role: 'button',
      tabIndex: 0,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }
    })
  }

  return <AtlasIconComponent {...iconProps} />
}

// Export common icon presets for easy usage
export const SearchIcon = (props: Omit<IconProps, 'name'>) => <Icon name="search" {...props} />
export const CartIcon = (props: Omit<IconProps, 'name'>) => <Icon name="shopping-cart" {...props} />
export const UserIcon = (props: Omit<IconProps, 'name'>) => <Icon name="user" {...props} />
export const HeartIcon = (props: Omit<IconProps, 'name'>) => <Icon name="heart" {...props} />
export const MenuIcon = (props: Omit<IconProps, 'name'>) => <Icon name="menu" {...props} />
export const CloseIcon = (props: Omit<IconProps, 'name'>) => <Icon name="close" {...props} />

// Export available icon mappings for reference
export { ICON_MAPPINGS }

// Export Atlas Icons for advanced usage
export { AtlasIcons }
export type { AtlasIconName }

export default Icon