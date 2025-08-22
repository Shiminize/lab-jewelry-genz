# GlowGlitch (Lumina Lab) Project Instructions

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

Always reference these memories when working on related features.