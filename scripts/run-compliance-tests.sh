#!/bin/bash

# CLAUDE_RULES.md Compliance Test Runner
# Comprehensive end-to-end compliance validation for the 3D customizer implementation

set -e

echo "🚀 CLAUDE_RULES.md Compliance Test Suite"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
PARALLEL_WORKERS=${PARALLEL_WORKERS:-1}
BROWSER=${BROWSER:-chromium}
HEADED=${HEADED:-false}
TIMEOUT=${TIMEOUT:-60000}

# Function to run test suite and capture results
run_test_suite() {
    local test_file=$1
    local test_name=$2
    local priority=$3
    
    echo -e "${BLUE}📋 Running ${test_name} Tests (${priority} Priority)${NC}"
    echo "   File: $test_file"
    echo "   Browser: $BROWSER"
    echo "   Workers: $PARALLEL_WORKERS"
    echo ""
    
    if npx playwright test "$test_file" \
        --browser="$BROWSER" \
        --workers="$PARALLEL_WORKERS" \
        --timeout="$TIMEOUT" \
        --reporter=list; then
        echo -e "${GREEN}✅ ${test_name} Tests: PASSED${NC}"
        return 0
    else
        echo -e "${RED}❌ ${test_name} Tests: FAILED${NC}"
        return 1
    fi
}

# Function to install dependencies if needed
install_dependencies() {
    echo -e "${BLUE}📦 Installing test dependencies...${NC}"
    
    if ! npm list axe-playwright >/dev/null 2>&1; then
        echo "Installing axe-playwright for accessibility testing..."
        npm install --save-dev axe-playwright
    fi
    
    if ! npm list @testing-library/jest-dom >/dev/null 2>&1; then
        echo "Installing Jest testing utilities..."
        npm install --save-dev @testing-library/jest-dom @testing-library/react @testing-library/user-event
    fi
    
    if ! npm list undici >/dev/null 2>&1; then
        echo "Installing fetch polyfill for Jest..."
        npm install --save-dev undici
    fi
    
    echo -e "${GREEN}✅ Dependencies installed${NC}"
}

# Function to start development server if not running
start_dev_server() {
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Development server is already running${NC}"
        return 0
    fi
    
    echo -e "${YELLOW}⚠️  Starting development server...${NC}"
    npm run dev &
    DEV_SERVER_PID=$!
    
    # Wait for server to start
    echo "Waiting for server to start..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Development server started${NC}"
            return 0
        fi
        sleep 2
    done
    
    echo -e "${RED}❌ Failed to start development server${NC}"
    return 1
}

# Function to cleanup
cleanup() {
    if [ ! -z "$DEV_SERVER_PID" ]; then
        echo "Stopping development server..."
        kill $DEV_SERVER_PID 2>/dev/null || true
    fi
}

# Trap cleanup
trap cleanup EXIT

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --headed)
            HEADED=true
            shift
            ;;
        --browser=*)
            BROWSER="${1#*=}"
            shift
            ;;
        --workers=*)
            PARALLEL_WORKERS="${1#*=}"
            shift
            ;;
        --timeout=*)
            TIMEOUT="${1#*=}"
            shift
            ;;
        --install-deps)
            install_dependencies
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --headed           Run tests in headed mode"
            echo "  --browser=BROWSER  Browser to use (chromium, firefox, webkit)"
            echo "  --workers=N        Number of parallel workers"
            echo "  --timeout=MS       Test timeout in milliseconds"
            echo "  --install-deps     Install missing dependencies"
            echo "  --help             Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Main execution
main() {
    local failed_suites=0
    local total_suites=0
    
    echo "Configuration:"
    echo "  Browser: $BROWSER"
    echo "  Workers: $PARALLEL_WORKERS"
    echo "  Headed: $HEADED"
    echo "  Timeout: ${TIMEOUT}ms"
    echo ""
    
    # Install dependencies if needed
    if [ "$1" = "--install-deps" ] || [ ! -d "node_modules/axe-playwright" ]; then
        install_dependencies
    fi
    
    # Start development server
    start_dev_server
    
    echo ""
    echo "🎯 Running CLAUDE_RULES.md Compliance Tests"
    echo "==========================================="
    
    # Test Suite Overview
    echo -e "${BLUE}📊 Running Test Suite Overview...${NC}"
    if ! run_test_suite "tests/compliance-test-suite.spec.ts" "Overview & Health Checks" "HIGH"; then
        ((failed_suites++))
    fi
    ((total_suites++))
    
    echo ""
    
    # HIGH PRIORITY TESTS
    echo -e "${YELLOW}🔥 HIGH PRIORITY COMPLIANCE TESTS${NC}"
    echo "=================================="
    
    # API Compliance (HIGH)
    if ! run_test_suite "tests/api-compliance.spec.ts" "API Compliance" "HIGH"; then
        ((failed_suites++))
    fi
    ((total_suites++))
    
    # 3D Customizer Acceptance (HIGH)
    if ! run_test_suite "tests/3d-customizer-acceptance.spec.ts" "3D Customizer Acceptance" "HIGH"; then
        ((failed_suites++))
    fi
    ((total_suites++))
    
    # Accessibility (HIGH)
    if ! run_test_suite "tests/accessibility-compliance.spec.ts" "Accessibility (WCAG 2.1 AA)" "HIGH"; then
        ((failed_suites++))
    fi
    ((total_suites++))
    
    # Performance (HIGH)
    if ! run_test_suite "tests/performance-compliance.spec.ts" "Performance Requirements" "HIGH"; then
        ((failed_suites++))
    fi
    ((total_suites++))
    
    echo ""
    
    # MEDIUM PRIORITY TESTS
    echo -e "${YELLOW}📋 MEDIUM PRIORITY COMPLIANCE TESTS${NC}"
    echo "===================================="
    
    # Design System (MEDIUM)
    if ! run_test_suite "tests/design-system-compliance.spec.ts" "Design System Compliance" "MEDIUM"; then
        ((failed_suites++))
    fi
    ((total_suites++))
    
    # Component Architecture (MEDIUM)
    if ! run_test_suite "tests/component-architecture-compliance.spec.ts" "Component Architecture" "MEDIUM"; then
        ((failed_suites++))
    fi
    ((total_suites++))
    
    # Final Report
    echo ""
    echo "📊 COMPLIANCE TEST RESULTS"
    echo "=========================="
    
    local passed_suites=$((total_suites - failed_suites))
    local success_rate=$((passed_suites * 100 / total_suites))
    
    echo "Total Test Suites: $total_suites"
    echo "Passed: $passed_suites"
    echo "Failed: $failed_suites"
    echo "Success Rate: ${success_rate}%"
    echo ""
    
    if [ $failed_suites -eq 0 ]; then
        echo -e "${GREEN}🎉 ALL COMPLIANCE TESTS PASSED!${NC}"
        echo "✅ Your 3D customizer implementation meets all CLAUDE_RULES.md requirements"
    elif [ $success_rate -ge 80 ]; then
        echo -e "${YELLOW}⚠️  MOSTLY COMPLIANT (${success_rate}% pass rate)${NC}"
        echo "Some tests failed but the implementation is largely compliant"
    else
        echo -e "${RED}❌ COMPLIANCE ISSUES DETECTED (${success_rate}% pass rate)${NC}"
        echo "Multiple test suites failed - review implementation against CLAUDE_RULES.md"
    fi
    
    echo ""
    echo "📋 Detailed Reports:"
    echo "   HTML Report: playwright-report/index.html"
    echo "   Test Artifacts: test-results/"
    echo ""
    echo "🔧 Individual Test Commands:"
    echo "   npx playwright test tests/api-compliance.spec.ts"
    echo "   npx playwright test tests/3d-customizer-acceptance.spec.ts"
    echo "   npx playwright test tests/design-system-compliance.spec.ts"
    echo "   npx playwright test tests/accessibility-compliance.spec.ts"
    echo "   npx playwright test tests/performance-compliance.spec.ts"
    echo "   npx playwright test tests/component-architecture-compliance.spec.ts"
    
    # Exit with error code if any tests failed
    return $failed_suites
}

# Run main function
main "$@"