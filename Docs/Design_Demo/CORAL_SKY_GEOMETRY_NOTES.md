# Coral & Sky Geometry Notes

The Option 4 “Coral & Sky” direction now ships with a deliberately geometric profile. All shared `--radius-*` tokens are set to `0px`, so any class that uses `rounded-token-*` renders with square corners by default.

| Token | Value | Used By |
| --- | --- | --- |
| `--radius-micro` | `0px` | `rounded-token-xs`, icon badges
| `--radius-small` | `0px` | `rounded-token-sm`
| `--radius-medium` | `0px` | `rounded-token-md` (Button default)
| `--radius-large` | `0px` | `rounded-token-lg`
| `--radius-2xl` | `0px` | `rounded-token-2xl`
| `--radius-3xl` | `0px` | `rounded-token-3xl`
| `--radius-pill` | `0px` | `rounded-token-pill`

### Guidelines
- Always rely on the tokenized utilities (`rounded-token-md`, `surface-panel`, `surface-chip`). Do not reintroduce hand-written `rounded-[...]` classes.
- When introducing new components, default to square corners. If a future brief calls for rounded variants, update the tokens rather than hard-coding radii.
- Product cards, filters, chips, and CTAs all consume these tokens today, so geometry will remain consistent across the app.

_Last updated: 2025-10-06._
