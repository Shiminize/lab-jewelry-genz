/**
 * Automated Console.log Removal Script
 * CLAUDE_RULES compliant: Production-ready code standards
 * Preserves console.error, console.warn, and console.info for production use
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all source files
function getAllSourceFiles() {
  try {
    const result = execSync('find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"', { encoding: 'utf8' });
    return result.split('\n').filter(file => file.trim().length > 0);
  } catch (error) {
    console.error('Error finding source files:', error);
    return [];
  }
}

// Remove console.log statements while preserving error/warn/info
function removeConsoleLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remove console.log statements (but preserve console.error, console.warn, console.info)
    const consoleLogRegex = /^\s*console\.log\([\s\S]*?\);?\s*$/gm;
    const newContent = content.replace(consoleLogRegex, '');
    
    // Also handle inline console.log with comments
    const inlineConsoleLogRegex = /console\.log\([^)]*\);\s*(?:\/\/.*)?/g;
    const finalContent = newContent.replace(inlineConsoleLogRegex, '').replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (content !== finalContent) {
      fs.writeFileSync(filePath, finalContent);
      modified = true;
    }
    
    return modified;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Main execution
function main() {
  console.log('🧹 Phase 2: Removing console.log statements...');
  
  const sourceFiles = getAllSourceFiles();
  let totalModified = 0;
  let totalConsoleLogsRemoved = 0;
  
  sourceFiles.forEach(filePath => {
    // Count console.logs before removal
    const content = fs.readFileSync(filePath, 'utf8');
    const consoleLogCount = (content.match(/console\.log\(/g) || []).length;
    
    if (consoleLogCount > 0) {
      const wasModified = removeConsoleLogs(filePath);
      if (wasModified) {
        totalModified++;
        totalConsoleLogsRemoved += consoleLogCount;
        console.log(`✅ ${filePath}: Removed ${consoleLogCount} console.log statements`);
      }
    }
  });
  
  console.log(`\n📊 Phase 2 Summary:`);
  console.log(`   Files modified: ${totalModified}`);
  console.log(`   Console.log statements removed: ${totalConsoleLogsRemoved}`);
  console.log(`   ✅ Production-ready code standards applied`);
}

main();