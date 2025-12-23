#!/bin/bash
# CI Guard: Prevent capsule/inspiration mentions outside historical evidence
# Usage: ./scripts/ci-capsule-guard.sh
# Exit 0: Clean
# Exit 1: Found forbidden mentions

set -e

FORBIDDEN_PATTERN="capsule|inspiration"
ALLOWED_PATHS=(
  "Docs/concierge_v1/launch_evidence"
  "Docs/concierge_v1/uat_evidence"
  "CAPSULE_REMOVAL_COMPLETE.md"
  "RECOMMENDATION_ONLY_AUDIT.md"
  "scripts/ci-capsule-guard.sh"
)

echo "🔍 Scanning for capsule/inspiration mentions..."
echo ""

# Build exclusion pattern for grep
EXCLUDE_ARGS=""
for path in "${ALLOWED_PATHS[@]}"; do
  EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude-dir=$path"
done

# Search in source code and core docs
VIOLATIONS=$(grep -r -i -n "$FORBIDDEN_PATTERN" \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.jsx" \
  --include="*.md" \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=.git \
  --exclude-dir=coverage \
  --exclude-dir=playwright-report \
  --exclude-dir=test-results \
  --exclude-dir=Docs/concierge_v1/launch_evidence \
  --exclude-dir=Docs/concierge_v1/uat_evidence \
  --exclude-dir=Docs/concierge_v1/CL* \
  --exclude-dir=Docs/concierge_v1/WF* \
  --exclude-dir=Docs/concierge_v1/F* \
  --exclude=CAPSULE_REMOVAL_COMPLETE.md \
  --exclude=RECOMMENDATION_ONLY_AUDIT.md \
  --exclude=ci-capsule-guard.sh \
  src/ Docs/ scripts/ README.md IMPLEMENTATION_COMPLETE_SUMMARY.md WIDGET_QUICK_START.md 2>/dev/null || true)

if [ -z "$VIOLATIONS" ]; then
  echo "✅ No forbidden capsule/inspiration mentions found"
  echo "   (Recommendation-only scope maintained)"
  exit 0
else
  echo "❌ Found forbidden capsule/inspiration mentions:"
  echo ""
  echo "$VIOLATIONS"
  echo ""
  echo "These features were removed for recommendation-only scope."
  echo "See CAPSULE_REMOVAL_COMPLETE.md for details."
  exit 1
fi

