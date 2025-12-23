#!/usr/bin/env ts-node

/**
 * UI Component Audit Script
 *
 * Generates Docs/UI_COMPONENT_AUDIT.md by statically analysing the component usage graph.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

type SourceType = 'local' | 'external';

type ImportInfo = {
  specifier: string;
  importKind: 'default' | 'named' | 'namespace';
  importedName: string;
  localName: string;
  sourceType: SourceType;
  resolvedPath?: string;
};

type ComponentUsage = {
  componentName: string;
  key: string;
  sourceType: SourceType;
  importSpecifiers: Set<string>;
  importPaths: Set<string>;
  firstSeenFile: string;
  firstSeenLine: number;
  props: Set<string>;
  a11yProps: Set<string>;
  tailwindClasses: Map<string, number>;
  files: Set<string>;
};

type LocalComponentExport = {
  name: string;
  file: string;
  isDefault: boolean;
  exportNode: ts.Node;
};

type FileInfo = {
  path: string;
  isClientComponent: boolean;
  usedComponentKeys: Set<string>;
};

const REPO_ROOT = path.resolve(__dirname, '..');
const SRC_ROOT = path.join(REPO_ROOT, 'src');
const DOCS_PATH = path.join(REPO_ROOT, 'Docs');
const REPORT_PATH = path.join(DOCS_PATH, 'UI_COMPONENT_AUDIT.md');

const IGNORED_SEGMENTS = new Set([
  `${path.sep}node_modules${path.sep}`,
  `${path.sep}.next${path.sep}`,
  `${path.sep}dist${path.sep}`,
  `${path.sep}build${path.sep}`,
  `${path.sep}coverage${path.sep}`,
  `${path.sep}.turbo${path.sep}`,
  `${path.sep}.vercel${path.sep}`,
  `${path.sep}archive${path.sep}`,
  `${path.sep}Docs${path.sep}`,
]);

const componentUsageMap = new Map<string, ComponentUsage>();
const localComponentExports = new Map<string, LocalComponentExport>();
const fileInfoMap = new Map<string, FileInfo>();
const tailwindClassCounts = new Map<string, number>();

function isInScope(fileName: string): boolean {
  if (!fileName.startsWith(SRC_ROOT)) return false;
  let blocked = false;
  IGNORED_SEGMENTS.forEach((segment) => {
    if (fileName.includes(segment)) {
      blocked = true;
    }
  });
  if (blocked) return false;
  return /\.(t|j)sx?$/.test(fileName);
}

function normalizePath(fileName: string): string {
  return fileName.replace(REPO_ROOT, '').replace(/^[\\/]/, '').split(path.sep).join('/');
}

function ensureDocsFolder() {
  if (!fs.existsSync(DOCS_PATH)) {
    fs.mkdirSync(DOCS_PATH, { recursive: true });
  }
}

function loadTsConfig(): {
  options: ts.CompilerOptions;
  fileNames: string[];
  projectReferences?: readonly ts.ProjectReference[];
} {
  const configPath = ts.findConfigFile(REPO_ROOT, ts.sys.fileExists, 'tsconfig.json');
  if (!configPath) {
    throw new Error('Unable to find tsconfig.json at repository root');
  }
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  if (configFile.error) {
    throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, os.EOL));
  }
  const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));
  return {
    options: parsed.options,
    fileNames: parsed.fileNames.filter(isInScope),
    projectReferences: parsed.projectReferences,
  };
}

const { options: compilerOptions, fileNames } = loadTsConfig();
const program = ts.createProgram({
  rootNames: fileNames,
  options: { ...compilerOptions, noEmit: true },
});

function collectImports(sourceFile: ts.SourceFile): Map<string, ImportInfo> {
  const imports = new Map<string, ImportInfo>();
  const statements = sourceFile.statements;
  for (let i = 0; i < statements.length; i += 1) {
    const statement = statements[i];
    if (!ts.isImportDeclaration(statement) || !statement.importClause) continue;
    const specifier = (statement.moduleSpecifier as ts.StringLiteral).text;
    const resolved = resolveImport(specifier, sourceFile.fileName);
    const sourceType: SourceType =
      resolved && resolved.resolvedPath && resolved.resolvedPath.includes('node_modules')
        ? 'external'
        : specifier.startsWith('.') || specifier.startsWith('@/') || resolved?.resolvedPath
          ? 'local'
          : 'external';

    if (statement.importClause.name) {
      imports.set(statement.importClause.name.text, {
        specifier,
        importKind: 'default',
        importedName: 'default',
        localName: statement.importClause.name.text,
        sourceType,
        resolvedPath: resolved?.resolvedPath,
      });
    }

    if (statement.importClause.namedBindings) {
      if (ts.isNamespaceImport(statement.importClause.namedBindings)) {
        const binding = statement.importClause.namedBindings;
        imports.set(binding.name.text, {
          specifier,
          importKind: 'namespace',
          importedName: '*',
          localName: binding.name.text,
          sourceType,
          resolvedPath: resolved?.resolvedPath,
        });
      } else if (ts.isNamedImports(statement.importClause.namedBindings)) {
        statement.importClause.namedBindings.elements.forEach((element: ts.ImportSpecifier) => {
          const local = element.name.text;
          const importedName = element.propertyName ? element.propertyName.text : local;
          imports.set(local, {
            specifier,
            importKind: 'named',
            importedName,
            localName: local,
            sourceType,
            resolvedPath: resolved?.resolvedPath,
          });
        });
      }
    }
  }
  return imports;
}

function resolveImport(
  specifier: string,
  containingFile: string,
): { resolvedPath?: string } | undefined {
  const { resolvedModule } = ts.resolveModuleName(
    specifier,
    containingFile,
    compilerOptions,
    ts.sys,
  );
  if (resolvedModule && resolvedModule.resolvedFileName) {
    return { resolvedPath: resolvedModule.resolvedFileName };
  }
  return undefined;
}

function recordComponentUsage(params: {
  componentName: string;
  sourceType: SourceType;
  resolvedPath?: string;
  importSpecifier?: string;
  importPathForDisplay?: string;
  sourceFile: ts.SourceFile;
  node: ts.JsxOpeningLikeElement;
  props: string[];
  a11yProps: string[];
  tailwindClasses: string[];
}) {
  const {
    componentName,
    sourceType,
    resolvedPath,
    importSpecifier,
    importPathForDisplay,
    sourceFile,
    node,
    props,
    a11yProps,
    tailwindClasses,
  } = params;

  const filePath = normalizePath(sourceFile.fileName);
  const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
  const baseKey =
    resolvedPath && !resolvedPath.includes('node_modules')
      ? `local:${normalizePath(resolvedPath)}:${componentName}`
      : `${sourceType}:${importSpecifier ?? resolvedPath ?? componentName}:${componentName}`;

  let usage = componentUsageMap.get(baseKey);
  if (!usage) {
    usage = {
      componentName,
      key: baseKey,
      sourceType,
      importSpecifiers: new Set(),
      importPaths: new Set(),
      firstSeenFile: filePath,
      firstSeenLine: line,
      props: new Set(),
      a11yProps: new Set(),
      tailwindClasses: new Map(),
      files: new Set(),
    };
    componentUsageMap.set(baseKey, usage);
  }
  const target = usage;

  if (importSpecifier) target.importSpecifiers.add(importSpecifier);
  if (importPathForDisplay) target.importPaths.add(importPathForDisplay);

  target.files.add(filePath);

  if (
    line < target.firstSeenLine ||
    (line === target.firstSeenLine && filePath.localeCompare(target.firstSeenFile) < 0)
  ) {
    target.firstSeenLine = line;
    target.firstSeenFile = filePath;
  }

  props.forEach((prop) => target.props.add(prop));
  a11yProps.forEach((prop) => target.a11yProps.add(prop));
  tailwindClasses.forEach((cls) => {
    const current = target.tailwindClasses.get(cls) ?? 0;
    target.tailwindClasses.set(cls, current + 1);
    const total = tailwindClassCounts.get(cls) ?? 0;
    tailwindClassCounts.set(cls, total + 1);
  });

  const fileInfo = fileInfoMap.get(filePath) ?? {
    path: filePath,
    isClientComponent: isClientComponent(sourceFile),
    usedComponentKeys: new Set<string>(),
  };
  fileInfo.usedComponentKeys.add(baseKey);
  fileInfoMap.set(filePath, fileInfo);
}

function isClientComponent(sourceFile: ts.SourceFile): boolean {
  for (let i = 0; i < sourceFile.statements.length; i += 1) {
    const statement = sourceFile.statements[i];
    if (
      ts.isExpressionStatement(statement) &&
      ts.isStringLiteral(statement.expression) &&
      statement.expression.text === 'use client'
    ) {
      return true;
    }
    if (!ts.isNotEmittedStatement(statement)) {
      break;
    }
  }
  return false;
}

function collectLocalComponentDeclarations(sourceFile: ts.SourceFile) {
  const filePath = normalizePath(sourceFile.fileName);

  function registerLocalComponent(name: string, node: ts.Node, isExported: boolean, isDefault: boolean) {
    if (!/^[A-Z]/.test(name)) return;
    if (isExported) {
      localComponentExports.set(`${filePath}#${name}${isDefault ? ':default' : ''}`, {
        name,
        file: filePath,
        isDefault,
        exportNode: node,
      });
    }
  }

  function visit(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) && node.name) {
      const name = node.name.text;
      const isExported = node.modifiers?.some(
        (m) => m.kind === ts.SyntaxKind.ExportKeyword || m.kind === ts.SyntaxKind.DefaultKeyword,
      );
      const isDefault = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword) ?? false;
      registerLocalComponent(name, node, !!isExported, isDefault);
    }

    if (ts.isVariableStatement(node)) {
      const isExported = node.modifiers?.some(
        (m) => m.kind === ts.SyntaxKind.ExportKeyword || m.kind === ts.SyntaxKind.DefaultKeyword,
      );
      const isDefault =
        node.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword) ?? false;
      if (isExported) {
        node.declarationList.declarations.forEach((decl) => {
          if (ts.isIdentifier(decl.name)) {
            registerLocalComponent(decl.name.text, decl, isExported, isDefault);
          }
        });
      }
    }

    if (ts.isExportAssignment(node)) {
      const expr = node.expression;
      if (ts.isIdentifier(expr) && /^[A-Z]/.test(expr.text)) {
        registerLocalComponent(expr.text, node, true, true);
      }
    }

    ts.forEachChild(node, visit);
  }

  ts.forEachChild(sourceFile, visit);
}

function extractClassNames(initializer?: ts.Expression | ts.StringLiteralLike): string[] {
  if (!initializer) return [];

  if (ts.isStringLiteralLike(initializer)) {
    return initializer.text
      .split(/\s+/)
      .map((cls) => cls.trim())
      .filter(Boolean);
  }

  if (ts.isJsxExpression(initializer) && initializer.expression) {
    const expr = initializer.expression;
    if (ts.isStringLiteralLike(expr)) {
      return expr.text
        .split(/\s+/)
        .map((cls) => cls.trim())
        .filter(Boolean);
    }
    if (ts.isNoSubstitutionTemplateLiteral(expr)) {
      return expr.text
        .split(/\s+/)
        .map((cls) => cls.trim())
        .filter(Boolean);
    }
    if (ts.isTemplateExpression(expr)) {
      const textParts = [expr.head.text, ...expr.templateSpans.map((span) => span.literal.text)];
      return textParts
        .join(' ')
        .split(/\s+/)
        .map((cls) => cls.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function analyseSourceFile(sourceFile: ts.SourceFile) {
  if (!isInScope(sourceFile.fileName) || sourceFile.isDeclarationFile) return;

  const imports = collectImports(sourceFile);
  collectLocalComponentDeclarations(sourceFile);

  const normalizedFilePath = normalizePath(sourceFile.fileName);
  if (!fileInfoMap.has(normalizedFilePath)) {
    fileInfoMap.set(normalizedFilePath, {
      path: normalizedFilePath,
      isClientComponent: isClientComponent(sourceFile),
      usedComponentKeys: new Set<string>(),
    });
  }

  function visit(node: ts.Node) {
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const opening = node;
      const tagName = opening.tagName;

      let componentName: string | undefined;
      let lookupName: string | undefined;
      let namespaceSuffix: string | undefined;

      if (ts.isIdentifier(tagName)) {
        componentName = tagName.text;
        lookupName = tagName.text;
      } else if (ts.isPropertyAccessExpression(tagName)) {
        const parts: string[] = [];
        let expr: ts.Expression = tagName;
        while (ts.isPropertyAccessExpression(expr)) {
          parts.unshift(expr.name.text);
          expr = expr.expression;
        }
        if (ts.isIdentifier(expr)) {
          parts.unshift(expr.text);
          lookupName = expr.text;
          namespaceSuffix = parts.slice(1).join('.');
          componentName = parts.join('.');
        }
      } else if (ts.isJsxNamespacedName(tagName)) {
        componentName = `${tagName.namespace.text}:${tagName.name.text}`;
        lookupName = tagName.namespace.text;
      }

      if (!componentName || !lookupName) return;
      if (!/^[A-Z]/.test(componentName)) return;

      const importInfo = imports.get(lookupName);
      const props: string[] = [];
      const a11yProps: string[] = [];
      const tailwindClasses: string[] = [];

      opening.attributes.properties.forEach((attr) => {
        if (ts.isJsxAttribute(attr)) {
          const attrNameNode = attr.name;
          const attrName = ts.isIdentifier(attrNameNode)
            ? attrNameNode.text
            : `${attrNameNode.namespace.text}:${attrNameNode.name.text}`;
          props.push(attrName);
          if (attrName.startsWith('aria-') || attrName === 'role' || attrName === 'alt') {
            a11yProps.push(attrName);
          }
          if (attrName === 'className' && attr.initializer) {
            tailwindClasses.push(...extractClassNames(attr.initializer as any));
          }
        } else if (ts.isJsxSpreadAttribute(attr)) {
          props.push('...spread');
        }
      });

      const importPathForDisplay =
        importInfo?.specifier ??
        (importInfo?.resolvedPath ? normalizePath(importInfo.resolvedPath) : undefined);

      const resolvedPath =
        namespaceSuffix && importInfo?.resolvedPath
          ? importInfo.resolvedPath
          : importInfo?.resolvedPath;

      recordComponentUsage({
        componentName,
        sourceType: importInfo?.sourceType ?? 'local',
        resolvedPath,
        importSpecifier: importInfo?.specifier,
        importPathForDisplay,
        sourceFile,
        node: opening,
        props,
        a11yProps,
        tailwindClasses,
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

program.getSourceFiles().forEach((sourceFile) => {
  analyseSourceFile(sourceFile);
});

type PackageUsage = {
  version: string | null;
  components: Set<string>;
  usageCount: number;
  notes: Set<string>;
};

const packageJson = JSON.parse(
  fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'),
) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

function getPackageVersion(pkg: string): string | null {
  return (
    packageJson.dependencies?.[pkg] ??
    packageJson.devDependencies?.[pkg] ??
    null
  );
}

const externalPackageUsage = new Map<string, PackageUsage>();

function resolvePackageNameFromSpecifier(specifier: string): string {
  if (specifier.startsWith('@')) {
    const parts = specifier.split('/');
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
  }
  const first = specifier.split('/')[0];
  return first;
}

componentUsageMap.forEach((usage) => {
  if (usage.sourceType !== 'external') return;
  const specifiers = Array.from(usage.importPaths.values());
  if (specifiers.length === 0) return;
  const pkgName = resolvePackageNameFromSpecifier(specifiers[0]);
  const pkg = externalPackageUsage.get(pkgName) ?? {
    version: getPackageVersion(pkgName),
    components: new Set<string>(),
    usageCount: 0,
    notes: new Set<string>(),
  };
  pkg.components.add(usage.componentName);
  pkg.usageCount += usage.files.size;
  externalPackageUsage.set(pkgName, pkg);
});

const usedLocalKeys = new Set<string>();
componentUsageMap.forEach((usage) => {
  if (usage.sourceType !== 'local') return;
  usage.importPaths.forEach((importPath) => {
    if (importPath.startsWith('.')) return;
  });
  usedLocalKeys.add(usage.key);
});

function determineUnusedComponents(): LocalComponentExport[] {
  const unused: LocalComponentExport[] = [];
  localComponentExports.forEach((exportInfo) => {
    if (shouldSkipUnusedCheck(exportInfo)) return;
    const key = `local:${exportInfo.file}:${exportInfo.name}`;
    const keyDefault = `local:${exportInfo.file}:${exportInfo.name}`;
    if (!usedLocalKeys.has(key) && !usedLocalKeys.has(`${key}:default`) && !usedLocalKeys.has(keyDefault)) {
      unused.push(exportInfo);
    }
  });
  return unused;
}

function shouldSkipUnusedCheck(exportInfo: LocalComponentExport): boolean {
  const targetPath = exportInfo.file;
  if (!targetPath.startsWith('src/app/')) return false;
  const fileName = path.basename(targetPath);
  const ROUTE_FILES = new Set([
    'page.tsx',
    'page.ts',
    'layout.tsx',
    'layout.ts',
    'template.tsx',
    'template.ts',
    'error.tsx',
    'error.ts',
    'not-found.tsx',
    'not-found.ts',
    'loading.tsx',
    'loading.ts',
    'route.ts',
    'route.tsx',
  ]);
  return ROUTE_FILES.has(fileName);
}

const unusedComponents = determineUnusedComponents();

function summariseTailwindUsage(): { className: string; count: number }[] {
  const entries = Array.from(tailwindClassCounts.entries());
  entries.sort((a, b) => {
    if (b[1] === a[1]) return a[0].localeCompare(b[0]);
    return b[1] - a[1];
  });
  return entries.slice(0, 40).map(([className, count]) => ({ className, count }));
}

function loadTailwindConfig(): Record<string, any> | null {
  const configCandidates = [
    path.join(REPO_ROOT, 'tailwind.config.js'),
    path.join(REPO_ROOT, 'tailwind.config.cjs'),
    path.join(REPO_ROOT, 'tailwind.config.ts'),
  ];
  for (let i = 0; i < configCandidates.length; i += 1) {
    const candidate = configCandidates[i];
    if (!fs.existsSync(candidate)) continue;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const config = require(candidate);
      return config?.default ?? config;
    } catch (error) {
      console.warn(`Unable to load Tailwind config from ${candidate}: ${(error as Error).message}`);
    }
  }
  return null;
}

const tailwindConfig = loadTailwindConfig();

function collectCssVariables(): Set<string> {
  const results = new Set<string>();
  const stylesDir = path.join(SRC_ROOT, 'styles');
  if (!fs.existsSync(stylesDir)) return results;
  const stack: string[] = [stylesDir];
  while (stack.length) {
    const current = stack.pop()!;
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      const children = fs.readdirSync(current);
      for (let i = 0; i < children.length; i += 1) {
        const entry = children[i];
        if (entry.startsWith('.')) continue;
        stack.push(path.join(current, entry));
      }
    } else if (stat.isFile() && /\.(css|scss|sass|pcss)$/i.test(current)) {
      const content = fs.readFileSync(current, 'utf8');
      const matches = content.match(/--[a-zA-Z0-9-_]+/g);
      if (matches) {
        matches.forEach((match) => results.add(match));
      }
    }
  }
  return results;
}

const cssVariables = collectCssVariables();

function formatProps(props: Set<string>): string {
  if (props.size === 0) return '—';
  const sorted = Array.from(props).sort((a, b) => a.localeCompare(b));
  return sorted.join(', ');
}

function formatTailwindNotes(map: Map<string, number>): string {
  if (map.size === 0) return '—';
  const sorted = Array.from(map.entries()).sort((a, b) => {
    if (b[1] === a[1]) return a[0].localeCompare(b[0]);
    return b[1] - a[1];
  });
  const top = sorted.slice(0, 5).map(([cls, count]) => `${cls} (${count})`);
  return top.join(', ');
}

function formatA11yNotes(set: Set<string>): string {
  if (set.size === 0) return 'none observed';
  return Array.from(set).sort().join(', ');
}

function renderComponentInventoryUsed(): string {
  const rows: string[] = [];
  const usages = Array.from(componentUsageMap.values());
  usages.sort((a, b) => a.componentName.localeCompare(b.componentName));
  for (let i = 0; i < usages.length; i += 1) {
    const usage = usages[i];
    const sourceLabel = usage.sourceType === 'local' ? 'local' : 'library';
    const importPaths = usage.importPaths.size
      ? Array.from(usage.importPaths)
          .sort()
          .map((p) => `\`${p}\``)
          .join('<br>')
      : '—';
    rows.push(
      `| ${usage.componentName} | ${sourceLabel} | ${importPaths} | \`${usage.firstSeenFile}:${usage.firstSeenLine}\` | ${formatProps(usage.props)} | ${formatTailwindNotes(usage.tailwindClasses)} | ${formatA11yNotes(usage.a11yProps)} |`,
    );
  }

  if (rows.length === 0) {
    rows.push('| — | — | — | — | — | — | — |');
  }

  return [
    '| Component | Source (local/lib) | Import Path(s) | First Seen In (file:line) | Props Observed | Tailwind/CSS Notes | A11y Notes |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...rows,
  ].join('\n');
}

function renderUnusedComponents(): string {
  if (unusedComponents.length === 0) {
    return [
      '| Component | Declared At | Why Flagged (no imports, imported but not rendered, test-only) | Suggested Action |',
      '| --- | --- | --- | --- |',
      '| — | — | — | — |',
    ].join('\n');
  }

  const rows = unusedComponents
    .map((item) => {
      const reason = 'No JSX usage detected across app';
      const action = 'Confirm if safe to remove or wire into routes';
      return `| ${item.name} | \`${item.file}\` | ${reason} | ${action} |`;
    })
    .sort((a, b) => a.localeCompare(b));

  return [
    '| Component | Declared At | Why Flagged (no imports, imported but not rendered, test-only) | Suggested Action |',
    '| --- | --- | --- | --- |',
    ...rows,
  ].join('\n');
}

function renderExternalPackages(): string {
  const entries = Array.from(externalPackageUsage.entries());
  entries.sort((a, b) => a[0].localeCompare(b[0]));
  if (entries.length === 0) {
    return [
      '| Package | Version | Components/Icons Used | Approx Usage Count | Notes/Alternatives |',
      '| --- | --- | --- | --- | --- |',
      '| — | — | — | — | — |',
    ].join('\n');
  }

  const rows = entries.map(([pkg, info]) => {
    const components = Array.from(info.components).sort().join(', ');
    return `| ${pkg} | ${info.version ?? '—'} | ${components || '—'} | ${info.usageCount} | ${Array.from(info.notes).join('; ') || '—'} |`;
  });

  return [
    '| Package | Version | Components/Icons Used | Approx Usage Count | Notes/Alternatives |',
    '| --- | --- | --- | --- | --- |',
    ...rows,
  ].join('\n');
}

function buildPatternsSummary(): string {
  const categories: Record<string, ComponentUsage[]> = {
    Button: [],
    Link: [],
    Card: [],
    Modal: [],
    Form: [],
    List: [],
    Badge: [],
    Input: [],
    Dialog: [],
    Navigation: [],
  };

  componentUsageMap.forEach((usage) => {
    Object.entries(categories).forEach(([category, list]) => {
      if (usage.componentName.toLowerCase().includes(category.toLowerCase())) {
        list.push(usage);
      }
    });
  });

  const lines: string[] = [];
  Object.entries(categories).forEach(([category, list]) => {
    if (list.length === 0) return;
    const details = list
      .map((usage) => {
        const importPath = usage.importPaths.size
          ? Array.from(usage.importPaths).sort()[0]
          : usage.sourceType === 'external'
            ? 'external'
            : normalizePath(usage.firstSeenFile);
        return `${usage.componentName} (${importPath})`;
      })
      .join('; ');
    lines.push(`- **${category} patterns (${list.length})**: ${details}`);
  });

  if (lines.length === 0) {
    return '- No major UI pattern clusters detected (likely relying on primitive HTML elements).';
  }
  return lines.join('\n');
}

type RouteInfo = {
  route: string;
  file: string;
  isClient: boolean;
  components: string[];
};

function collectAppRoutes(): RouteInfo[] {
  const routes: RouteInfo[] = [];
  const appDir = path.join(SRC_ROOT, 'app');
  if (!fs.existsSync(appDir)) return routes;

  const routeFiles = ts.sys.readDirectory(appDir, ['.tsx', '.ts'], [], ['**/page.tsx', '**/page.ts']);
  routeFiles.forEach((file) => {
    const normalized = normalizePath(file);
    const routePath = normalized.replace(/^src\/app/, '').replace(/\/page\.(tsx|ts)$/, '');
    const route = routePath === '' ? '/' : routePath;
    const fileInfo = fileInfoMap.get(normalized);
    const usedComponents = fileInfo ? Array.from(fileInfo.usedComponentKeys) : [];
    const componentNames = usedComponents
      .map((key) => componentUsageMap.get(key)?.componentName ?? key.split(':').pop() ?? '')
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    routes.push({
      route,
      file: normalized,
      isClient: fileInfo?.isClientComponent ?? false,
      components: Array.from(new Set(componentNames)),
    });
  });
  routes.sort((a, b) => a.route.localeCompare(b.route));
  return routes;
}

const routes = collectAppRoutes();

function renderRoutes(): string {
  if (routes.length === 0) {
    return '- No Next.js pages detected under `src/app`.';
  }
  return routes
    .map((route) => {
      const components = route.components.length ? route.components.join(', ') : '—';
      const type = route.isClient ? 'client' : 'server';
      return `- ${route.route} → ${components} _(source: \`${route.file}\`, ${type})_`;
    })
    .join('\n');
}

const totalClientFiles = Array.from(fileInfoMap.values()).filter((file) => file.isClientComponent)
  .length;
const totalServerFiles = fileInfoMap.size - totalClientFiles;

function detectA11yRisks(): string[] {
  const risks: string[] = [];
  componentUsageMap.forEach((usage) => {
    if (
      usage.props.has('onClick') ||
      usage.componentName.toLowerCase().includes('button') ||
      usage.componentName.toLowerCase().includes('toggle') ||
      usage.componentName.toLowerCase().includes('dialog') ||
      usage.componentName.toLowerCase().includes('dropdown')
    ) {
      if (usage.a11yProps.size === 0) {
        risks.push(
          `${usage.componentName} (first seen ${usage.firstSeenFile}:${usage.firstSeenLine}) has interactive props but no ARIA attributes.`,
        );
      }
    }
  });
  return risks.slice(0, 10);
}

const a11yRisks = detectA11yRisks();

function detectDuplicateComponents(): string[] {
  const duplicates: Record<string, Set<string>> = {};
  localComponentExports.forEach((exportInfo) => {
    duplicates[exportInfo.name] = duplicates[exportInfo.name] ?? new Set<string>();
    duplicates[exportInfo.name].add(exportInfo.file);
  });
  return Object.entries(duplicates)
    .filter(([, files]) => files.size > 1)
    .map(([name, files]) => `${name} declared in multiple files (${Array.from(files).join(', ')})`);
}

const duplicateComponentNotes = detectDuplicateComponents();

const filesScanned = fileInfoMap.size;
const componentsFound = componentUsageMap.size;
const unusedCount = unusedComponents.length;

function buildExecutiveSummary(): { bullets: string[]; healthScore: number; healthNotes: string[] } {
  const bullets: string[] = [];
  if (unusedComponents.length > 0) {
    bullets.push(`${unusedComponents.length} exported components look unused (see Section 3).`);
  }
  if (duplicateComponentNotes.length > 0) {
    bullets.push(`Component naming drift: ${duplicateComponentNotes.length} duplicated names across files.`);
  }
  if (a11yRisks.length > 0) {
    bullets.push(`Accessibility coverage gap: ${a11yRisks.length} interactive components without ARIA props.`);
  }
  if (bullets.length === 0) {
    bullets.push('Component usage graph is consistent; no critical duplicates detected.');
  }

  let healthScore = 82;
  const healthNotes: string[] = [];

  if (unusedComponents.length > 15) {
    healthScore -= 10;
    healthNotes.push('High number of unused exports increases maintenance burden.');
  } else if (unusedComponents.length > 0) {
    healthScore -= 4;
    healthNotes.push('Some unused component exports – prune or document.');
  }

  if (a11yRisks.length > 0) {
    healthScore -= Math.min(15, a11yRisks.length * 2);
    healthNotes.push('Interactive components missing aria/role hints.');
  }

  if (duplicateComponentNotes.length > 0) {
    healthScore -= 5;
    healthNotes.push('Multiple components share names, increasing confusion.');
  }

  if (tailwindClassCounts.size === 0) {
    healthNotes.push('Limited Tailwind class usage detected – verify parsing scope.');
  }

  if (healthNotes.length === 0) {
    healthNotes.push('Consistent component usage and styling patterns.');
  }

  healthScore = Math.max(0, Math.min(100, healthScore));

  return { bullets, healthScore, healthNotes };
}

const summary = buildExecutiveSummary();

type RiskEntry = {
  risk: string;
  files: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  recommendation: string;
};

function buildRiskRegister(): RiskEntry[] {
  const entries: RiskEntry[] = [];

  if (a11yRisks.length) {
    entries.push({
      risk: 'Missing aria roles on interactive components',
      files: a11yRisks.map((risk) => risk.match(/(.+?) \(first seen (.+?)\)/)?.[2] ?? '').join('; '),
      impact: 'high',
      effort: 'medium',
      recommendation: 'Add aria-label/role semantics to button/dialog primitives before release.',
    });
  }

  if (unusedComponents.length) {
    entries.push({
      risk: 'Unused exported components',
      files: unusedComponents.slice(0, 10).map((item) => `${item.file}#${item.name}`).join('; '),
      impact: 'medium',
      effort: 'low',
      recommendation: 'Archive or remove dead components to reduce bundle size.',
    });
  }

  if (duplicateComponentNotes.length) {
    entries.push({
      risk: 'Duplicated component names across directories',
      files: duplicateComponentNotes.join('; '),
      impact: 'medium',
      effort: 'medium',
      recommendation: 'Create shared primitives or consolidate naming conventions.',
    });
  }

  if (tailwindClassCounts.size > 45) {
    entries.push({
      risk: 'Tailwind class sprawl',
      files: 'Multiple components',
      impact: 'medium',
      effort: 'medium',
      recommendation: 'Consider extracting high-usage utility classes into tokens.',
    });
  }

  while (entries.length < 3) {
    entries.push({
      risk: 'Styling governance gap',
      files: '—',
      impact: 'low',
      effort: 'medium',
      recommendation: 'Document color/spacing tokens to lock future drift.',
    });
  }

  return entries.slice(0, 10);
}

const riskRegister = buildRiskRegister();

function renderRiskRegister(): string {
  const lines = [
    '| Risk | Files/Components | Impact | Effort | Recommended Fix |',
    '| --- | --- | --- | --- | --- |',
  ];
  riskRegister.forEach((entry) => {
    lines.push(
      `| ${entry.risk} | ${entry.files || '—'} | ${entry.impact} | ${entry.effort} | ${entry.recommendation} |`,
    );
  });
  return lines.join('\n');
}

function renderAppendix(): string {
  return [
    `- Files scanned: ${filesScanned}`,
    `- Components found: ${componentsFound}`,
    `- Unused exports: ${unusedCount}`,
    `- Tailwind classes tracked: ${tailwindClassCounts.size}`,
    `- Script ignored segments: ${Array.from(IGNORED_SEGMENTS).join(', ')}`,
    `- Limitations: does not evaluate runtime dynamic imports or conditional rendering.`,
  ].join('\n');
}

function renderDesignTokens(): string {
  const tailwindSummary = summariseTailwindUsage()
    .map((entry) => `  - \`${entry.className}\` (${entry.count})`)
    .join('\n');

  const extendConfig = tailwindConfig && tailwindConfig.theme && tailwindConfig.theme.extend ? tailwindConfig.theme.extend : {};
  const extendKeys = Object.keys(extendConfig).sort();

  const extendLines = extendKeys.length
    ? extendKeys
        .map((key) => {
          const value = extendConfig[key];
          const subKeys = value && typeof value === 'object' ? Object.keys(value).slice(0, 10) : [];
          return `  - ${key}: ${subKeys.join(', ') || 'custom values'}`;
        })
        .join('\n')
    : '  - No `theme.extend` entries detected or config failed to load.';

  const cssVars =
    cssVariables.size > 0
      ? Array.from(cssVariables)
          .sort()
          .map((v) => `  - ${v}`)
          .join('\n')
      : '  - No CSS variables detected under `app/styles`.';

  return [
    '- Tailwind class frequency:',
    tailwindSummary || '  - (none detected)',
    '- Tailwind `theme.extend` keys:',
    extendLines,
    '- CSS variables found:',
    cssVars,
    '- Dark mode usage:',
    tailwindClassCounts.has('dark') || Array.from(tailwindClassCounts.keys()).some((cls) =>
      cls.startsWith('dark:'),
    )
      ? '  - Dark variant classes detected (e.g., `dark:*`).'
      : '  - No dark: prefixed classes detected.',
  ].join('\n');
}

function renderAccessibilityReview(): string {
  const list = a11yRisks.length
    ? a11yRisks.map((risk) => `- ${risk}`).join('\n')
    : '- No explicit ARIA gaps detected via static analysis.';
  const observedAria = new Set<string>();
  componentUsageMap.forEach((usage) => {
    usage.a11yProps.forEach((prop) => {
      if (prop) observedAria.add(prop);
    });
  });
  const ariaSummary = Array.from(observedAria)
    .filter(Boolean)
    .sort()
    .join(', ') || 'none';
  return [
    list,
    `- Observed aria props: ${ariaSummary}`,
  ].join('\n');
}

function renderDuplicationAndDrift(): string {
  const lines: string[] = [];
  if (duplicateComponentNotes.length) {
    lines.push('- Duplicate component names:\n  - ' + duplicateComponentNotes.join('\n  - '));
  } else {
    lines.push('- No duplicate component names detected in exports.');
  }

  if (tailwindClassCounts.size > 40) {
    lines.push('- High diversity of Tailwind classes (top 40 listed in Section 6).');
  }

  return lines.join('\n');
}

function timestamp(): string {
  return new Date().toISOString();
}

function gitSha(): string {
  try {
    const raw = require('child_process')
      .execSync(`git -C "${REPO_ROOT}" rev-parse --short HEAD`, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
    return raw;
  } catch (error) {
    return 'UNKNOWN';
  }
}

const reportSections = [
  '# UI Component Audit (autogenerated)',
  `- Generated: ${timestamp()}`,
  `- Commit: ${gitSha()}`,
  `- Root: ${normalizePath(REPO_ROOT) || '.'}`,
  '',
  '## 1) Executive Summary',
  ...summary.bullets.map((bullet) => `- ${bullet}`),
  `- Quick health score: ${summary.healthScore} (context: ${summary.healthNotes.join('; ')})`,
  '',
  '## 2) Component Inventory (Used)',
  renderComponentInventoryUsed(),
  '',
  '## 3) Component Inventory (Unused / Dead)',
  renderUnusedComponents(),
  '',
  '## 4) External UI & Icon Dependencies',
  renderExternalPackages(),
  '',
  '## 5) Patterns & Variants',
  buildPatternsSummary(),
  '',
  '## 6) Styling Sources & Design Tokens',
  renderDesignTokens(),
  '',
  '## 7) Accessibility Review',
  renderAccessibilityReview(),
  '',
  '## 8) Routing & Rendering Surfaces',
  renderRoutes(),
  '',
  '## 9) Duplication & Drift',
  renderDuplicationAndDrift(),
  '',
  '## 10) Risk Register & Recommendations',
  renderRiskRegister(),
  '',
  '## 11) Appendix',
  renderAppendix(),
  '',
];

ensureDocsFolder();
fs.writeFileSync(REPORT_PATH, reportSections.join('\n'), 'utf8');

console.log(`UI component audit written to ${REPORT_PATH}`);
