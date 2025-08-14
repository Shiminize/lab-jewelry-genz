# 3D Viewer Components and Asset Pipeline Guideline

**Last Updated:** August 14, 2025

## 1. Overview

This document outlines the standards and procedures for using our high-performance 3D product viewer. Our system uses a hybrid approach:

1.  **Offline Asset Generation:** A powerful, browser-based tool (`scripts/3d-renderer.html`) converts `.glb` 3D models into high-quality, pre-rendered image sequences.
2.  **Frontend Display:** A lightweight React component (`ImageSequenceViewer.tsx`) displays these images to create a smooth, interactive 360° viewing experience that is fast, reliable, and works on all devices.

Adhering to this workflow is critical for maintaining visual quality and consistency across the platform.

---

## 2. Asset Generation Workflow

All 3D assets MUST be processed through the `scripts/3d-renderer.html` tool before they can be used on the website. This tool provides essential controls for ensuring assets are correctly rendered and centered.

### Step-by-Step Instructions:

1.  **Open the Tool:** Open the `scripts/3d-renderer.html` file in a web browser.

2.  **Load the Model:** Use the "GLB Model" file input to select your `.glb` file.

3.  **Adjust Lighting:** Use the **Brightness** slider to achieve the desired level of exposure and highlight detail.

4.  **Center the Model (Most Important Step):**
    This is the most critical step for avoiding alignment issues on the live website. Use the **Position Adjustment** sliders:
    *   **Offset Y:** Nudge the model up or down.
    *   **Offset X:** Nudge the model left or right.
    *   **Goal:** Ensure the model appears perfectly centered, both vertically and horizontally, within the square preview window. What you see in the preview is exactly how the final images will look.

5.  **Select Material:** Choose the desired material (e.g., "18K Rose Gold") from the dropdown. The preview will update.

6.  **Generate Images:** Click the **"Generate 36 Images"** button.

7.  **Download:** Once processing is complete, click **"Download All as ZIP"**. The downloaded file will be named automatically (e.g., `doji_diamond_ring-rose-gold-sequence.zip`).

---

## 3. Website Integration

Once you have the generated ZIP file, you must integrate it into the website.

### 1. File Placement

*   **Unzip** the downloaded file.
*   Create a new directory inside `public/images/products/3d-sequences/`.
*   The directory name **must** match the name of the unzipped folder (e.g., `doji_diamond_ring-rose-gold-sequence`).
*   Place all 36 generated `.png` images inside this new directory.

### 2. Data Configuration

The website needs to be made aware of the new product variant. This is done in `src/data/product-variants.ts`.

*   Open the file and add a new object to the `RING_VARIANTS` array.
*   Follow the existing structure precisely.

**Example Entry:**

```typescript
{
  id: 'doji-diamond-ring-rose-gold', // Unique ID for the variant
  name: 'Doji Diamond Ring - Rose Gold', // Display name
  // IMPORTANT: This path must match the directory you created
  assetPath: '/images/products/3d-sequences/doji_diamond_ring-rose-gold-sequence',
  imageCount: 36, // Should always be 36
  // Ensure this matches the material you rendered
  material: MATERIALS.find(m => m.id === '18k-rose-gold') || MATERIALS[3],
  description: 'Doji Diamond Ring in 18K Rose Gold'
}
```

---

## 4. Frontend Component: `ImageSequenceViewer.tsx`

The viewer component itself requires no changes for new assets. It is designed to work automatically with the data provided.

*   **Image Format:** It is configured to load `.png` files, which matches the output of the renderer tool.
*   **Display Mode:** It uses the `object-cover` CSS property to ensure the product image responsively fills the viewer area. This is why **Step 4: Center the Model** in the generation workflow is so important.

## 5. Troubleshooting

*   **"Images not found (404 Error)"**: This means the `assetPath` in `product-variants.ts` does not exactly match the directory path in `public/images/products/3d-sequences/`.
*   **"Ring is off-center on the website"**: The model was not centered correctly during the asset generation step. Re-open the `3d-renderer.html` tool, load the model, use the **Position Adjustment** sliders to fix the centering, and re-generate and re-upload the images.
*   **"Slider movement is jerky in the renderer"**: This was a bug that has been fixed. If it reappears, it indicates a logical error in the script's transform calculations. The one-time centering logic needs to be separated from the interactive offset updates.
