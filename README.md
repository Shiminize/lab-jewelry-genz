# GlowGlitch 3D Jewelry Customizer (lab-jewelry-genz)

A complete React/Next.js component library for GlowGlitch's luxury lab-grown diamond jewelry customization experience.

## 🌟 Features

- **Responsive 3D Container**: Ready for Three.js integration with mobile-first design
- **Material Selector**: Choose between recycled gold, lab-grown platinum, and ethical silver
- **Stone Quality Picker**: Premium, Signature, and Classic grades with detailed tooltips
- **Ring Size Selector**: Sizes 5-12 with interactive size guide
- **Engraving Input**: Personal messages with font selection and preview
- **Real-time Price Calculator**: Dynamic pricing with animations and savings display
- **Action Buttons**: Add to cart, save design, and share functionality
- **Mobile Touch Controls**: Gesture instructions and touch-optimized interface
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA labels

## 🎨 Design System

Built using GlowGlitch's luxury design system:

- **Fonts**: Fraunces (headlines) + Inter (body)
- **Colors**: Soft luxury palette (ivory mist, graphite green, coral gold, champagne gold)
- **Mobile-first**: Optimized for 60% mobile users
- **Typography**: Responsive scaling with proper line heights

## 📱 Mobile Features

- **Touch Controls**: Pinch to zoom, swipe to rotate
- **Gesture Instructions**: Contextual help overlays
- **Step-by-step Flow**: Guided customization process
- **AR View Button**: Ready for AR integration
- **44px Touch Targets**: Accessibility-compliant button sizes

## 🚀 Getting Started

### Installation

```bash
npm install
# or
yarn install
```

### Development

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the customizer in action.

## 📂 Component Structure

```
src/components/
├── customizer/
│   ├── JewelryCustomizer.tsx      # Main orchestrator component
│   ├── CustomizerContainer.tsx    # 3D viewer container
│   ├── MaterialSelector.tsx       # Material selection UI
│   ├── StoneQualityPicker.tsx     # Stone quality with tooltips
│   ├── SizeSelector.tsx           # Ring size selection
│   ├── EngravingInput.tsx         # Personalization input
│   ├── PriceCalculator.tsx        # Real-time pricing
│   ├── ActionButtons.tsx          # CTA buttons
│   ├── MobileTouchControls.tsx    # Touch interface
│   └── index.ts                   # Barrel exports
├── ui/
│   ├── Button.tsx                 # Button component
│   ├── Input.tsx                  # Input/Textarea components
│   ├── Tooltip.tsx                # Tooltip component
│   └── index.ts
└── foundation/
    ├── Typography.tsx             # Typography system
    └── index.ts
```

## 🎯 Usage Example

```tsx
import { JewelryCustomizer } from '@/components/customizer'

const product = {
  _id: 'eternal-solitaire-ring',
  name: 'Eternal Solitaire Ring',
  basePrice: 2400,
  originalPrice: 2800,
  category: 'rings',
  images: {
    primary: '/images/ring.jpg',
    gallery: ['/images/ring-2.jpg']
  }
}

function CustomizePage() {
  return (
    <JewelryCustomizer
      product={product}
      onAddToCart={async (customization) => {
        // Handle add to cart
        await addToCartAPI(customization)
      }}
      onSaveDesign={async (customization) => {
        // Handle save design
        await saveDesignAPI(customization)
      }}
      onShareDesign={(customization) => {
        // Handle share design
        shareDesign(customization)
      }}
    />
  )
}
```

## 🔧 Three.js Integration

The `CustomizerContainer` component is ready for Three.js integration:

```tsx
// Replace the placeholder in CustomizerContainer.tsx
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'

// Add to the viewer area:
<Canvas>
  <ambientLight intensity={0.5} />
  <pointLight position={[10, 10, 10]} />
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color={'gold'} />
  </mesh>
</Canvas>
```

## 🎨 Customization

### Design Tokens

All colors, fonts, and spacing use Tailwind CSS custom properties defined in `tailwind.config.js`:

```js
colors: {
  background: '#FEFCF9',    // Ivory mist
  foreground: '#2D3A32',    // Graphite green
  accent: '#D4AF37',        // Champagne gold
  cta: '#C17B47',          // Coral gold
  muted: '#E8D7D3',        // Rose beige
}
```

### Content Strategy

All microcopy follows the content strategy in `content_strategy.txt`:

- Warm, knowledgeable, inclusive tone
- Mobile-optimized character counts
- Educational tooltips and help text
- Emotional engagement messaging

## ♿ Accessibility

- **WCAG 2.1 AA compliant**: 4.5:1 contrast ratios
- **Keyboard navigation**: Full keyboard support
- **Screen reader support**: Proper ARIA labels and descriptions
- **Focus management**: Visible focus indicators
- **Color contrast**: Tested color combinations
- **Touch targets**: Minimum 44px for mobile

## 📱 Mobile Optimizations

- **Touch controls**: Native mobile gestures
- **Progressive disclosure**: Step-by-step flow
- **Performance**: Optimized for mobile devices
- **Gesture hints**: Contextual help overlays
- **Responsive typography**: Fluid scaling
- **Touch-friendly**: Large, accessible buttons

## 🧪 Testing

Components include comprehensive test patterns:

```bash
npm test
# or
yarn test
```

Test files follow the pattern in `Docs/COMPONENT_GUIDELINES.md`:
- Unit tests for component rendering
- Interaction tests for user events
- Accessibility tests for WCAG compliance
- Integration tests for API interactions

## 📦 Production Build

```bash
npm run build
# or
yarn build
```

## 🚀 Deployment

The application is ready for deployment on Vercel, Netlify, or any static hosting platform.

## 🤝 Contributing

Follow the component patterns in `Docs/COMPONENT_GUIDELINES.md`:

1. Use TypeScript for all components
2. Follow the design system tokens
3. Include accessibility features
4. Write comprehensive tests
5. Add proper documentation

## 📄 License

Built for GlowGlitch (Lumina Lab) - Luxury Lab-Grown Diamond Jewelry Platform

---

**Ready to integrate with your existing backend API and Three.js 3D viewer!**
