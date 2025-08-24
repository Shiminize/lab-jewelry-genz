/**
 * Code-level Cache-Busting Verification
 * Direct inspection of the ImageViewer component implementation
 */

const fs = require('fs');
const path = require('path');

function verifyCodeImplementation() {
  console.log('🔍 CODE-LEVEL CACHE-BUSTING VERIFICATION');
  console.log('==========================================\n');

  try {
    // Read the ImageViewer component
    const imageViewerPath = path.join(__dirname, 'src/components/customizer/ImageViewer.tsx');
    const imageViewerCode = fs.readFileSync(imageViewerPath, 'utf8');

    console.log('📁 Analyzing ImageViewer.tsx implementation...\n');

    // Check for cache-busting implementation patterns
    const checks = [
      {
        name: 'Timestamp generation',
        pattern: /Date\.now\(\)/,
        required: true,
        description: 'Uses Date.now() for timestamp generation'
      },
      {
        name: 'Cache-busting URL parameter',
        pattern: /\?v=\$\{timestamp\}/,
        required: true,
        description: 'Adds ?v=${timestamp} to image URLs'
      },
      {
        name: 'Multi-format fallback',
        pattern: /formats.*=.*\[.*webp.*avif.*png.*\]/,
        required: true,
        description: 'Supports webp, avif, png format fallback'
      },
      {
        name: 'Cache-busting in preload',
        pattern: /timestamp.*=.*Date\.now.*framePath.*=.*\$\{format\}\?v=\$\{timestamp\}/,
        required: true,
        description: 'Applies cache-busting to preloaded images'
      },
      {
        name: 'Image path construction',
        pattern: /imagePaths.*useMemo/,
        required: true,
        description: 'Uses useMemo for efficient image path construction'
      }
    ];

    let passedChecks = 0;
    let totalChecks = checks.length;

    checks.forEach(check => {
      const found = check.pattern.test(imageViewerCode);
      const status = found ? '✅ FOUND' : '❌ MISSING';
      
      console.log(`${status} ${check.name}`);
      console.log(`   ${check.description}`);
      
      if (check.required && found) {
        passedChecks++;
      }
      console.log('');
    });

    // Extract key code sections
    console.log('🔗 KEY CODE SECTIONS:');
    console.log('=====================\n');

    // Find the imagePaths useMemo section
    const imagePathsMatch = imageViewerCode.match(/const imagePaths = useMemo\(\(\) => \{[\s\S]*?\}, \[.*?\]\)/);
    if (imagePathsMatch) {
      console.log('📸 Image Paths Construction:');
      console.log('```typescript');
      console.log(imagePathsMatch[0]);
      console.log('```\n');
    }

    // Find preload section
    const preloadMatch = imageViewerCode.match(/const timestamp = Date\.now\(\)[\s\S]*?framePath = `\$\{assetPath\}\/\$\{frameIndex\}\.\$\{format\}\?v=\$\{timestamp\}`/);
    if (preloadMatch) {
      console.log('🔄 Preload Cache-Busting:');
      console.log('```typescript');
      console.log(preloadMatch[0]);
      console.log('```\n');
    }

    // Overall assessment
    const implementationScore = (passedChecks / totalChecks) * 100;
    console.log('📊 IMPLEMENTATION ANALYSIS:');
    console.log('============================');
    console.log(`Checks passed: ${passedChecks}/${totalChecks}`);
    console.log(`Implementation score: ${implementationScore.toFixed(1)}%`);
    
    if (implementationScore >= 90) {
      console.log('🎉 STATUS: ✅ CACHE-BUSTING IMPLEMENTATION IS COMPLETE');
      console.log('   All required patterns are implemented correctly.');
    } else if (implementationScore >= 70) {
      console.log('⚠️  STATUS: 🔄 CACHE-BUSTING PARTIALLY IMPLEMENTED'); 
      console.log('   Most patterns found, minor issues may exist.');
    } else {
      console.log('❌ STATUS: ❗ CACHE-BUSTING IMPLEMENTATION INCOMPLETE');
      console.log('   Critical patterns are missing.');
    }

    console.log('\n🧪 RUNTIME VERIFICATION RECOMMENDATIONS:');
    console.log('=========================================');
    console.log('1. Open browser dev tools Network tab');
    console.log('2. Navigate to http://localhost:3000/customizer');
    console.log('3. Look for image requests with ?v=<timestamp> parameters');
    console.log('4. Switch materials and verify new timestamp values');
    console.log('5. Check that images appear bright and vibrant');

  } catch (error) {
    console.error('❌ Error reading ImageViewer component:', error.message);
    
    // Fallback: try to find the file in different locations
    console.log('\n🔍 Searching for ImageViewer component...');
    const possiblePaths = [
      'src/components/customizer/ImageViewer.tsx',
      'components/customizer/ImageViewer.tsx',
      './src/components/customizer/ImageViewer.tsx'
    ];
    
    for (const searchPath of possiblePaths) {
      try {
        if (fs.existsSync(searchPath)) {
          console.log(`✅ Found at: ${searchPath}`);
          return;
        }
      } catch (e) {
        // Continue searching
      }
    }
    console.log('❌ ImageViewer component not found in expected locations');
  }
}

// Run the verification
verifyCodeImplementation();