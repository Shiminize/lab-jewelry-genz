
# Aurora Design System – Claude Code Component Specification

## 1. Color Tokens (Exact Hex Values)

| Token               | Hex      | Usage                                 |
|----------------------|----------|----------------------------------------|
| `--deep-space`      | `#0A0E27`| Page background, hero base            |
| `--nebula-purple`   | `#6B46C1`| Primary brand, buttons, active states |
| `--aurora-pink`     | `#FF6B9D`| Accent, highlights                    |
| `--aurora-crimson`  | `#C44569`| Accent, call-to-action borders        |
| `--aurora-plum`     | `#723C70`| Secondary gradient color              |
| `--lunar-grey`      | `#F7F7F9`| Light backgrounds, cards              |
| `--emerald-flash`   | `#10B981`| Success                                |
| `--amber-glow`      | `#F59E0B`| Warnings                              |

**Gradient Rule:** `linear-gradient(135deg, var(--deep-space), var(--nebula-purple))`  
**Shadows must always use `color-mix` with their nearest color token.**

---

## 2. Typography (Locked Scale)

**Font:** `Celestial Sans` (variable)

- Hero: `clamp(3rem, 8vw, 6rem)`
- Statement: `clamp(2.5rem, 6vw, 4rem)`
- Title XL: `clamp(2rem, 4vw, 3rem)`
- Title L: `clamp(1.5rem, 3vw, 2.25rem)`
- Title M: `clamp(1.25rem, 2.5vw, 1.75rem)`
- Body XL: `clamp(1.125rem, 2vw, 1.5rem)`
- Body L: `1.125rem`
- Body M: `1rem`
- Small: `0.875rem`
- Micro: `0.75rem`

**LLM Rule:**  
- Never invent intermediate font sizes.  
- Only use these tokens for font sizing.  

---

## 3. Shadows (Explicit)

```css
.shadow-near   { box-shadow: 0 2px 8px color-mix(in srgb, var(--nebula-purple) 20%, transparent); }
.shadow-float  { box-shadow: 0 8px 24px color-mix(in srgb, var(--nebula-purple) 15%, transparent); }
.shadow-hover  { box-shadow: 0 16px 48px color-mix(in srgb, var(--nebula-purple) 12%, transparent); }
.shadow-modal  { box-shadow: 0 24px 64px color-mix(in srgb, var(--nebula-purple) 10%, transparent); }
```

- For **gold products**: replace `--nebula-purple` with `#FFD700`  
- For **diamond products**: replace `--nebula-purple` with `#B9F2FF`

---

## 4. Border Radius

- Micro: `3px`  
- Small: `5px`  
- Medium: `8px`  
- Large: `13px`  
- XL: `21px`  
- XXL: `34px`  

LLM must only pick from these radii.

---

## 5. Core Components

### 5.1 Hero Section
- **Title:** Hero size, gradient text (`aurora-pink → aurora-plum`)
- **Subtitle:** Body XL, opacity `0.9`
- **Padding:** `4rem 0`
- **Background:** Radial gradient with transparency fade.

### 5.2 Feature Card
```css
.feature-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 13px;
  padding: 2rem;
  box-shadow: var(--shadow-float);
  transition: all 0.3s ease;
}
.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-hover);
  background: rgba(255, 255, 255, 0.08);
}
```
- **Header:** Title M, color: `--aurora-pink`
- **List items:** Body M, left icon `✨`

### 5.3 Button (Primary)
```css
.button-primary {
  background: linear-gradient(135deg, var(--nebula-purple), var(--aurora-crimson));
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: var(--shadow-near);
  transition: all 0.3s ease;
}
.button-primary:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-hover);
}
.button-primary:active {
  transform: scale(0.95);
}
```

### 5.4 Product Card
- **Base:** Floating shadow  
- **Interactive:** AR preview on hover  
- **Material-specific shadows**

### 5.5 Stats Card
```css
.stat-card {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid var(--emerald-flash);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}
.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--emerald-flash);
}
```

---

## 6. Interactive States

- Hover: `+15%` brightness, `0.3s ease`
- Active: Ripple effect from click center
- Success: `.state-success.activated { background: var(--emerald-flash); color: white; }`
- Warning: `.state-warning.activated { background: var(--amber-glow); animation: warning-pulse 1s infinite; }`

---

## 7. Mobile Rules
- Under `768px`:
  - **Grids collapse to 1 column**
  - **Padding reduced to `1rem`**
  - **Hero font shrinks proportionally (clamp rules)**

---

## 8. Do / Don’t for LLMs
- **Do:** Use only defined tokens, variables, and components.  
- **Don’t:**  
  - Invent new colors, gradients, or radii.  
  - Alter shadow opacities without token reference.  
  - Replace typography with arbitrary values.  

---

## 9. LLM Implementation Prompts

### Example Prompt for Buttons
> "Implement a primary button following Aurora Design System. Use `.button-primary` class exactly as defined. Do not modify colors, radius, or shadows."

### Example Prompt for Feature Cards
> "Create a feature card using `.feature-card`. Include a Title M header and a Body M list with ✨ icons. Apply hover shadow exactly as specified."

### Example Prompt for Typography
> "Use `clamp()` values from the typography table. Do not create custom font sizes outside the defined scale."

### Example Prompt for Mobile Responsiveness
> "Ensure all grids collapse to 1 column below `768px`. Retain padding `1rem` and scale fonts using defined clamp values."

---

**End of Specification**
