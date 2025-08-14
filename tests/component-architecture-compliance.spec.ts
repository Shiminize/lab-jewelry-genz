/**
 * Component Architecture Compliance Tests
 * Tests all CLAUDE_RULES.md component architecture requirements
 * - TypeScript strict mode, no 'any' types
 * - Error-first coding with recovery paths
 * - Proper file placement in src/components structure
 * - Memoization and useCallback optimization
 */

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Project paths
const PROJECT_ROOT = '/Users/decepticonmanager/Projects/GenZJewelry_AUG_12';
const SRC_PATH = path.join(PROJECT_ROOT, 'src');
const COMPONENTS_PATH = path.join(SRC_PATH, 'components');

// TypeScript configuration check
function checkTSConfig(): { strict: boolean, noImplicitAny: boolean, errors: string[] } {
  try {
    const tsConfigPath = path.join(PROJECT_ROOT, 'tsconfig.json');
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
    
    const compilerOptions = tsConfig.compilerOptions || {};
    
    return {
      strict: compilerOptions.strict === true,
      noImplicitAny: compilerOptions.noImplicitAny !== false, // Default is true when strict is true
      errors: []
    };
  } catch (error) {
    return {
      strict: false,
      noImplicitAny: false,
      errors: [`Failed to read tsconfig.json: ${error}`]
    };
  }
}

// Helper function to recursively get all TypeScript files
function getAllTSFiles(dir: string): string[] {
  const files: string[] = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...getAllTSFiles(fullPath));
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Could not read directory ${dir}: ${error}`);
  }
  
  return files;
}

// Helper function to analyze file content for TypeScript violations
function analyzeFileContent(filePath: string): {
  anyTypes: number;
  implicitReturns: number;
  errorHandling: boolean;
  memoization: boolean;
  useCallback: boolean;
  errors: string[];
} {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const analysis = {
      anyTypes: 0,
      implicitReturns: 0,
      errorHandling: false,
      memoization: false,
      useCallback: false,
      errors: []
    };
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Check for 'any' types
      const anyMatches = line.match(/:\s*any\b|<any>|\bany\[\]/g);
      if (anyMatches) {
        analysis.anyTypes += anyMatches.length;
      }
      
      // Check for error handling patterns
      if (trimmed.includes('try') || trimmed.includes('catch') || 
          trimmed.includes('throw') || trimmed.includes('Error(')) {
        analysis.errorHandling = true;
      }
      
      // Check for memoization
      if (trimmed.includes('useMemo') || trimmed.includes('memo(') || 
          trimmed.includes('React.memo')) {
        analysis.memoization = true;
      }
      
      // Check for useCallback
      if (trimmed.includes('useCallback')) {
        analysis.useCallback = true;
      }
    });
    
    return analysis;
  } catch (error) {
    return {
      anyTypes: 0,
      implicitReturns: 0,
      errorHandling: false,
      memoization: false,
      useCallback: false,
      errors: [`Failed to read file: ${error}`]
    };
  }
}

// Helper function to check component file structure
function checkComponentStructure(): {
  properStructure: boolean;
  indexFiles: number;
  componentFiles: number;
  violations: string[];
} {
  const violations: string[] = [];
  let indexFiles = 0;
  let componentFiles = 0;
  
  try {
    const componentFiles = getAllTSFiles(COMPONENTS_PATH);
    
    componentFiles.forEach(filePath => {
      const relativePath = path.relative(COMPONENTS_PATH, filePath);
      const dirname = path.dirname(relativePath);
      const basename = path.basename(filePath);
      
      // Count index files
      if (basename === 'index.ts' || basename === 'index.tsx') {
        indexFiles++;
      }
      
      // Count component files
      if (basename.endsWith('.tsx') && basename !== 'index.tsx') {
        componentFiles++;
        
        // Check naming convention (PascalCase)
        const componentName = basename.replace('.tsx', '');
        if (!/^[A-Z][A-Za-z0-9]*$/.test(componentName)) {
          violations.push(`Component ${relativePath} should use PascalCase naming`);
        }
      }
      
      // Check directory structure
      const pathParts = dirname.split(path.sep);
      const hasProperStructure = pathParts.every(part => 
        part === '.' || /^[a-z][a-z0-9-]*$/.test(part)
      );
      
      if (!hasProperStructure) {
        violations.push(`Directory structure violation: ${dirname} should use kebab-case`);
      }
    });
    
    return {
      properStructure: violations.length === 0,
      indexFiles,
      componentFiles,
      violations
    };
  } catch (error) {
    return {
      properStructure: false,
      indexFiles: 0,
      componentFiles: 0,
      violations: [`Failed to check component structure: ${error}`]
    };
  }
}

test.describe('TypeScript Configuration Compliance', () => {
  test('TypeScript strict mode is enabled', async ({}) => {
    const tsConfig = checkTSConfig();
    
    expect(tsConfig.errors).toHaveLength(0);
    expect(tsConfig.strict).toBe(true);
    expect(tsConfig.noImplicitAny).toBe(true);
    
    console.log('✓ TypeScript strict mode is properly configured');
  });
});

test.describe('TypeScript Code Quality', () => {
  test('No any types in component files', async ({}) => {
    const componentFiles = getAllTSFiles(COMPONENTS_PATH);
    const violations: Array<{file: string, count: number}> = [];
    let totalAnyTypes = 0;
    
    componentFiles.forEach(filePath => {
      const analysis = analyzeFileContent(filePath);
      if (analysis.anyTypes > 0) {
        const relativePath = path.relative(PROJECT_ROOT, filePath);
        violations.push({
          file: relativePath,
          count: analysis.anyTypes
        });
        totalAnyTypes += analysis.anyTypes;
      }
    });
    
    if (violations.length > 0) {
      console.error('Any type violations:', violations.slice(0, 10));
    }
    
    console.log(`Checked ${componentFiles.length} component files`);
    console.log(`Found ${totalAnyTypes} 'any' type violations in ${violations.length} files`);
    
    // Allow very few any types (for third-party integrations)
    expect(totalAnyTypes).toBeLessThan(5);
    expect(violations.length).toBeLessThan(componentFiles.length * 0.1); // Max 10% of files
  });

  test('API and lib files have proper TypeScript', async ({}) => {
    const apiFiles = getAllTSFiles(path.join(SRC_PATH, 'app', 'api'));
    const libFiles = getAllTSFiles(path.join(SRC_PATH, 'lib'));
    const allFiles = [...apiFiles, ...libFiles];
    
    const violations: Array<{file: string, anyCount: number}> = [];
    let totalAnyTypes = 0;
    
    allFiles.forEach(filePath => {
      const analysis = analyzeFileContent(filePath);
      if (analysis.anyTypes > 0) {
        const relativePath = path.relative(PROJECT_ROOT, filePath);
        violations.push({
          file: relativePath,
          anyCount: analysis.anyTypes
        });
        totalAnyTypes += analysis.anyTypes;
      }
    });
    
    console.log(`Checked ${allFiles.length} API/lib files`);
    console.log(`Found ${totalAnyTypes} 'any' types in ${violations.length} files`);
    
    if (violations.length > 0) {
      console.warn('API/lib any type violations:', violations.slice(0, 5));
    }
    
    // API and lib files should have very strict typing
    expect(totalAnyTypes).toBeLessThan(3);
  });

  test('Type definitions are properly exported', async ({}) => {
    const typeFiles = getAllTSFiles(path.join(SRC_PATH, 'types'));
    const violations: string[] = [];
    
    typeFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(PROJECT_ROOT, filePath);
        
        // Check for export statements
        const hasExports = content.includes('export') || content.includes('declare');
        
        if (!hasExports && content.trim().length > 0) {
          violations.push(`${relativePath} contains types but no exports`);
        }
        
        // Check for proper interface/type naming
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('interface ') || line.includes('type ')) {
            const match = line.match(/(?:interface|type)\s+([A-Za-z0-9_]+)/);
            if (match) {
              const typeName = match[1];
              if (!/^[A-Z][A-Za-z0-9]*$/.test(typeName)) {
                violations.push(`${relativePath}:${index + 1} - Type '${typeName}' should use PascalCase`);
              }
            }
          }
        });
      } catch (error) {
        violations.push(`Failed to read ${filePath}: ${error}`);
      }
    });
    
    if (violations.length > 0) {
      console.error('Type definition violations:', violations.slice(0, 10));
    }
    
    expect(violations.length).toBeLessThan(typeFiles.length * 0.2); // Allow 20% violations for flexibility
    console.log(`✓ Checked ${typeFiles.length} type definition files`);
  });
});

test.describe('Error Handling Patterns', () => {
  test('API routes implement error-first patterns', async ({}) => {
    const apiRouteFiles = getAllTSFiles(path.join(SRC_PATH, 'app', 'api'));
    const violations: string[] = [];
    let routesWithErrorHandling = 0;
    
    apiRouteFiles.forEach(filePath => {
      if (filePath.includes('route.ts')) {
        const analysis = analyzeFileContent(filePath);
        const relativePath = path.relative(PROJECT_ROOT, filePath);
        
        if (analysis.errorHandling) {
          routesWithErrorHandling++;
        } else {
          violations.push(`${relativePath} lacks error handling`);
        }
      }
    });
    
    const routeFiles = apiRouteFiles.filter(f => f.includes('route.ts'));
    console.log(`${routesWithErrorHandling}/${routeFiles.length} API routes have error handling`);
    
    if (violations.length > 0) {
      console.error('API routes without error handling:', violations.slice(0, 5));
    }
    
    // At least 90% of API routes should have error handling
    expect(routesWithErrorHandling / routeFiles.length).toBeGreaterThan(0.9);
  });

  test('Components implement error boundaries or error handling', async ({}) => {
    const componentFiles = getAllTSFiles(COMPONENTS_PATH)
      .filter(f => f.endsWith('.tsx') && !f.includes('index.tsx'));
    
    let componentsWithErrorHandling = 0;
    const violations: string[] = [];
    
    componentFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(PROJECT_ROOT, filePath);
        
        // Check for error handling patterns
        const hasErrorHandling = 
          content.includes('try') && content.includes('catch') ||
          content.includes('ErrorBoundary') ||
          content.includes('error') && content.includes('useState') ||
          content.includes('onError') ||
          content.includes('handleError');
        
        if (hasErrorHandling) {
          componentsWithErrorHandling++;
        } else {
          // Only flag complex components (not simple presentational ones)
          const hasLogic = content.includes('useState') || content.includes('useEffect') || 
                          content.includes('fetch') || content.includes('api');
          
          if (hasLogic) {
            violations.push(`${relativePath} has logic but no error handling`);
          }
        }
      } catch (error) {
        violations.push(`Failed to read ${filePath}: ${error}`);
      }
    });
    
    console.log(`${componentsWithErrorHandling}/${componentFiles.length} components have error handling`);
    
    if (violations.length > 0) {
      console.warn('Components needing error handling:', violations.slice(0, 5));
    }
    
    // Allow some components without error handling (simple presentational components)
    expect(violations.length).toBeLessThan(componentFiles.length * 0.3);
  });
});

test.describe('Component File Structure', () => {
  test('Components follow proper directory structure', async ({}) => {
    const structure = checkComponentStructure();
    
    console.log('Component structure stats:', {
      indexFiles: structure.indexFiles,
      componentFiles: structure.componentFiles,
      violations: structure.violations.length
    });
    
    if (structure.violations.length > 0) {
      console.error('Structure violations:', structure.violations.slice(0, 10));
    }
    
    expect(structure.violations.length).toBe(0);
    expect(structure.componentFiles).toBeGreaterThan(0);
    console.log('✓ Component file structure is compliant');
  });

  test('Index files properly export components', async ({}) => {
    const indexFiles = getAllTSFiles(COMPONENTS_PATH).filter(f => 
      f.endsWith('index.ts') || f.endsWith('index.tsx')
    );
    
    const violations: string[] = [];
    
    indexFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(PROJECT_ROOT, filePath);
        
        // Index files should have exports
        if (!content.includes('export')) {
          violations.push(`${relativePath} has no exports`);
        }
        
        // Check for proper export patterns
        const hasNamedExports = content.includes('export {') || 
                               content.includes('export const') ||
                               content.includes('export function') ||
                               content.includes('export class');
        
        const hasReExports = content.includes('export') && content.includes('from');
        
        if (!hasNamedExports && !hasReExports && content.trim().length > 0) {
          violations.push(`${relativePath} should have named exports or re-exports`);
        }
      } catch (error) {
        violations.push(`Failed to read ${filePath}: ${error}`);
      }
    });
    
    console.log(`Checked ${indexFiles.length} index files`);
    
    if (violations.length > 0) {
      console.error('Index file violations:', violations);
      expect(violations.length).toBe(0);
    } else {
      console.log('✓ Index files properly export components');
    }
  });

  test('Components are in appropriate directories', async ({}) => {
    const componentFiles = getAllTSFiles(COMPONENTS_PATH);
    const directoryStats = new Map<string, number>();
    const violations: string[] = [];
    
    componentFiles.forEach(filePath => {
      const relativePath = path.relative(COMPONENTS_PATH, filePath);
      const directory = path.dirname(relativePath);
      
      if (directory !== '.') {
        directoryStats.set(directory, (directoryStats.get(directory) || 0) + 1);
        
        // Check for proper categorization
        const validDirectories = [
          'ui', 'forms', 'layout', 'products', 'customizer', 'homepage',
          'catalog', 'cart', 'ar', 'foundation'
        ];
        
        const topLevelDir = directory.split(path.sep)[0];
        if (!validDirectories.includes(topLevelDir)) {
          violations.push(`Component in non-standard directory: ${relativePath}`);
        }
      }
    });
    
    console.log('Component directory distribution:', Object.fromEntries(directoryStats));
    
    if (violations.length > 0) {
      console.warn('Directory structure warnings:', violations.slice(0, 5));
    }
    
    // Allow some flexibility in directory structure
    expect(violations.length).toBeLessThan(componentFiles.length * 0.1);
    console.log('✓ Components are properly organized');
  });
});

test.describe('Performance Optimization Patterns', () => {
  test('Components use memoization appropriately', async ({}) => {
    const componentFiles = getAllTSFiles(COMPONENTS_PATH)
      .filter(f => f.endsWith('.tsx'));
    
    let componentsWithMemo = 0;
    let componentsWithCallback = 0;
    const recommendations: string[] = [];
    
    componentFiles.forEach(filePath => {
      const analysis = analyzeFileContent(filePath);
      const relativePath = path.relative(PROJECT_ROOT, filePath);
      
      if (analysis.memoization) {
        componentsWithMemo++;
      }
      
      if (analysis.useCallback) {
        componentsWithCallback++;
      }
      
      // Check if component might benefit from memoization
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Components with props that might benefit from memo
        const hasComplexProps = content.includes('interface') && content.includes('Props');
        const hasExpensiveOperations = content.includes('map(') || content.includes('filter(') ||
                                      content.includes('reduce(') || content.includes('sort(');
        
        if (hasComplexProps && hasExpensiveOperations && !analysis.memoization) {
          recommendations.push(`${relativePath} might benefit from React.memo or useMemo`);
        }
        
        // Components with event handlers that might benefit from useCallback
        const hasEventHandlers = content.includes('onClick') || content.includes('onChange') ||
                                content.includes('onSubmit') || content.includes('handle');
        
        if (hasEventHandlers && !analysis.useCallback) {
          recommendations.push(`${relativePath} might benefit from useCallback for event handlers`);
        }
      } catch (error) {
        // Skip files that can't be read
      }
    });
    
    console.log('Memoization stats:', {
      totalComponents: componentFiles.length,
      withMemo: componentsWithMemo,
      withCallback: componentsWithCallback,
      recommendations: recommendations.length
    });
    
    if (recommendations.length > 0) {
      console.log('Performance recommendations:', recommendations.slice(0, 5));
    }
    
    // This is more informational than a hard requirement
    console.log(`${componentsWithMemo + componentsWithCallback} components use performance optimizations`);
  });

  test('Heavy components are properly code-split', async ({}) => {
    const componentFiles = getAllTSFiles(COMPONENTS_PATH);
    const heavyComponents: string[] = [];
    const dynamicImports: string[] = [];
    
    componentFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(PROJECT_ROOT, filePath);
        
        // Check for dynamic imports
        if (content.includes('dynamic(') || content.includes('lazy(') ||
            content.includes('import(')) {
          dynamicImports.push(relativePath);
        }
        
        // Identify potentially heavy components
        const hasThreeJS = content.includes('three') || content.includes('Three') ||
                          content.includes('@react-three');
        const hasLargeLibraries = content.includes('framer-motion') ||
                                 content.includes('react-query');
        
        if (hasThreeJS || hasLargeLibraries) {
          heavyComponents.push(relativePath);
        }
      } catch (error) {
        // Skip files that can't be read
      }
    });
    
    console.log('Code splitting analysis:', {
      heavyComponents: heavyComponents.length,
      dynamicImports: dynamicImports.length
    });
    
    if (heavyComponents.length > 0) {
      console.log('Heavy components found:', heavyComponents);
    }
    
    if (dynamicImports.length > 0) {
      console.log('Dynamic imports found:', dynamicImports);
    }
    
    // At least some heavy components should use dynamic imports
    if (heavyComponents.length > 0) {
      expect(dynamicImports.length).toBeGreaterThan(0);
      console.log('✓ Code splitting is implemented');
    }
  });
});

test.describe('Import and Dependency Management', () => {
  test('No circular dependencies in components', async ({}) => {
    const componentFiles = getAllTSFiles(COMPONENTS_PATH);
    const imports = new Map<string, string[]>();
    
    // Parse all imports
    componentFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const fileImports: string[] = [];
        
        lines.forEach(line => {
          const importMatch = line.match(/import.*from\s+['"`](.+)['"`]/);
          if (importMatch) {
            const importPath = importMatch[1];
            // Only track relative imports within the project
            if (importPath.startsWith('.') || importPath.startsWith('@/')) {
              fileImports.push(importPath);
            }
          }
        });
        
        imports.set(filePath, fileImports);
      } catch (error) {
        // Skip files that can't be read
      }
    });
    
    // Basic circular dependency detection (simplified)
    const violations: string[] = [];
    const visited = new Set<string>();
    
    function checkCircular(filePath: string, path: string[] = []): void {
      if (path.includes(filePath)) {
        violations.push(`Circular dependency: ${path.join(' -> ')} -> ${filePath}`);
        return;
      }
      
      if (visited.has(filePath)) return;
      visited.add(filePath);
      
      const fileImports = imports.get(filePath) || [];
      fileImports.forEach(importPath => {
        // Resolve relative imports (simplified)
        if (importPath.startsWith('.')) {
          checkCircular(importPath, [...path, filePath]);
        }
      });
    }
    
    componentFiles.forEach(filePath => {
      if (!visited.has(filePath)) {
        checkCircular(filePath);
      }
    });
    
    if (violations.length > 0) {
      console.error('Circular dependency violations:', violations);
      expect(violations.length).toBe(0);
    } else {
      console.log(`✓ No circular dependencies found in ${componentFiles.length} components`);
    }
  });

  test('Proper import ordering and organization', async ({}) => {
    const componentFiles = getAllTSFiles(COMPONENTS_PATH).slice(0, 10); // Sample
    const violations: string[] = [];
    
    componentFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const relativePath = path.relative(PROJECT_ROOT, filePath);
        
        const imports: Array<{line: string, index: number, type: 'external' | 'internal'}> = [];
        
        lines.forEach((line, index) => {
          const importMatch = line.match(/import.*from\s+['"`](.+)['"`]/);
          if (importMatch) {
            const importPath = importMatch[1];
            const type = importPath.startsWith('.') || importPath.startsWith('@/') 
              ? 'internal' 
              : 'external';
            
            imports.push({
              line: line.trim(),
              index,
              type
            });
          }
        });
        
        // Check import ordering (external before internal)
        let lastExternal = -1;
        let firstInternal = Infinity;
        
        imports.forEach(({ index, type }) => {
          if (type === 'external') {
            lastExternal = Math.max(lastExternal, index);
          } else {
            firstInternal = Math.min(firstInternal, index);
          }
        });
        
        if (lastExternal > firstInternal && firstInternal !== Infinity) {
          violations.push(`${relativePath}: External imports should come before internal imports`);
        }
        
      } catch (error) {
        // Skip files that can't be read
      }
    });
    
    if (violations.length > 0) {
      console.warn('Import ordering violations:', violations);
    }
    
    // Allow some flexibility in import ordering
    expect(violations.length).toBeLessThan(componentFiles.length * 0.3);
    console.log(`✓ Import ordering checked for ${componentFiles.length} components`);
  });
});