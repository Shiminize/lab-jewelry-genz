# Evergreen Spacing System

The homepage now follows a reference rhythm derived from shiharalab.com. Reusable tokens have been introduced so interior sections can share a consistent cadence:

| Token | CSS variable | Typical use |
| --- | --- | --- |
| Compact | `--section-space-compact` | Standard band spacing (≈48–96px) |
| Relaxed | `--section-space-relaxed` | Feature or hero adjacency (≈64–96px) |
| Hero | `--section-space-hero` | Primary hero padding (≈88–120px) |
| Inner | `--section-space-inner` | Local content padding (0–24px) |

Utilities are exposed in `globals.css`:

- `section-spacing-none`
- `section-spacing-compact`
- `section-spacing-relaxed`

`Section` now maps its `spacing` prop to these utilities. Existing usage:

```tsx
<Section spacing="compact">…</Section>
<Section spacing="relaxed">…</Section>
<Section spacing="none">…</Section>
```

Use `SectionContainer` for horizontal rhythm; avoid reintroducing `py-*` or custom `padding-block` in leaf components. When additional intra-section breathing room is needed, lean on `var(--section-space-inner)` instead of hard-coded pixel values.
