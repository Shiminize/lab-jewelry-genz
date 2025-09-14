#!/usr/bin/env node

/**
 * Claude Rules Compliance Checker
 * Validates file sizes and architectural patterns
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Claude Rules thresholds
const RULES = {
  SIMPLE_COMPONENT_TARGET: 300,
  SIMPLE_COMPONENT_LIMIT: 350,
  MODERATE_COMPONENT_TARGET: 350,
  MODERATE_COMPONENT_LIMIT: 400,
  COMPLEX_COMPONENT_THRESHOLD: 350,
  ABSOLUTE_HARD_LIMIT: 450
};

const COLORS = {
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  GREEN: '\x1b[32m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m'
};

function getLineCount(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    return 0;
  }
}

function scanDirectory(dir) {
  const violations = [];
  const warnings = [];
  
  function scanRecursive(currentDir) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        scanRecursive(path.join(currentDir, item.name));
      } else if (item.isFile() && (item.name.endsWith('.tsx') || item.name.endsWith('.ts'))) {
        const filePath = path.join(currentDir, item.name);
        const lineCount = getLineCount(filePath);
        const relativePath = path.relative(process.cwd(), filePath);
        
        if (lineCount > RULES.ABSOLUTE_HARD_LIMIT) {
          violations.push({
            file: relativePath,
            lines: lineCount,
            severity: 'CRITICAL',
            limit: RULES.ABSOLUTE_HARD_LIMIT
          });
        } else if (lineCount > RULES.COMPLEX_COMPONENT_THRESHOLD) {
          warnings.push({
            file: relativePath,
            lines: lineCount,
            severity: 'WARNING',
            limit: RULES.COMPLEX_COMPONENT_THRESHOLD
          });
        }
      }
    }
  }
  
  scanRecursive(dir);
  return { violations, warnings };
}

function printResults(results) {
  const { violations, warnings } = results;
  
  console.log('\n📋 Claude Rules Compliance Report');
  console.log('================================\n');
  
  if (violations.length === 0) {
    console.log(`${COLORS.GREEN}✅ No critical violations found!${COLORS.RESET}\n`);
  } else {
    console.log(`${COLORS.RED}❌ Critical Violations (${violations.length} files):${COLORS.RESET}`);
    violations.sort((a, b) => b.lines - a.lines);
    
    violations.forEach(violation => {
      const excess = violation.lines - violation.limit;
      console.log(`${COLORS.RED}  • ${violation.file}: ${violation.lines} lines (+${excess} over limit)${COLORS.RESET}`);
    });
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log(`${COLORS.YELLOW}⚠️  Approaching Limits (${warnings.length} files):${COLORS.RESET}`);
    warnings.sort((a, b) => b.lines - a.lines);
    
    warnings.forEach(warning => {
      const excess = warning.lines - warning.limit;
      console.log(`${COLORS.YELLOW}  • ${warning.file}: ${warning.lines} lines (+${excess} over threshold)${COLORS.RESET}`);
    });
    console.log('');
  }
  
  // Summary
  console.log('📊 Summary:');
  console.log(`   Total files scanned: ${violations.length + warnings.length + 'others'}`);
  console.log(`   Critical violations: ${violations.length}`);
  console.log(`   Warnings: ${warnings.length}`);
  
  if (violations.length > 0) {
    console.log(`\n${COLORS.RED}🚫 CLAUDE RULES VIOLATION DETECTED${COLORS.RESET}`);
    console.log('   Please refactor files exceeding 450 lines before proceeding.');
    console.log('   See Docs/Claude_Rules.md for guidance.\n');
    return false;
  }
  
  return true;
}

// Main execution
function main() {
  const srcDir = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('❌ src directory not found');
    process.exit(1);
  }
  
  console.log('🔍 Scanning for Claude Rules compliance...');
  const results = scanDirectory(srcDir);
  const passed = printResults(results);
  
  if (!passed) {
    process.exit(1);
  }
  
  console.log(`${COLORS.GREEN}✅ Claude Rules compliance check passed!${COLORS.RESET}\n`);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { scanDirectory, printResults, RULES };