# GLB / HDR Refresh Checklist

Use this guide whenever new customizer models or lighting assets land. It keeps the Neon rebuild in sync across local environments, CI, and production.

## 1. Drop Assets
- Place processed GLB files in `public/models/neon/` (compressed via `scripts/glb-pack.js`).
- Place HDR environments under `public/hdr/`.
- Posters auto-generate via `npm run glb:capture-posters`; keep any hand-crafted assets under `public/images/products/<slug>/` if you need manual art direction.

## 2. Update Manifest
- Edit `public/models/neon/manifest.json` and set:
  - `src` → relative path to the compressed GLB (e.g. `/models/neon/ring-luxury-001.glb`).
  - `poster` → matching poster path; use `null` temporarily if not ready.
  - `environmentImage` → HDR path (e.g. `/hdr/studio_small_09_1k.hdr`).
  - Optional tuning: `exposure`, `autoRotate`, `cameraControls`, `ar` flags per variant.
  - Optional metadata: `tagline`, `description`, `highlights`, `tone`, `defaultMaterialId`, `defaultSize` feed the `/customizer` UI.
  - Poster overrides: add a `posterCapture` object for per-model settings (e.g. `cameraOrbit`, `background`, `outputDir`, `format`).

## 3. Validate Locally
```bash
npm run glb:validate
npm run validate:customizer-assets
npm run rebuild:health
```
- `glb:validate` enforces the 5 MB cap (4 MB warning) and reports size regressions.
- `validate:customizer-assets` confirms posters/HDRs exist and are fresher than 90 days.
- The guardrail suite re-runs Playwright smoke tests to ensure `/customizer`, `/catalog`, and `/cart` still behave.

## 4. Commit & Share
- Include the updated GLBs/posters/HDRs and manifest changes in the PR.
- Note any new CDN/public paths in the PR description so hosting/CDN config can be updated.
- If assets are stored externally, ensure `next.config.js` includes the domain under `images.remotePatterns`.

## 5. Production Cutover
- Deploy the new assets and manifest together.
- Re-run `npm run glb:validate` and `npm run validate:customizer-assets` in CI (already part of `npm run rebuild:health`).
- Verify `/customizer` in production to confirm the new models stream correctly on desktop + mobile.

Following this checklist keeps the 3D pipeline and downstream smoke tests stable during the rebuild.
