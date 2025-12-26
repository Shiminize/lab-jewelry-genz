# GlowGlitch (Lumina Lab) - Product Requirements Document

**Version:** 3.1.0 (Audit Refined)
**Date:** December 26, 2025
**Status:** Live / Optimization / Feature Expansion
**Document Owner:** Product Team
**Technical Lead:** Development Team

---

## Executive Summary

**GlowGlitch** (branded as **Lumina Lab**) is a luxury e-commerce platform revolutionizing the sustainable jewelry market through advanced 3D customization and high-touch "Concierge" services. This PRD serves as the single source of truth for the current application state (V3.1), reflecting the "Calm Luxury" design aesthetic, the live "Concierge" widget ecosystem, and the hybrid 3D visualization engine.

### Quick Facts
- **Target Market:** $350B global jewelry market, focusing on $47B lab-grown segment
- **Revenue Model:** Direct sales + "Stack" Bundles + Creator Commission Program
- **Competitive Advantage:** 
    - **Hybrid 3D Engine:** Instant load (Image Sequence) + Interactive (Google Model Viewer).
    - **Concierge Widget:** Real-time SMS updates, stylist ticketing, and "Shortlist" curation.
- **Target Users:** Affluent millennials/Gen Z (25-40 years) seeking ethical luxury.
- **Current Status:** Core platform live; "Concierge" features active; scaling Creator ecosystem.
- **UI System:** "Calm Luxury" / "Natural Geometry". Zero-radius buttons, `Petrona` serif typography, and warm beige (`#F4F1EC`) palette.

---

## Table of Contents

1. [Product Vision & Strategy](#product-vision--strategy)
2. [Market Analysis](#market-analysis)
3. [User Personas & Journey](#user-personas--journey)
4. [Feature Requirements & Status](#feature-requirements--status)
5. [Technical Architecture](#technical-architecture)
6. [User Experience Design](#user-experience-design)
7. [Business Model & Monetization](#business-model--monetization)
8. [Success Metrics & KPIs](#success-metrics--kpis)
9. [Implementation Roadmap](#implementation-roadmap)
10. [Risk Assessment](#risk-assessment)

---

## Product Vision & Strategy

### Vision Statement
*"To become the leading sustainable luxury jewelry platform where conscious consumers design, customize, and purchase lab-grown diamond and moissanite jewelry, supported by an intelligent Concierge service that bridges the gap between digital convenience and personal styling."*

### Strategic Objectives (2026)

#### Primary Objectives
1.  **Concierge-Driven Conversion**: Leverage the "Widget" ecosystem (SMS updates, Stylist Tickets) to increase conversion by 20%.
2.  **Platform Reliability**: Maintain 99.9% uptime with robust automated testing (Playwright E2E) and database caching.
3.  **Creator Ecosystem**: Expansion of the active creator network via the dedicated Creator Dashboard.

---

## Feature Requirements & Status

### Core Features (Live)

#### 1. 3D Jewelry Customizer ("The Studio")
**Status**: **Live**
-   **Tech**: Hybrid Engine.
    -   **Interactive**: `@google/model-viewer` for 360° orbit, zoom, and AR interactions.
    -   **Performance**: Pre-rendered image sequences for instant initial load.
-   **Features**:
    -   **Material Switching**: Real-time toggling between Silver, 14k Gold, and Platinum.
    -   **Stone Selection**: Lab-grown Diamond vs. Moissanite.
    -   **Shortlist**: "Save to Shortlist" functionality persisted via `WidgetShortlist` service.

#### 2. The Concierge Widget
**Status**: **Live / Scaling**
-   **Overview**: An omnipresent service layer connecting users to stylists.
-   **Capabilities**:
    -   **Stylist Tickets**: Users can submit inquiries (with phone/time preference) directly to a stylist queue (`stylist_tickets` table).
    -   **Shortlists**: Session-based curation of favorite items, shareable with stylists.
    -   **Order Subscriptions**: SMS/Email milestone updates (`widget_order_subscriptions` table).
    -   **CSAT**: Integrated Customer Satisfaction feedback loops (`csat_feedback`).

#### 3. Smart Cart & Checkout
**Status**: **Live**
-   **Cart**:
    -   **Capsule Lineup**: Visual "Capsule" layout for cart items.
    -   **Recommended Stacks**: Cross-sell logic suggesting "Stacks" (e.g., "Flux Series Set") based on cart contents.
    -   **Concierge Interface**: Direct links to "Email Concierge" or "Book a Call" from the cart summary.
-   **Checkout**: Stripe integration with address validation and optional concierge assistance.

#### 4. Creator Program
**Status**: **Live**
-   **Applications**: Automated application flow (`CreatorApplication` model).
-   **Dashboard**: Dedicated view for creators to track commissions and payouts.

#### 5. Product Catalog
**Status**: **Live**
-   **Search**: Full-text search on product names and descriptions.
-   **Filtering**: Advanced filtering by material, price, and collections.
-   **Design**: "Calm Luxury" grid with zero-radius cards and "Tone" badges (Volt, Cyan, Magenta).

---

## Technical Architecture

### System Architecture Overview

#### Technology Stack
-   **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS.
-   **Backend**: Server Actions (for mutations), Next.js API Routes (for webhooks).
-   **Database**: **PostgreSQL** (via **NeonDB**) with Connection Pooling.
-   **ORM**: **Prisma** (`^5.17.0`).
-   **3D Graphics**:
    -   `@google/model-viewer` (Web Component).
    -   `gltfpack` / Blender scripts for asset optimization.
-   **Payments**: Stripe (`^18.4.0`).
-   **Authentication**: NextAuth.js (v5 Beta).
-   **Testing**: Playwright (E2E), Jest (Unit).
-   **Monitoring**: Sentry.

### Database Schema (Key Models)

**Core Commerce**
-   `Product`: Slug, Price, Materials, JSON Metadata (Images, Details).
-   `Order`: Items (JSON), Status History, Stripe Payment ID.
-   `Cart`: Session-based persistence.

**Concierge & Widget**
-   `WidgetShortlist`: Stores user's curated favorites by Session ID.
-   `StylistTicket`: Escalation tickets for personal styling requests.
-   `WidgetOrderSubscription`: SMS/Email preferences for order updates.
-   `CsatFeedback`: Post-interaction satisfaction scores.

**Administrative**
-   `CreatorApplication`: Management of creator program applicants.
-   `Promotion`: Engine for percentage/fixed discounts (`promotions` table).

### Security & Validations
-   **Input Validation**: Zod schemas used across all Server Actions.
-   **Payment**: PCI-compliant Stripe integration.
-   **Auth**: Secure session handling via NextAuth.

---

## User Experience Design

### "Calm Luxury" Design System
A strict, geometric design language emphasizing precision and warmth.

#### Core Palette (`tokens.css`)
-   **Background**: `#F4F1EC` (Warm Paper).
-   **Ink**: `#3F4A45` (Deep Organic Grey/Green).
-   **Accent**: `#3F4A45` (Primary), `#8A978F` (Secondary Sage).
-   **Tones**: "Volt", "Cyan", "Magenta", "Lime" used for badging and subtle highlights.

#### Geometric Principles
-   **Zero Radius**: `border-radius: 0px` strictly enforced on all buttons, inputs, and cards.
-   **Typography**:
    -   **Headings**: `Petrona` (Serif).
    -   **Body**: `Commissioner` (Sans).
    -   **Accents**: `Urbanist` (Caps/Labels).

---

## Implementation Roadmap

### Completed (Q4 2025)
-   [x] **Platform V3 Launch**: Migration to Next.js 14 + NeonDB.
-   [x] **Concierge Widget**: Release of Stylist Ticket and Shortlist services.
-   [x] **Hybrid 3D Engine**: Implementation of Model Viewer + Image Sequences.
-   [x] **Smart Cart**: "Stacks" cross-selling and "Capsule" UI.
-   [x] **Design System**: Full rollout of "Calm Luxury" (Zero Radius).

### Current Phase (Optimization & Scaling)
-   [ ] **Performance**: Optimizing Mobile LCP for 3D assets.
-   [ ] **Dashboard Expansion**: Enhanced order management for "Concierge" admins.
-   [ ] **Testing**: Increasing Playwright coverage for Concierge flows.

### Future (Q1-Q2 2026)
-   [ ] **AR Try-On**: Native mobile AR integration.
-   [ ] **Global Currency**: Multi-currency support via Stripe.
-   [ ] **AI Stylist**: Automated first-response for simple stylistic queries.

---

## Document Control
-   **Last Updated**: December 26, 2025
-   **Version**: 3.1.0 (Audit Refined)
-   **Change Log**:
    -   Added "Concierge" and "Widget" service definitions.
    -   Updated Database Schema to include `WidgetShortlist` and `StylistTicket`.
    -   Refined Tech Stack to specify Hybrid 3D Engine details.
    -   Documented "Smart Cart" features.
