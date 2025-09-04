# GlowGlitch Project Instructions

## Project Context
This is the GlowGlitch/Lumina Lab luxury e-commerce platform specializing in lab-grown diamond jewelry with advanced 3D customization capabilities.

## Key Commands
- **Development Server**: `npm run dev` (runs on port 3000)
- **Build**: `npm run build`
- **Type Check**: `npm run type-check`
- **Lint**: `npm run lint`
- **Tests**: `npm test`
- **E2E Tests**: `npm run test:e2e`

## Critical Areas to Monitor
1. **3D Customizer**: Located in `/src/app/customizer/` - Uses Three.js for rendering
2. **Authentication**: NextAuth implementation in `/src/app/api/auth/`
3. **Database**: MongoDB connections and models in `/src/lib/mongodb/`
4. **UI Components**: Custom component library in `/src/components/ui/`
5. **State Management**: React Query patterns throughout the app

## Code Conventions
- Use TypeScript strict mode
- Follow existing CVA (Class Variance Authority) patterns for components
- Maintain responsive design with Tailwind CSS
- Ensure accessibility standards are met
- Mobile-first approach for all new features

## Performance Considerations
- Lazy load 3D assets
- Optimize images with Next.js Image component
- Use React Query for server state caching
- Implement code splitting for large components

### Quick Visual Check
IMMEDIATELY after implementing any front-end change:
1. **Identify what changed** - Review the modified componens/pages
2. **Navigate to affected pages** - Use 'mcp_playwright_wser_navigate to visit each changed
view
3. **Verify design compliance** - Compare against */docs/CLAUDE_RULES.md
and "/context/style-guide.md
4. **Validate feature implementation** - Ensure the change fulfills the user's specific request
5. **Check acceptance criteria** - Review any provided context files or requirements
6. **Capture evidence** - Take full page screenshot at desktop viewport (1440px) of each changed
view
7. **Check for errors** - Run 'mcp_playwright_browser_console_messages

## Testing Requirements
- Write unit tests for utility functions
- Component tests for UI elements
- E2E tests for critical user flows (cart, checkout, customizer)

## Security Guidelines
- Never expose API keys in client-side code
- Validate all user inputs
- Use environment variables for sensitive data
- Implement proper CORS policies

## Known Issues & Solutions
- **3D Viewer Loading**: Check WebGL context and Three.js initialization
- **Server Connection**: Verify MongoDB connection string and network settings
- **UI Collapse**: Review Tailwind CSS classes and responsive breakpoints
- **Typography**: Follow the accessibility guide in typography_accessibility_guide.txt

## Development Workflow
1. Always check existing patterns before implementing new features
2. Run type checking before committing changes
3. Test on mobile devices for responsive design
4. Verify 3D customizer performance after changes

## Memory References
The project has several memory files available through the Serena MCP server:
- project_overview
- tech_stack
- codebase_structure
- code_conventions
- design_system_reference
- mongodb_database_foundation
- 3D_customizer_implementation_achievements
- nextauth_authentication_implementation

## Limit Scope of Changes
- Only modify the part of the code explicitly mentioned in the prompt.
- Avoid altering global variables or state unless specified.
- Do not refactor or rewrite entire sections unless explicitly requested.
  
## Maintain Modular Structure
- Ensure each change is modular and independent. Avoid dependencies across sections unless explicitly stated.
- Changes should be self-contained within their designated functions, components, or sections.

## Preserve Existing Code
- Do not modify or remove existing code unless specifically instructed.
- Preserve the original structure, comments, and style unless an update is necessary.

## Compatibility with Existing Features
- Ensure new changes do not break or conflict with existing features.
- If modifications affect other parts of the code, clarify this and ask for confirmation before implementing changes.

## Maintain Consistent Code Style
- Follow the existing coding style and conventions in terms of indentation, variable naming, function signatures, etc.
- Ensure any new code added adheres to the same style to maintain readability and consistency.

## Version Control and Rollbacks
- Always work in a new branch and ensure that changes are committed separately.
- If changes are experimental or untested, make sure they’re added to a staging branch first and tested locally.
- Follow Git commit conventions: use meaningful commit messages like `feat:`, `fix:`, `docs:` to indicate the type of change.

## Testing and Validation
- Test all changes locally before committing. If possible, use automated tests to validate functionality.
- If changes might affect user interface elements, manually check for visual regressions.

## Backward Compatibility
- Ensure that any changes made do not break the compatibility with previous features or versions of the code.
- For updates to existing functions or APIs, ensure backward compatibility unless otherwise requested.

## Error Handling and Logging
- Any new code should handle errors gracefully and log relevant information for debugging purposes.
- Avoid silent failures. Ensure errors are communicated clearly for easy debugging.

## Documentation and Comments
- Add clear comments to explain any non-obvious changes or logic.
- If changes affect functionality that needs to be used later, document these changes in the code comments.
  
##  UI/UX Consistency
- If making UI/UX changes, ensure they align with the existing design system and user flow.
- Avoid altering global styles or color schemes unless explicitly stated.

##  Avoid Unintended Modifications
- Double-check that only the required changes are made. Ensure no other files or sections of the code are inadvertently altered.
- Limit changes to styles or elements that were specifically requested in the prompt.

---

## Execution Guidelines:
1. **Commit and Test:** Before executing any change, test it locally and make sure it doesn’t break any existing functionality.
2. **Branching:** Always create a new branch for each change and p


Always reference these memories when working on related features.