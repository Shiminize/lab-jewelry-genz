// ProductCard variant styles with Aurora Design System compliance
// Extracted from ProductCard.tsx to maintain CLAUDE_RULES (<350 lines)

export const variantStyles = {
  standard: {
    container: 'group cursor-pointer aurora-living-component aurora-card transform-gpu perspective-1000 hover:scale-105 transition-all duration-700 shadow-[0_16px_48px_color-mix(in_srgb,var(--nebula-purple)_12%,transparent)]',
    imageContainer: 'aspect-square mb-token-md relative overflow-hidden bg-gradient-to-br from-background to-muted rounded-token-md transform-gpu group-hover:rotateX-2 group-hover:rotateY-2 transition-all duration-700',
    image: 'w-full h-full object-cover transition-all duration-700 group-hover:scale-115 group-hover:rotate-2 group-hover:brightness-110 group-hover:saturate-110',
    content: 'space-y-token-sm transform-gpu group-hover:translateZ-4 transition-all duration-500',
    actions: 'absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-end justify-center pb-token-md space-x-token-sm backdrop-blur-sm',
  },
  featured: {
    container: 'group cursor-pointer aurora-living-component aurora-card border-2 border-foreground/30 rounded-token-lg p-token-xl bg-gradient-to-br from-background via-background to-background hover:border-accent/50 transition-all duration-700 aurora-pulse transform-gpu hover:scale-110 hover:rotateY-3 shadow-far',
    imageContainer: 'aspect-square mb-token-xl relative overflow-hidden bg-gradient-to-br from-background to-muted rounded-token-md transform-gpu group-hover:rotateX-3 group-hover:rotateY-1 transition-all duration-700',
    image: 'w-full h-full object-cover transition-all duration-700 group-hover:scale-120 group-hover:rotate-3 group-hover:brightness-115 group-hover:saturate-125',
    content: 'space-y-token-md transform-gpu group-hover:translateZ-6 transition-all duration-500',
    actions: 'absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-end justify-center pb-token-xl space-x-token-md backdrop-blur-md',
  },
  compact: {
    container: 'group cursor-pointer flex space-x-token-md aurora-interactive-shadow rounded-token-md p-token-sm hover:bg-background/50 transition-all duration-400 transform-gpu hover:scale-102 shadow-hover',
    imageContainer: 'w-token-2xl h-token-2xl relative overflow-hidden rounded-token-sm bg-gradient-to-br from-background to-muted flex-shrink-0 transform-gpu group-hover:rotateY-1 transition-all duration-400',
    image: 'w-full h-full object-cover transition-all duration-400 group-hover:scale-115 group-hover:brightness-105',
    content: 'flex-1 min-w-0 space-y-1 transform-gpu group-hover:translateX-1 transition-all duration-300',
    actions: 'hidden', // No hover actions for compact variant
  },
}