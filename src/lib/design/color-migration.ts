/**
 * Color Migration Utility
 * Maps hardcoded Tailwind colors to Aurora Design System tokens
 */

export const COLOR_MIGRATIONS = {
  // Status Colors -> Aurora Equivalent
  'text-red-600': 'text-red-600',        // Keep semantic reds for errors
  'text-red-700': 'text-red-700',        // Keep semantic reds for errors
  'text-red-800': 'text-red-800',        // Keep semantic reds for errors
  'text-green-600': 'text-aurora-emerald-flash', // Success -> Aurora emerald
  'text-green-700': 'text-aurora-emerald-flash', // Success -> Aurora emerald  
  'text-green-800': 'text-aurora-emerald-flash', // Success -> Aurora emerald
  'text-blue-600': 'text-aurora-nebula-purple',  // Info -> Aurora nebula purple
  'text-blue-700': 'text-aurora-nebula-purple',  // Info -> Aurora nebula purple
  'text-purple-600': 'text-aurora-nebula-purple', // Brand -> Aurora nebula purple
  'text-yellow-600': 'text-aurora-amber-glow',   // Warning -> Aurora amber
  'text-amber-600': 'text-aurora-amber-glow',    // Warning -> Aurora amber
  'text-amber-700': 'text-aurora-amber-glow',    // Warning -> Aurora amber
  
  // Background Colors -> Aurora Equivalent
  'bg-red-50': 'bg-red-50',              // Keep semantic backgrounds for errors
  'bg-red-100': 'bg-red-100',            // Keep semantic backgrounds for errors
  'bg-green-100': 'bg-aurora-emerald-flash/10', // Success bg -> Aurora emerald with opacity
  'bg-blue-100': 'bg-aurora-nebula-purple/10',  // Info bg -> Aurora nebula purple with opacity
  'bg-yellow-100': 'bg-aurora-amber-glow/10',   // Warning bg -> Aurora amber with opacity
  'bg-purple-100': 'bg-aurora-nebula-purple/10', // Brand bg -> Aurora nebula purple with opacity
  'bg-yellow-500': 'bg-aurora-amber-glow',      // Direct yellow -> Aurora amber
  'bg-red-500': 'bg-red-500',            // Keep semantic reds for errors
  
  // Border Colors -> Aurora Equivalent
  'border-red-200': 'border-red-200',    // Keep semantic borders for errors
  'border-green-200': 'border-aurora-emerald-flash/20', // Success border -> Aurora emerald with opacity
  'border-blue-200': 'border-aurora-nebula-purple/20',  // Info border -> Aurora nebula purple with opacity
  'border-yellow-200': 'border-aurora-amber-glow/20',   // Warning border -> Aurora amber with opacity
  'border-purple-200': 'border-aurora-nebula-purple/20', // Brand border -> Aurora nebula purple with opacity
} as const;

/**
 * Semantic color mapping for different contexts
 */
export const SEMANTIC_COLORS = {
  success: {
    text: 'text-aurora-emerald-flash',
    background: 'bg-aurora-emerald-flash/10', 
    border: 'border-aurora-emerald-flash/20',
    icon: 'text-aurora-emerald-flash'
  },
  warning: {
    text: 'text-aurora-amber-glow',
    background: 'bg-aurora-amber-glow/10',
    border: 'border-aurora-amber-glow/20', 
    icon: 'text-aurora-amber-glow'
  },
  info: {
    text: 'text-aurora-nebula-purple',
    background: 'bg-aurora-nebula-purple/10',
    border: 'border-aurora-nebula-purple/20',
    icon: 'text-aurora-nebula-purple'
  },
  error: {
    text: 'text-red-600',
    background: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600'
  },
  brand: {
    text: 'text-aurora-nebula-purple',
    background: 'bg-aurora-nebula-purple/10',
    border: 'border-aurora-nebula-purple/20',
    icon: 'text-aurora-nebula-purple'
  }
} as const;

/**
 * Function to migrate a hardcoded color to Aurora equivalent
 */
export function migrateColor(hardcodedColor: string): string {
  return COLOR_MIGRATIONS[hardcodedColor as keyof typeof COLOR_MIGRATIONS] || hardcodedColor;
}

/**
 * Get semantic colors for a specific context
 */
export function getSemanticColors(context: keyof typeof SEMANTIC_COLORS) {
  return SEMANTIC_COLORS[context];
}