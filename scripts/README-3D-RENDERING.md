# 🎬 Automated GLB → CSS 3D Sequence Generator

This system automatically converts your GLB 3D models into 36-image sequences for the CSS 3D viewer.

## 🚀 Quick Start

### Method 1: Browser-Based Generator (Recommended)

1. **Open the Generator**
   ```bash
   open scripts/3d-renderer.html
   # Or serve it via any web server
   ```

2. **Upload Your GLB Model**
   - Click "Choose File" and select your `.glb` model
   - The model will load and display in the preview

3. **Configure Settings**
   - **Material**: Choose metal type (Platinum, Gold, etc.)
   - **Image Size**: 600x600 recommended for web
   - **Background**: Transparent for CSS 3D viewer

4. **Generate Images**
   - Click "Generate 36 Images"
   - Wait 1-2 minutes for all 36 frames to render
   - Download individual images or ZIP file

5. **Install Images**
   ```bash
   # Create directory for your sequence
   mkdir -p public/images/products/3d-sequences/[model-name]-[material]
   
   # Extract/copy all 36 images (0.webp through 35.webp)
   # Images should be named: 0.webp, 1.webp, 2.webp, ... 35.webp
   ```

### Method 2: Automated Script (Advanced)

1. **Install Dependencies**
   ```bash
   npm install --save-dev puppeteer sharp --legacy-peer-deps
   ```

2. **Place GLB Models**
   ```bash
   # Put your GLB files in:
   public/models/
   ├── ring-solitaire.glb
   ├── ring-halo.glb
   └── ring-vintage.glb
   ```

3. **Run Generator**
   ```bash
   node scripts/generate-3d-sequences.js
   ```

## 📁 Output Structure

The generator creates this structure:
```
public/images/products/3d-sequences/
├── ring-solitaire-platinum/
│   ├── 0.webp          # 0° rotation
│   ├── 1.webp          # 10° rotation
│   ├── 2.webp          # 20° rotation
│   ├── ...
│   └── 35.webp         # 350° rotation
├── ring-solitaire-yellow-gold/
│   └── ... (36 images)
└── ring-halo-rose-gold/
    └── ... (36 images)
```

## 🎨 Material Configurations

The generator applies realistic PBR materials:

| Material | Metalness | Roughness | Color |
|----------|-----------|-----------|--------|
| Platinum | 1.0 | 0.1 | Light Silver |
| 18K White Gold | 1.0 | 0.15 | Bright Silver |
| 18K Yellow Gold | 1.0 | 0.1 | Golden Yellow |
| 18K Rose Gold | 1.0 | 0.12 | Pinkish Gold |
| 925 Silver | 1.0 | 0.2 | Matte Silver |

## ✅ Quality Checklist

- [ ] **Image Count**: Exactly 36 images per sequence
- [ ] **Naming**: Files named `0.webp` through `35.webp`
- [ ] **Size**: All images same dimensions (600x600 recommended)
- [ ] **Format**: WebP for optimal compression
- [ ] **Background**: Transparent for CSS 3D viewer
- [ ] **Rotation**: Each image is 10° increment (360° / 36 = 10°)

## 🔧 Troubleshooting

### Model Not Loading
- Ensure GLB file is valid (test in Sketchfab or Blender)
- File size should be reasonable (< 10MB)
- Check browser console for errors

### Images Not Generating
- Allow sufficient time (1-2 minutes for 36 images)
- Check browser performance settings
- Try smaller image size (400x400) first

### CSS 3D Viewer Not Working
- Verify all 36 images are present and named correctly
- Check file permissions (images should be readable)
- Test image URLs directly in browser
- Review browser dev tools for 404 errors

## 🎯 Integration with CSS 3D Viewer

Once generated, update your product variants:

```typescript
// In src/data/product-variants.ts
export const RING_VARIANTS: ProductVariant[] = [
  {
    id: 'solitaire-platinum',
    name: 'Classic Solitaire - Platinum',
    assetPath: '/images/products/3d-sequences/solitaire-platinum',
    imageCount: 36,
    material: MATERIALS[0], // Platinum
    description: 'Timeless solitaire setting in premium platinum'
  }
  // ... more variants
];
```

## 🚀 Performance Notes

- **Generation Time**: ~30-60 seconds per material variant
- **File Size**: ~15-20KB per WebP image (540KB total per sequence)
- **Loading Time**: 1-2 seconds to preload all 36 images
- **Bundle Impact**: Zero - images loaded on demand

The CSS 3D viewer will automatically:
- ✅ Preload all 36 images when user interacts
- ✅ Show smooth rotation with drag/touch
- ✅ Handle missing images gracefully
- ✅ Provide accessibility features
- ✅ Work on all devices (no WebGL required)

## 🎬 Next Steps

1. **Generate** your first image sequence using the browser tool
2. **Test** the CSS 3D viewer with real images
3. **Optimize** image compression and formats
4. **Scale** to generate all product variants
5. **Deploy** with CDN for optimal performance