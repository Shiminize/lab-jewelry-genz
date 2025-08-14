#!/usr/bin/env node

/**
 * Quick test script to create a single image sequence for testing
 */

const fs = require('fs');
const path = require('path');

// Create the test directory
const testDir = './public/images/products/3d-sequences/solitaire-platinum';
fs.mkdirSync(testDir, { recursive: true });

// Create SVG placeholder for first frame (0.webp will be converted to PNG for now)
const svg = `<svg width="600" height="600" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <radialGradient id="grad" cx="50%" cy="50%" r="40%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
            <stop offset="70%" style="stop-color:#e8e8e8;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#d0d0d0;stop-opacity:1" />
        </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="transparent"/>
    <circle cx="300" cy="300" r="200" fill="url(#grad)" stroke="#c0c0c0" stroke-width="3"/>
    <circle cx="300" cy="200" r="30" fill="#ffffff" stroke="#e0e0e0" stroke-width="2"/>
    <circle cx="300" cy="200" r="15" fill="#f8f8f8"/>
    <text x="300" y="450" text-anchor="middle" font-family="Arial" font-size="16" fill="#999">
        Platinum Solitaire Ring
    </text>
    <text x="300" cy="480" text-anchor="middle" font-family="Arial" font-size="12" fill="#bbb">
        CSS 3D Viewer Test
    </text>
</svg>`;

// Write a simple HTML file that can be converted to image
const htmlFile = path.join(testDir, 'test-frame.html');
fs.writeFileSync(htmlFile, `
<!DOCTYPE html>
<html>
<head><title>Test Frame</title></head>
<body style="margin:0; padding:20px; font-family: Arial;">
${svg}
</body>
</html>
`);

console.log('✅ Test sequence directory created:', testDir);
console.log('📝 To complete setup:');
console.log('1. Create 36 images named 0.webp, 1.webp, ... 35.webp');
console.log('2. Or use screenshot tools to convert the HTML file');
console.log('3. Or use the automated rendering script with your GLB models');
console.log('');
console.log('🔗 Test the CSS 3D viewer at: http://localhost:3001');

// Create a simple placeholder image using data URI for immediate testing
const placeholderDataURI = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
console.log('');
console.log('📷 Placeholder data URI (for immediate testing):');
console.log(placeholderDataURI);