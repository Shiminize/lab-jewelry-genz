As a frontend expert, I've conducted a
  comprehensive audit of the project's typography.

  Here is my report, including an analysis of the
  current system and a proposed plan for a simplified,
   reusable, and compliant typography system, adhering
   strictly to the principles in Docs/Claude_Rules.md.

  ---

  Typography System Audit & Modernization Plan

  Report Date: September 10, 2025
  Prepared By: Frontend Development Expert

  1. Executive Summary

  This audit finds that while the project has a
  clearly defined font selection (Fraunces for
  headlines, Inter for body), it lacks a centralized,
  maintainable system for applying typographic styles.
   The current approach of composing styles directly
  with Tailwind CSS utility classes on a case-by-case
  basis introduces risks of inconsistency, poor
  maintainability, and code verbosity.

  I propose a two-pronged, simplicity-first approach
  that aligns perfectly with the rules outlined in
  Docs/Claude_Rules.md:

   1. Centralize Definitions via CSS: Create a set of
      reusable, semantic typography classes directly
      within Tailwind CSS. This avoids creating
      unnecessary React component abstractions.
   2. Introduce a Minimalist Component (Optional):
      Develop a simple <Text> component for specific,
      justified use cases, ensuring we do not create
      excessive wrappers.

  This plan will dramatically improve consistency and
  developer efficiency while honoring the project's
  core principles of simplicity and maintainability.

  2. Current State Analysis

  The typography system is currently defined by the
  "Aurora Design System" specification and implemented
   directly using Tailwind CSS utility classes.

   * What's Working:
       * Clear Font Definition: The choice of Fraunces
         and Inter provides a strong and consistent
         brand identity.
       * Simplicity: Using utility classes directly is
         straightforward and avoids premature
         abstraction, which aligns with the
         "simplicity-first" principle.

   * Identified Risks & Deficiencies:
       * Risk of Inconsistency: Without a single source
         of truth for what constitutes a "headline" or
         "body copy," developers may inadvertently apply
          slightly different combinations of utilities
         for the same semantic element (e.g., using
         text-4xl for one <h2> and text-3xl for
         another). This violates the principle of using
         pre-defined design tokens.
       * Poor Maintainability: If the design team
         decides to update a style (e.g., change the h3
         font weight), developers must perform a manual,
          codebase-wide search-and-replace, which is
         inefficient and highly prone to error.
       * Code Verbosity & Readability: Applying multiple
          utilities like .font-fraunces .text-4xl 
         .font-bold .text-foreground to every heading
         tag clutters the JSX and makes it harder to
         read the component's structure.
       * Semantic Disconnect: There is no enforced link
         between a semantic HTML tag (like <h1>) and its
          visual style. This can lead to poor
         accessibility and SEO practices if styles are
         applied to non-semantic tags like <div>.

  3. Proposed "Compliant & Reusable" Typography System

  To address these issues while strictly adhering to
  Docs/Claude_Rules.md, I propose the following plan.
  The guiding principle is to centralize the style 
  definitions, not to force component abstraction.

  ##### Prong 1: Centralize Styles with Tailwind CSS 
  (The Core Solution)

  This is the simplest viable implementation and should
  be our default approach. It directly follows the "no
  excessive wrappers" and "simplicity-first" rules.

   1. Action: Define all typographic styles as "component
       classes" in a global CSS file (e.g.,
      src/styles/globals.css) using Tailwind's @apply
      directive. These classes become our official
      typography "tokens."
   2. Example Definition:


   1     @layer components {
   2       .typography-h1 { @apply font-fraunces
     text-5xl font-bold text-foreground; }
   3       .typography-h2 { @apply font-fraunces
     text-4xl font-bold text-foreground; }
   4       .typography-h3 { @apply font-fraunces
     text-2xl font-semibold text-foreground; }
   5       .typography-body { @apply font-inter
     text-base font-normal text-foreground; }
   6       .typography-link { @apply font-inter
     text-base text-aurora-nebula-purple hover
     :underline; }
   7       .typography-caption { @apply
     font-inter text-sm font-light
     text-aurora-nav-muted; }
   8       /* ... and so on for all defined text
     styles. */
   9     }
   3. Usage: Developers will apply a single, semantic
      class to the appropriate HTML tag. This is clean,
      maintainable, and semantically correct.

   1     <h1 className="typography-h1">Our
     Collections</h1>
   2     <p className="typography-body">Discover
     our latest sustainable jewelry...</p>
   3     <a href="/about" className=
     "typography-link">Learn More</a>
   4. Compliance Check:
       * ✅ Simplicity-First: This is the simplest
         possible solution, using native Tailwind
         functionality.
       * ✅ No Excessive Wrappers: It adds zero new
         React components or abstraction layers.
       * ✅ Maintainability: A style update requires
         changing only one line of CSS.
       * ✅ Use Tokens Only: The .typography-* classes
         become the official, enforced design tokens.

  ##### Prong 2: Create a Limited & Optional `<Text>` 
  Component (The Enhancement)

  This should be treated as a tool for specific
  scenarios, not a mandatory wrapper for all text on
  the site.

   1. Justification: A component is justified when
      dealing with dynamic text that requires complex
      logic (like truncation with a "show more" button)
      or when rendering text from a CMS where adding a
      class is not possible. It should not be used for
      simple, static headlines or paragraphs.
   2. Proposed API: The component would be extremely
      lightweight.

   1     // For rendering a semantic h1 with the
     correct style
   2     <Text as="h1">A Headline</Text>
   3 
   4     // For rendering a paragraph with body 
     styling
   5     <Text as="p">Some body text.</Text>
   3. Implementation: The component's internal logic
      would be a simple mapping from the as prop to the
      corresponding CSS class from Prong 1 and the
      correct HTML tag. It would contain no business
      logic.
   4. Compliance Check:
       * ✅ Avoids Over-Modularization: Its use is
         optional and justified, not forced, preventing
         it from becoming an excessive wrapper.
       * ✅ Component-Only Layer: It is a pure
         presentation component with no logic, aligning
         with the architectural rules.

  4. Implementation Roadmap

  I recommend the following phased approach:

   1. Phase 1: Definition (1-2 days):
       * Collaborate with the design team to finalize
         the complete list of typographic styles
         required for the application (e.g., H1-H6,
         Body, Subtitle, Caption, Link, Button Text).

   2. Phase 2: Centralization (2-3 days):
       * Implement the defined styles as .typography-*
         classes in the global stylesheet as described
         in Prong 1.

   3. Phase 3: Refactoring (Ongoing):
       * Systematically refactor the existing codebase,
         replacing multi-class style compositions with
         the new, single typography classes. This can be
          done gradually as developers touch different
         parts of the application.

   4. Phase 4: Documentation & Enforcement (1 day):
       * Document the new typography system clearly.
       * Establish a linting rule or code review process
          to prevent developers from manually composing
         text styles and encourage the use of the new
         classes.
       * Decide as a team if the optional <Text>
         component is needed. If so, build and document
         it.

  This plan provides a robust, maintainable, and
  compliant system that will serve the project
  long-term without adding unnecessary complexity.