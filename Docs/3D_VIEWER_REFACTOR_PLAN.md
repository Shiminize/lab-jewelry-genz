Master Prompt: 3D Viewer Refactor Project

ROLE:
You are an expert front-end developer specializing in high-performance, mobile-first e-commerce experiences. Your primary goal is to write clean, efficient, and maintainable code using React, TypeScript, and Next.js.

PROJECT GOAL:
Refactor a failing 3D product viewer on an e-commerce site. The current implementation using React Three Fiber (Basic3DViewer.tsx) is causing a critical runtime error (TypeError: Cannot read properties of undefined (reading 's')) and must be replaced.

CORE STRATEGY:
We are abandoning the real-time 3D implementation. We will replace it with a high-performance "CSS 3D" viewer that uses a pre-rendered image sequence. This approach prioritizes reliability, speed, and cross-device compatibility over real-time rendering flexibility.

TECHNOLOGY STACK:

Framework: Next.js / React

Language: TypeScript (Strict Mode, no any types)

Styling: Tailwind CSS (using design system tokens like bg-background)

Accessibility: WCAG 2.1 AA standards must be met.

EXECUTION PLAN

Execute the following phases in order.

Phase 1: Immediate Triage & Project Unblocking

Objective: Remove the failing components to stabilize the application and unblock other development.

Create a Placeholder:

Create a new component file: src/components/customizer/StaticImageViewer.tsx.

This component will accept a single imageUrl prop and display a static <img> tag wrapped in an aspect-ratio container.

Ensure it is fully responsive and uses placeholder data for now.

Isolate Failing Code:

Navigate to src/components/homepage/CustomizerPreviewSection.tsx.

Comment out the import and usage of Dynamic3DViewer.

Replace it with the new StaticImageViewer component.

Verify: Confirm that the homepage now loads without any 3D-related runtime errors. The page should display the static placeholder image.

Phase 2: Define the Asset Pipeline & Data Structure

Objective: Structure the data and assets needed for the new viewer before implementation.

Asset Folder Structure:

Define a public asset path, e.g., /products/rings/.

Inside, create subfolders for each product variant, for example:

/ring-solitaire-gold/

/ring-solitaire-platinum/

Each folder will contain a sequence of 36 pre-rendered images, named sequentially (e.g., 0.webp, 1.webp, ..., 35.webp).

Create Data Model:

In a types.ts file, define a TypeScript interface ProductVariant that includes name (e.g., "14k Yellow Gold"), a unique id ('gold'), and an assetPath pointing to the folder (e.g., /products/rings/ring-solitaire-gold/).

Create a mock data file (/data/products.ts) that exports an array of these ProductVariant objects.

Phase 3: Develop the Core ImageSequenceViewer Component

Objective: Build the reusable interactive viewer component.

Component Scaffolding:

Create src/components/customizer/ImageSequenceViewer.tsx.

The component will accept props: imagePath: string and imageCount: number (e.g., 36).

Implement Functionality:

Image Preloading: Use a useEffect hook to preload all 36 images into the browser cache when the component mounts. This is critical for smooth interaction. Manage a loading state.

State Management: Use useState to track the currentFrame (from 0 to 35).

Interaction Logic:

Attach onMouseDown / onTouchStart event listeners to the container.

On drag (onMouseMove / onTouchMove), calculate the horizontal distance moved.

Map the drag distance to a change in the currentFrame. A full 360-degree rotation could correspond to a 300px drag, for example.

Update the src of the displayed <img> tag to /{imagePath}/{currentFrame}.webp.

Cleanup: Use a useEffect cleanup function to remove global mouse/touch event listeners when the component unmounts.

Phase 4: Integration and Finalization

Objective: Integrate the new viewer into the application and add user controls.

Create the Main Customizer Component:

Create a new src/components/customizer/ProductCustomizer.tsx.

This component will:

Manage the state for the currently selected variant (e.g., selectedVariantId: 'gold').

Render UI controls (e.g., buttons for "Gold", "Platinum") that update this state.

Fetch the corresponding ProductVariant object from your mock data.

Render the ImageSequenceViewer, passing the assetPath of the currently selected variant.

Final Replacement:

In src/components/homepage/CustomizerPreviewSection.tsx, replace the StaticImageViewer placeholder with the new, fully functional ProductCustomizer.

Ensure the component gracefully handles the loading state of the image sequences when the user switches materials.

Final Review: Verify that the entire user flow is seamless, performant on mobile, and free of runtime errors. Confirm all accessibility attributes (ARIA labels, keyboard navigation for controls) are in place.