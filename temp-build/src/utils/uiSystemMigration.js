"use strict";
/**
 * UI System Migration Utilities
 * CLAUDE_RULES compliant: Simple utilities for systematic UI migration
 *
 * Purpose: Standardize all UI elements to use Tailwind tokens as single source of truth
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePhaseCompletion = exports.needsTypographyMigration = exports.hasTypographyImports = exports.generateMigrationReport = exports.detectViolations = exports.migrateClassName = exports.spacingMigrationMap = exports.typographyMigrationPatterns = exports.colorMigrationMap = void 0;
// Color system migration mapping
/* eslint-disable no-restricted-syntax */
exports.colorMigrationMap = {
    // Gray colors to neutral system
    'text-gray-50': 'text-neutral-50',
    'text-gray-100': 'text-neutral-100',
    'text-gray-200': 'text-neutral-200',
    'text-gray-300': 'text-neutral-300',
    'text-gray-400': 'text-neutral-400',
    'text-gray-500': 'text-neutral-500',
    'text-gray-600': 'text-neutral-600',
    'text-gray-700': 'text-neutral-700',
    'text-gray-800': 'text-neutral-800',
    'text-gray-900': 'text-neutral-900',
    'bg-gray-50': 'bg-neutral-50',
    'bg-gray-100': 'bg-neutral-100',
    'bg-gray-200': 'bg-neutral-200',
    'bg-gray-300': 'bg-neutral-300',
    'bg-gray-400': 'bg-neutral-400',
    'bg-gray-500': 'bg-neutral-500',
    'bg-gray-600': 'bg-neutral-600',
    'bg-gray-700': 'bg-neutral-700',
    'bg-gray-800': 'bg-neutral-800',
    'bg-gray-900': 'bg-neutral-900',
    'border-gray-50': 'border-neutral-50',
    'border-gray-100': 'border-neutral-100',
    'border-gray-200': 'border-neutral-200',
    'border-gray-300': 'border-neutral-300',
    'border-gray-400': 'border-neutral-400',
    'border-gray-500': 'border-neutral-500',
    'border-gray-600': 'border-neutral-600',
    'border-gray-700': 'border-neutral-700',
    'border-gray-800': 'border-neutral-800',
    'border-gray-900': 'border-neutral-900',
    // Legacy aurora colors to neutral system
    'text-aurora-nav-muted': 'text-neutral-600',
    'text-aurora-nav-text': 'text-neutral-900',
    'bg-aurora-nav-surface': 'bg-neutral-50',
    'bg-aurora-nav-hover': 'bg-neutral-100',
    'border-aurora-nav-border': 'border-neutral-200',
    // Other legacy mappings
    'text-muted-foreground': 'text-neutral-600',
    'bg-muted': 'bg-neutral-100',
    'border-muted': 'border-neutral-200'
};
/* eslint-enable no-restricted-syntax */
// Typography migration patterns
exports.typographyMigrationPatterns = [
    {
        pattern: /<h1\s+className="([^"]*)"[^>]*>(.*?)<\/h1>/gs,
        replacement: function (match, classes, content) {
            var hasTextClasses = /text-\w+/.test(classes);
            if (hasTextClasses) {
                return "<H1>".concat(content, "</H1>");
            }
            return match; // Keep if no text classes
        }
    },
    {
        pattern: /<h2\s+className="([^"]*)"[^>]*>(.*?)<\/h2>/gs,
        replacement: function (match, classes, content) {
            var hasTextClasses = /text-\w+/.test(classes);
            if (hasTextClasses) {
                return "<H2>".concat(content, "</H2>");
            }
            return match;
        }
    },
    {
        pattern: /<h3\s+className="([^"]*)"[^>]*>(.*?)<\/h3>/gs,
        replacement: function (match, classes, content) {
            var hasTextClasses = /text-\w+/.test(classes);
            if (hasTextClasses) {
                return "<H3>".concat(content, "</H3>");
            }
            return match;
        }
    }
];
// Spacing migration patterns  
/* eslint-disable no-restricted-syntax */
exports.spacingMigrationMap = {
    'p-1': 'p-token-xs',
    'p-2': 'p-token-sm',
    'p-4': 'p-token-md',
    'p-6': 'p-token-lg',
    'p-8': 'p-token-xl',
    'p-12': 'p-token-2xl',
    'p-16': 'p-token-3xl',
    'p-24': 'p-token-4xl',
    'p-32': 'p-token-5xl',
    'm-1': 'm-token-xs',
    'm-2': 'm-token-sm',
    'm-4': 'm-token-md',
    'm-6': 'm-token-lg',
    'm-8': 'm-token-xl',
    'm-12': 'm-token-2xl',
    'm-16': 'm-token-3xl',
    'm-24': 'm-token-4xl',
    'm-32': 'm-token-5xl',
    'gap-1': 'gap-token-xs',
    'gap-2': 'gap-token-sm',
    'gap-4': 'gap-token-md',
    'gap-6': 'gap-token-lg',
    'gap-8': 'gap-token-xl'
};
/* eslint-enable no-restricted-syntax */
/**
 * Migrate className string using provided mapping
 */
function migrateClassName(className, migrationMap) {
    if (migrationMap === void 0) { migrationMap = exports.colorMigrationMap; }
    var migrated = className;
    // Apply direct mappings
    Object.entries(migrationMap).forEach(function (_a) {
        var oldClass = _a[0], newClass = _a[1];
        var regex = new RegExp("\\b".concat(oldClass, "\\b"), 'g');
        migrated = migrated.replace(regex, newClass);
    });
    return migrated;
}
exports.migrateClassName = migrateClassName;
/**
 * Detect violations in className string
 */
function detectViolations(className) {
    var violations = [];
    // Check for gray colors
    if (/\b(text-gray-|bg-gray-|border-gray-)\d+\b/.test(className)) {
        violations.push('Uses deprecated gray-* colors instead of neutral-*');
    }
    // Check for legacy aurora classes  
    /* eslint-disable-next-line no-restricted-syntax */
    if (/\baurora-nav-/.test(className)) {
        /* eslint-disable-next-line no-restricted-syntax */
        violations.push('Uses legacy aurora-nav-* classes');
    }
    // Check for hardcoded arbitrary values
    if (/\[(#[0-9a-f]{6}|rgb\(|rgba\()/i.test(className)) {
        violations.push('Contains hardcoded color values instead of design tokens');
    }
    return violations;
}
exports.detectViolations = detectViolations;
/**
 * Generate migration report for a file content
 */
function generateMigrationReport(filePath, fileContent) {
    var classNameRegex = /className="([^"]*)"/g;
    var matches = Array.from(fileContent.matchAll(classNameRegex));
    var originalClasses = [];
    var migratedClasses = [];
    var violations = [];
    var warnings = [];
    matches.forEach(function (match) {
        var originalClassName = match[1];
        originalClasses.push(originalClassName);
        var migrated = migrateClassName(originalClassName);
        migratedClasses.push(migrated);
        var classViolations = detectViolations(originalClassName);
        violations.push.apply(violations, classViolations);
        // Check for potential issues
        if (originalClassName.includes('font-') && !originalClassName.includes('font-headline') && !originalClassName.includes('font-body')) {
            warnings.push("Manual font class detected: ".concat(originalClassName));
        }
    });
    return {
        filePath: filePath,
        originalClasses: originalClasses,
        migratedClasses: migratedClasses,
        violations: __spreadArray([], new Set(violations), true), // Remove duplicates
        warnings: __spreadArray([], new Set(warnings), true)
    };
}
exports.generateMigrationReport = generateMigrationReport;
/**
 * Check if imports include Typography components
 */
function hasTypographyImports(fileContent) {
    var typographyImportPattern = /import\s+{[^}]*\b(H1|H2|H3|H4|BodyText|MutedText)\b[^}]*}\s+from\s+['"]@\/components\/foundation\/Typography['"]/;
    return typographyImportPattern.test(fileContent);
}
exports.hasTypographyImports = hasTypographyImports;
/**
 * Check if file needs Typography component migration
 */
function needsTypographyMigration(fileContent) {
    var issues = [];
    // Check for raw heading tags with classes
    if (/<h[1-6]\s+className=/.test(fileContent)) {
        issues.push('Has raw heading tags with className that should use Typography components');
    }
    // Check for paragraph tags with text styling
    if (/<p\s+className="[^"]*text-/.test(fileContent)) {
        issues.push('Has paragraph tags with text classes that should use BodyText component');
    }
    // Check for span tags with text styling
    if (/<span\s+className="[^"]*text-/.test(fileContent)) {
        issues.push('Has span tags with text classes that should use appropriate Typography component');
    }
    return issues;
}
exports.needsTypographyMigration = needsTypographyMigration;
/**
 * Validate phase completion
 */
function validatePhaseCompletion(phase, reports) {
    var violations = [];
    var warnings = [];
    reports.forEach(function (report) {
        violations.push.apply(violations, report.violations);
        warnings.push.apply(warnings, report.warnings);
    });
    // Phase-specific validation
    switch (phase) {
        case 'colors':
            // No gray or legacy aurora colors should remain
            violations = violations.filter(function (v) { return v.includes('gray') || v.includes('aurora'); });
            break;
        case 'typography':
            // All text elements should use Typography components
            break;
        case 'spacing':
            // All spacing should use tokens
            break;
    }
    return {
        phase: phase,
        violations: __spreadArray([], new Set(violations), true),
        warnings: __spreadArray([], new Set(warnings), true),
        passed: violations.length === 0,
        totalFiles: reports.length,
        migratedFiles: reports.filter(function (r) { return r.violations.length === 0; }).length
    };
}
exports.validatePhaseCompletion = validatePhaseCompletion;
