import { buttonToneClassNames, type ButtonTone } from '@/components/ui'

export type CategoryToneName = Exclude<ButtonTone, 'neutral' | 'none'> | 'holo'

export type CategoryToneTokens = {
  tone: CategoryToneName
  gradientClass: string
  shadowClass: string
  priceClass: string
  buttonClass: string
}

const CATEGORY_TOKEN_MAP: Record<string, CategoryToneTokens> = {
  RINGS: {
    tone: 'volt',
    gradientClass: 'bg-gradient-volt',
    shadowClass: 'shadow-neon-volt',
    priceClass: 'text-volt-glow',
    buttonClass: buttonToneClassNames.volt,
  },
  NECKLACES: {
    tone: 'cyber',
    gradientClass: 'bg-gradient-cyber',
    shadowClass: 'shadow-neon-cyber',
    priceClass: 'text-cyber-pink',
    buttonClass: buttonToneClassNames.cyber,
  },
  EARRINGS: {
    tone: 'digital',
    gradientClass: 'bg-gradient-digital',
    shadowClass: 'shadow-neon-digital',
    priceClass: 'text-digital-blue',
    buttonClass: buttonToneClassNames.digital,
  },
  BRACELETS: {
    tone: 'acid',
    gradientClass: 'bg-gradient-acid',
    shadowClass: 'shadow-neon-acid',
    priceClass: 'text-acid-yellow',
    buttonClass: buttonToneClassNames.acid,
  },
  ACCESSORIES: {
    tone: 'cyber',
    gradientClass: 'bg-gradient-cyber',
    shadowClass: 'shadow-neon-cyber',
    priceClass: 'text-cyber-pink',
    buttonClass: buttonToneClassNames.cyber,
  },
  'NEW DROPS': {
    tone: 'acid',
    gradientClass: 'bg-gradient-acid',
    shadowClass: 'shadow-neon-acid',
    priceClass: 'text-acid-yellow',
    buttonClass: buttonToneClassNames.acid,
  },
  EXCLUSIVE: {
    tone: 'holo',
    gradientClass: 'bg-gradient-holo',
    shadowClass: 'shadow-neon-holo',
    priceClass: 'text-holo-purple',
    buttonClass: buttonToneClassNames.holo,
  },
  DEFAULT: {
    tone: 'digital',
    gradientClass: 'bg-gradient-digital',
    shadowClass: 'shadow-neon-digital',
    priceClass: 'text-digital-blue',
    buttonClass: buttonToneClassNames.digital,
  },
} as const

const CATEGORY_SYNONYMS: Record<string, keyof typeof CATEGORY_TOKEN_MAP> = {
  RING: 'RINGS',
  'RING SET': 'RINGS',
  RINGSET: 'RINGS',
  RINGSETS: 'RINGS',
  NECKLACE: 'NECKLACES',
  EARRING: 'EARRINGS',
  STUD: 'EARRINGS',
  STUDS: 'EARRINGS',
  BRACELET: 'BRACELETS',
  CUFF: 'BRACELETS',
  CUFFS: 'BRACELETS',
  ACCESSORY: 'ACCESSORIES',
  ACCESSORIES: 'ACCESSORIES',
  'NEW DROP': 'NEW DROPS',
  'NEW ARRIVAL': 'NEW DROPS',
  'NEW ARRIVALS': 'NEW DROPS',
  'LIMITED DROP': 'EXCLUSIVE',
  LIMITED: 'EXCLUSIVE',
  'LIMITED EDITION': 'EXCLUSIVE',
  'SPECIAL RELEASE': 'EXCLUSIVE',
}

export function normalizeCategoryInput(value?: string | null) {
  if (!value) return undefined
  const normalized = value.trim().replace(/\s+/g, ' ').toUpperCase()
  return normalized.length ? normalized : undefined
}

function resolveCategoryKey(value?: string | null) {
  const normalized = normalizeCategoryInput(value)
  if (!normalized) return undefined
  if (normalized in CATEGORY_TOKEN_MAP) {
    return normalized as keyof typeof CATEGORY_TOKEN_MAP
  }

  if (normalized in CATEGORY_SYNONYMS) {
    return CATEGORY_SYNONYMS[normalized]
  }

  return undefined
}

export function getCategoryTone(value?: string | null) {
  const key = resolveCategoryKey(value)
  const tokens = (key ? CATEGORY_TOKEN_MAP[key] : undefined) ?? CATEGORY_TOKEN_MAP.DEFAULT

  return {
    category: key ?? 'DEFAULT',
    ...tokens,
  }
}

export function getButtonToneFromCategory(value?: string | null): ButtonTone {
  const { tone } = getCategoryTone(value)
  return tone in buttonToneClassNames ? (tone as ButtonTone) : 'neutral'
}

export const CATEGORY_TOKEN_SEQUENCE = Object.keys(CATEGORY_TOKEN_MAP).filter((key) => key !== 'DEFAULT') as Array<
  Exclude<keyof typeof CATEGORY_TOKEN_MAP, 'DEFAULT'>
>
