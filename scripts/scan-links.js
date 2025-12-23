const fs = require('fs');
const path = require('path');

const SEARCH_DIR = 'src';
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const PLACEHOLDER_PATTERNS = [
    /href\s*=\s*["']#["']/g,           // href="#"
    /href\s*=\s*["']javascript:void\(0\)["']/g, // href="javascript:void(0)"
    /href\s*=\s*["']["']/g,             // href=""
];

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let issues = [];

    // Check for regex patterns
    PLACEHOLDER_PATTERNS.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            issues.push({
                file: filePath,
                line: content.substring(0, match.index).split('\n').length,
                match: match[0]
            });
        }
    });

    // Specific check for navigation.ts structure (simplified scan)
    if (filePath.endsWith('navigation.ts')) {
        const navLines = content.split('\n');
        navLines.forEach((line, index) => {
            if (line.includes('href:') && (line.includes("'#'") || line.includes('"#"') || line.includes("''") || line.includes('""'))) {
                issues.push({
                    file: filePath,
                    line: index + 1,
                    match: line.trim()
                });
            }
        });
    }

    return issues;
}

function traverseDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(traverseDir(fullPath));
        } else {
            if (EXTENSIONS.includes(path.extname(fullPath))) {
                const fileIssues = scanFile(fullPath);
                if (fileIssues.length > 0) {
                    results = results.concat(fileIssues);
                }
            }
        }
    });
    return results;
}

console.log(`Scanning ${SEARCH_DIR} for placeholder links...`);
const allIssues = traverseDir(SEARCH_DIR);

if (allIssues.length > 0) {
    console.log('\nFound potential link issues:');
    allIssues.forEach(issue => {
        console.log(`[${issue.file}:${issue.line}] ${issue.match}`);
    });
    process.exit(1); // Exit with error code to signal CI failure if needed
} else {
    console.log('\nNo placeholder links found!');
    process.exit(0);
}
