#!/usr/bin/env node

/**
 * Token Usage Validator
 * Scans for hardcoded values that should use design tokens
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  GREEN: '\x1b[32m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m'
};

// Patterns to detect hardcoded values
const VIOLATION_PATTERNS = [
  {
    name: 'Raw Pixel Values',
    pattern: /\b\d+px\b(?!\s*\/)/g,
    severity: 'WARNING',
    suggestion: 'Use token-xs, token-sm, token-md, token-lg, etc.'
  },
  {
    name: 'Hex Colors',
    pattern: /#[0-9a-fA-F]{3,6}\b/g,
    severity: 'CRITICAL',
    suggestion: 'Use Neon tokens: --volt-glow-rgb, --cyber-pink-rgb, etc.'
  },
  {
    name: 'Important Flags',
    pattern: /!important/g,
    severity: 'WARNING',
    suggestion: 'Avoid !important, use proper CSS specificity'
  },
  {
    name: 'Raw Border Radius',
    pattern: /border-radius:\s*\d+px/g,
    severity: 'WARNING',
    suggestion: 'Use rounded-token-sm, rounded-token-md, etc.'
  },
  {
    name: 'Fixed Widths/Heights',
    pattern: /(?:width|height):\s*\d+px/g,
    severity: 'WARNING',
    suggestion: 'Consider responsive units or tokens'
  }
];

// Files to exclude from scanning
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.next/,
  /build/,
  /dist/,
  /\.config\./,
  /\.test\./,
  /\.spec\./,
  /globals\.css$/,
  /src\/styles\/neon\.css$/
];

function shouldExcludeFile(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
}

function scanFile(filePath) {
  const violations = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    VIOLATION_PATTERNS.forEach(({ name, pattern, severity, suggestion }) => {
      lines.forEach((line, index) => {
        const matches = Array.from(line.matchAll(pattern));
        matches.forEach(match => {
          violations.push({
            file: path.relative(process.cwd(), filePath),
            line: index + 1,
            column: match.index + 1,
            type: name,
            severity,
            content: match[0],
            suggestion,
            context: line.trim()
          });
        });
      });
    });
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }
  
  return violations;
}

function scanDirectory(dir) {
  const allViolations = [];
  
  function scanRecursive(currentDir) {
    try {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item.name);
        
        if (shouldExcludeFile(fullPath)) {
          continue;
        }
        
        if (item.isDirectory()) {
          scanRecursive(fullPath);
        } else if (item.isFile() && /\.(tsx?|jsx?|css|scss)$/.test(item.name)) {
          const violations = scanFile(fullPath);
          allViolations.push(...violations);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${currentDir}:`, error.message);
    }
  }
  
  scanRecursive(dir);
  return allViolations;
}

function generateReport(violations) {
  const summary = {
    critical: violations.filter(v => v.severity === 'CRITICAL').length,
    warnings: violations.filter(v => v.severity === 'WARNING').length,
    total: violations.length
  };
  
  const byType = violations.reduce((acc, violation) => {
    if (!acc[violation.type]) {
      acc[violation.type] = [];
    }
    acc[violation.type].push(violation);
    return acc;
  }, {});
  
  const byFile = violations.reduce((acc, violation) => {
    if (!acc[violation.file]) {
      acc[violation.file] = [];
    }
    acc[violation.file].push(violation);
    return acc;
  }, {});
  
  return { summary, byType, byFile };
}

function printReport(report) {
  const { summary, byType, byFile } = report;
  
  console.log('\n🎨 Token Usage Validation Report');
  console.log('===============================\n');
  
  // Summary
  if (summary.total === 0) {
    console.log(`${COLORS.GREEN}✅ Perfect! No token violations found.${COLORS.RESET}\n`);
    return true;
  }
  
  console.log('📊 Summary:');
  console.log(`   Critical violations: ${COLORS.RED}${summary.critical}${COLORS.RESET}`);
  console.log(`   Warnings: ${COLORS.YELLOW}${summary.warnings}${COLORS.RESET}`);
  console.log(`   Total violations: ${summary.total}\n`);
  
  // By violation type
  console.log('🔍 Violation Types:');
  Object.entries(byType).forEach(([type, violations]) => {
    const severity = violations[0].severity;
    const color = severity === 'CRITICAL' ? COLORS.RED : COLORS.YELLOW;
    console.log(`${color}   ${type}: ${violations.length} instances${COLORS.RESET}`);
    
    if (violations.length <= 5) {
      violations.forEach(v => {
        console.log(`     ${v.file}:${v.line} - "${v.content}"`);
      });
    } else {
      console.log(`     (showing first 5 of ${violations.length})`);
      violations.slice(0, 5).forEach(v => {
        console.log(`     ${v.file}:${v.line} - "${v.content}"`);
      });
    }
    console.log('');
  });
  
  // Worst offenders
  console.log('🎯 Files Needing Most Attention:');
  const sortedFiles = Object.entries(byFile)
    .sort(([,a], [,b]) => b.length - a.length)
    .slice(0, 10);
  
  sortedFiles.forEach(([file, violations]) => {
    const critical = violations.filter(v => v.severity === 'CRITICAL').length;
    const warnings = violations.filter(v => v.severity === 'WARNING').length;
    console.log(`   ${file}: ${violations.length} violations (${critical} critical, ${warnings} warnings)`);
  });
  
  console.log(`\n💡 Quick fixes available. Run ${COLORS.BLUE}npm run fix:tokens${COLORS.RESET} for auto-migration.`);
  
  return summary.critical === 0; // Only fail on critical violations
}

function main() {
  const srcDir = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('❌ src directory not found');
    process.exit(1);
  }
  
  console.log('🔍 Scanning for token usage violations...');
  const violations = scanDirectory(srcDir);
  const report = generateReport(violations);
  const passed = printReport(report);
  
  if (!passed) {
    console.log(`\n${COLORS.RED}🚫 CRITICAL TOKEN VIOLATIONS DETECTED${COLORS.RESET}`);
    console.log('   Fix critical violations before proceeding with migration.\n');
    process.exit(1);
  }
  
  console.log(`${COLORS.GREEN}✅ Token validation passed!${COLORS.RESET}\n`);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { scanDirectory, generateReport, printReport };
