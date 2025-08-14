# 3D Image Sequences Directory

This directory contains pre-rendered 360° image sequences for the CSS 3D viewer.

## Structure

```
3d-sequences/
├── solitaire-platinum/     # Classic Solitaire in Platinum
│   ├── 0.webp             # 0° angle
│   ├── 1.webp             # 10° angle
│   ├── 2.webp             # 20° angle
│   ├── ...
│   └── 35.webp            # 350° angle
├── solitaire-yellow-gold/  # Classic Solitaire in Yellow Gold
│   ├── 0.webp
│   └── ...
└── halo-rose-gold/         # Halo Setting in Rose Gold
    ├── 0.webp
    └── ...
```

## Image Specifications

- **Format**: WebP (for optimal compression)
- **Size**: 600x600px (square aspect ratio)
- **Count**: 36 images per sequence (10° increments)
- **Background**: Transparent
- **Quality**: 85% WebP quality

## Generation Methods

### Option 1: Automated from GLB Models
Use the generation script:
```bash
node scripts/generate-3d-sequences.js
```

### Option 2: Manual Upload
1. Create directory for each variant
2. Upload 36 images named 0.webp through 35.webp
3. Each image represents a 10° rotation increment

### Option 3: 3D Rendering Services
- **Sketchfab**: Export 360° turntable
- **Blender**: Automated batch rendering
- **Three.js**: Headless rendering with Puppeteer

## Testing Without Images

The CSS 3D viewer includes graceful error handling:
- Shows loading state while images load
- Displays error message if images fail
- Provides retry mechanism
- Maintains accessibility throughout

## Performance Notes

- Images are lazy-loaded on interaction
- Total sequence size: ~540KB (36 × 15KB average)
- Preloading all 36 images takes ~1-2 seconds on 3G
- Significantly faster than real-time 3D rendering