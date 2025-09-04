# Navigation System Architecture

This document outlines the architecture of the new, refactored navigation system, implemented to address persistent layout and state management issues.

## Core Principles

The new architecture is designed around the principles of simplicity, clear separation of concerns, and robustness. It solves the previous issues by decoupling the navigation bar from the mega menu dropdown, eliminating CSS conflicts and simplifying state management.

## Component Architecture

The navigation system is now composed of three primary components:

### 1. `Header.tsx` (The "Smart" Component)

-   **Location:** `src/components/layout/Header.tsx`
-   **Responsibility:** This is the main container and the single source of truth for all navigation-related state. It manages:
    -   The currently active dropdown menu.
    -   The visibility of the navigation bar on scroll.
    -   The state of the mobile menu (open/closed).
-   It passes down all necessary data and event handlers as props to its children.

### 2. `NavigationBar.tsx` (The "Dumb" Component)

-   **Location:** `src/components/navigation/NavigationBar.tsx`
-   **Responsibility:** This component is purely presentational. Its only job is to display the navigation bar, links, and icons. It has no internal state and receives all its data and functionality from the `Header` component.

### 3. `AuroraMegaMenu.tsx` (The Dropdown)

-   **Location:** `src/components/navigation/AuroraMegaMenu.tsx`
-   **Responsibility:** This component displays the content of the dropdown menu. It is a direct child of the `Header` and is rendered conditionally based on the state managed by the `Header`.

## Key Improvements and Fixes

This new architecture resolves the following issues:

1.  **Dropdown Visibility:** By making the `AuroraMegaMenu` a sibling to the `NavigationBar` instead of a child, it is no longer trapped by the navigation bar's CSS stacking context. This ensures it always renders correctly on top of other page content.

2.  **Dynamic Content:** The `Header` component now uses a `key` prop on the `AuroraMegaMenu`. This forces React to create a new instance of the menu each time the user hovers over a different navigation item, guaranteeing that the correct content is always displayed.

3.  **Hiding on Scroll:** The scroll-handling logic is now centralized in the `Header` component and explicitly closes the dropdown menu as soon as the user starts scrolling.

4.  **Animation:** The dropdown animation has been updated to a more subtle and professional fade-in and scale effect.

This refactored architecture is simpler, more maintainable, and provides a much smoother and more reliable user experience.
