### CTA Color Policy (Aurora, CLAUDE_RULES compliant)

- **Marketing CTAs (hero, promotional, landing banners):** use Pink→Crimson gradient.
  - Utility: `.btn-cta-marketing`
  - Background: `linear-gradient(135deg, var(--aurora-pink, #FF6B9D), var(--aurora-crimson, #C44569))`
  - Text: `#FFFFFF`

- **Product UI CTAs (in-product actions, configurator, add-to-cart):** use brand purple.
  - Utility: `.btn-cta-product`
  - Background: `var(--nebula-purple, #6B46C1)`
  - Text: `#FFFFFF`

- **Plum usage rule:** `--aurora-plum (#723C70)` is for accents only (gradients, chips, subtle rules). Do not use as primary CTA background.

- **Accessibility:** maintain AA contrast; both utilities default to white text.

- **Examples:**
```jsx
<button className="btn-cta-marketing rounded-token-lg px-6 py-3 shadow-near">Start Your Journey</button>
<button className="btn-cta-product rounded-token-lg px-6 py-3 shadow-near">Add to Cart</button>
```

- **Notes:**
  - Use existing spacing/radius tokens for shape.
  - Keep hover to brightness only; avoid color shifts that break brand mapping.
