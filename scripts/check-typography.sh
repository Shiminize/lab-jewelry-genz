#!/bin/bash

# Typography Compliance Check - CLAUDE_RULES Enforcer
# Prevents use of raw Tailwind typography utilities in favor of semantic classes
# 
# Usage: ./scripts/check-typography.sh
# Exit codes: 0 = clean, 1 = violations found

set -e

echo "🔍 Checking typography compliance..."

# Define patterns to detect raw typography utilities
BAD_PATTERNS=(
    "className.*?text-(4xl|3xl|2xl|xl|lg|base|sm|xs)"
    "className.*?font-(fraunces|inter|bold|semibold|medium|light)"
    "className.*?(text-4xl|text-3xl|text-2xl).*?(font-bold|font-semibold)"
)

VIOLATIONS_FOUND=false
TOTAL_VIOLATIONS=0

# Check each pattern
for pattern in "${BAD_PATTERNS[@]}"; do
    echo "  Checking pattern: $pattern"
    
    # Use ripgrep to find violations, excluding node_modules and generated files
    MATCHES=$(rg --hidden --glob '!node_modules' --glob '!.next' --glob '!dist' --glob '!build' \
        -n "$pattern" src/components src/app src/pages 2>/dev/null || true)
    
    if [ -n "$MATCHES" ]; then
        VIOLATIONS_FOUND=true
        echo "❌ Found raw typography utilities:"
        echo "$MATCHES"
        echo ""
        TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + $(echo "$MATCHES" | wc -l)))
    fi
done

# Check for missing semantic class usage in new files
echo "  Checking for proper semantic class usage..."

# Find components that should be using semantic classes
SHOULD_USE_SEMANTIC=$(rg --hidden --glob '!node_modules' --glob '!.next' \
    -l "(h1|h2|h3|h4|h5|h6).*className.*text-" src/components 2>/dev/null || true)

if [ -n "$SHOULD_USE_SEMANTIC" ]; then
    echo "⚠️  Files that may benefit from semantic typography classes:"
    echo "$SHOULD_USE_SEMANTIC"
    echo ""
fi

# Results summary
if [ "$VIOLATIONS_FOUND" = true ]; then
    echo "❌ Typography compliance check FAILED"
    echo "   Found $TOTAL_VIOLATIONS violations of typography standards"
    echo ""
    echo "💡 Fix by using semantic classes instead:"
    echo "   ❌ className=\"text-4xl font-bold\""
    echo "   ✅ className=\"typography-h1\""
    echo ""
    echo "   ❌ className=\"text-2xl font-semibold\""  
    echo "   ✅ className=\"typography-h3\""
    echo ""
    echo "   ❌ className=\"text-base font-normal\""
    echo "   ✅ className=\"typography-body\""
    echo ""
    echo "📖 See docs/typography-guide.md for complete reference"
    
    exit 1
else
    echo "✅ Typography compliance check PASSED"
    echo "   All components using semantic typography classes"
    exit 0
fi