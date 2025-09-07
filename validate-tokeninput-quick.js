/**
 * TokenInput Component Quick Validation
 * Analyzes token compliance without browser testing
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Quick TokenInput Component Validation');

// Read TokenInput component file
const tokenInputPath = path.join(__dirname, 'src/components/ui/TokenInput.tsx');

try {
  const tokenInputCode = fs.readFileSync(tokenInputPath, 'utf8');
  
  console.log('✅ TokenInput.tsx file found and read successfully');
  
  // Test 1: Token Usage Analysis
  console.log('\n🔍 Test 1: Analyzing token usage patterns...');
  
  const tokenPatterns = [
    /rounded-token-\w+/g,
    /px-\d+/g,
    /py-\d+/g,
    /h-\d+/g,
    /text-token-\w+/g,
    /border-brand-\w+/g,
    /bg-neutral-\w+/g,
    /focus:ring-brand-\w+/g,
    /hover:brightness-115/g,
    /space-y-token-\w+/g
  ];
  
  let totalTokenUses = 0;
  
  tokenPatterns.forEach(pattern => {
    const matches = tokenInputCode.match(pattern);
    if (matches) {
      totalTokenUses += matches.length;
      console.log(`  ✅ Found ${matches.length} uses of pattern: ${pattern.source}`);
    }
  });
  
  // Test 2: CLAUDE_RULES Compliance
  console.log('\n🔍 Test 2: CLAUDE_RULES compliance check...');
  
  const lines = tokenInputCode.split('\n').length;
  console.log(`  📏 File length: ${lines} lines`);
  
  const hasComplexity = tokenInputCode.includes('cva(') && tokenInputCode.includes('forwardRef');
  console.log(`  🎯 Uses proper component architecture: ${hasComplexity ? 'Yes' : 'No'}`);
  
  const hasProperTypes = tokenInputCode.includes('interface') && tokenInputCode.includes('VariantProps');
  console.log(`  🔒 TypeScript typed properly: ${hasProperTypes ? 'Yes' : 'No'}`);
  
  // Test 3: Legacy Pattern Detection
  console.log('\n🔍 Test 3: Legacy pattern detection...');
  
  const legacyPatterns = [
    /className="[^"]*\bp-[0-9]+/g,
    /className="[^"]*\bm-[0-9]+/g,
    /#[0-9a-fA-F]{6}/g,  // hex colors
    /\bpx\b/g,  // pixel values
    /\brem\b/g  // rem values
  ];
  
  let legacyCount = 0;
  
  legacyPatterns.forEach(pattern => {
    const matches = tokenInputCode.match(pattern);
    if (matches) {
      legacyCount += matches.length;
      console.log(`  ⚠️ Found ${matches.length} legacy patterns: ${pattern.source}`);
    }
  });
  
  if (legacyCount === 0) {
    console.log('  ✅ No legacy patterns detected');
  }
  
  // Test 4: Feature Completeness
  console.log('\n🔍 Test 4: Feature completeness check...');
  
  const features = {
    'Label support': tokenInputCode.includes('label'),
    'Helper text': tokenInputCode.includes('helperText'),
    'Error states': tokenInputCode.includes('errorMessage'),
    'Icon support': tokenInputCode.includes('startIcon') && tokenInputCode.includes('endIcon'),
    'Size variants': tokenInputCode.includes('size:'),
    'Variant styles': tokenInputCode.includes('variant:'),
    'Accessibility': tokenInputCode.includes('aria-') || tokenInputCode.includes('htmlFor'),
    'ForwardRef': tokenInputCode.includes('forwardRef')
  };
  
  let featuresCount = 0;
  Object.entries(features).forEach(([feature, hasFeature]) => {
    console.log(`  ${hasFeature ? '✅' : '❌'} ${feature}: ${hasFeature ? 'Present' : 'Missing'}`);
    if (hasFeature) featuresCount++;
  });
  
  // Test 5: Token Compliance Score Calculation
  console.log('\n📊 Test 5: Token compliance scoring...');
  
  const maxTokenScore = 50;
  const tokenScore = Math.min(maxTokenScore, totalTokenUses * 2);
  
  const maxFeatureScore = 30;
  const featureScore = (featuresCount / Object.keys(features).length) * maxFeatureScore;
  
  const maxArchitectureScore = 20;
  const architectureScore = (hasComplexity && hasProperTypes && lines <= 300) ? maxArchitectureScore : 10;
  
  const legacyPenalty = Math.min(20, legacyCount * 2);
  
  const totalScore = Math.max(0, tokenScore + featureScore + architectureScore - legacyPenalty);
  
  console.log(`  🎯 Token Usage Score: ${tokenScore}/${maxTokenScore} (${totalTokenUses} token uses)`);
  console.log(`  ⭐ Feature Score: ${featureScore.toFixed(1)}/${maxFeatureScore} (${featuresCount}/${Object.keys(features).length} features)`);
  console.log(`  🏗️ Architecture Score: ${architectureScore}/${maxArchitectureScore}`);
  console.log(`  🚫 Legacy Penalty: -${legacyPenalty} (${legacyCount} legacy patterns)`);
  
  console.log(`\n🏆 TOKENINPUT COMPONENT FINAL SCORE: ${totalScore.toFixed(1)}/100`);
  
  // Comparison with existing components
  console.log('\n📈 Comparison Analysis:');
  
  const comparisons = {
    'TokenButton': 88.9,
    'Button': 95.0,
    'ProductCard': 98.0
  };
  
  Object.entries(comparisons).forEach(([component, score]) => {
    const comparison = totalScore > score ? 'Better' : totalScore === score ? 'Equal' : 'Lower';
    console.log(`  ${comparison === 'Better' ? '⬆️' : comparison === 'Equal' ? '➡️' : '⬇️'} vs ${component}: ${totalScore.toFixed(1)} vs ${score} (${comparison})`);
  });
  
  // Success criteria evaluation
  console.log('\n🎯 Success Criteria Evaluation:');
  
  if (totalScore >= 90) {
    console.log('🎉 EXCEEDS EXPECTATIONS - TokenInput component is outstanding!');
  } else if (totalScore >= 80) {
    console.log('✅ MEETS EXPECTATIONS - TokenInput component is solid!');
  } else if (totalScore >= 70) {
    console.log('⚠️ NEEDS IMPROVEMENT - TokenInput component has potential');
  } else {
    console.log('❌ REQUIRES REFACTORING - TokenInput component needs work');
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  if (totalTokenUses < 20) {
    console.log('  • Increase token usage in component variants');
  }
  if (legacyCount > 0) {
    console.log('  • Replace legacy patterns with tokens');
  }
  if (featuresCount < Object.keys(features).length) {
    console.log('  • Add missing features for completeness');
  }
  if (totalScore >= 85) {
    console.log('  • Component ready for production use');
    console.log('  • Consider adding to component library');
  }
  
  console.log('\n✅ TokenInput Component Validation Complete');

} catch (error) {
  console.error('❌ Error reading TokenInput component:', error.message);
  process.exit(1);
}