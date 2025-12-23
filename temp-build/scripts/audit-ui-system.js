#!/usr/bin/env ts-node
"use strict";
/**
 * UI System Audit Script
 * CLAUDE_RULES compliant: Comprehensive validation for each migration phase
 *
 * Usage: npx ts-node scripts/audit-ui-system.ts [phase]
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PHASE_CONFIGS = exports.auditPhase = void 0;
var fs_1 = require("fs");
var glob_1 = require("glob");
var uiSystemMigration_1 = require("../src/utils/uiSystemMigration");
var PHASE_CONFIGS = {
    foundation: {
        name: 'Foundation & Tooling',
        description: 'Migration utilities and ESLint rules setup',
        filePatterns: [
            'src/utils/uiSystemMigration.ts',
            'scripts/audit-ui-system.ts'
        ],
        validationRules: [
            'Migration utilities exist and are functional',
            'All utility files under 300 lines (CLAUDE_RULES)',
            'TypeScript compilation successful',
            'No ESLint violations'
        ],
        maxViolations: 0
    },
    colors: {
        name: 'Color System Migration',
        description: 'All gray-* and legacy aurora colors migrated to neutral system',
        filePatterns: [
            'src/app/**/*.tsx',
            'src/components/**/*.tsx'
        ],
        validationRules: [
            'Zero gray-* color classes',
            'Zero aurora-nav-* classes',
            'All colors from approved Tailwind config',
            'Visual regression tests pass'
        ],
        maxViolations: 0
    },
    typography: {
        name: 'Typography Standardization',
        description: 'All text elements use Typography components',
        filePatterns: [
            'src/app/**/*.tsx',
            'src/components/**/*.tsx'
        ],
        validationRules: [
            'Zero raw heading tags with className',
            'Zero raw paragraph tags with text classes',
            'All Typography imports present where needed',
            'Consistent font scaling'
        ],
        maxViolations: 0
    },
    components: {
        name: 'Component Consolidation',
        description: 'All UI elements use standardized components',
        filePatterns: [
            'src/app/**/*.tsx',
            'src/components/**/*.tsx'
        ],
        validationRules: [
            'Zero raw button elements',
            'All interactive elements use UI components',
            'Component files under 300 lines',
            'Proper variant usage'
        ],
        maxViolations: 0
    },
    spacing: {
        name: 'Spacing & Layout',
        description: 'All spacing uses token system',
        filePatterns: [
            'src/app/**/*.tsx',
            'src/components/**/*.tsx'
        ],
        validationRules: [
            'All spacing uses token-* classes',
            'No arbitrary spacing values',
            'Consistent section patterns',
            'Responsive breakpoints correct'
        ],
        maxViolations: 0
    }
};
exports.PHASE_CONFIGS = PHASE_CONFIGS;
/**
 * Check if file complies with CLAUDE_RULES line limits
 */
function checkClaudeRulesCompliance(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var content, lineCount, violations, isUtility, isComplexComponent, maxLines;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs_1.promises.readFile(filePath, 'utf-8')];
                case 1:
                    content = _a.sent();
                    lineCount = content.split('\n').length;
                    violations = [];
                    isUtility = filePath.includes('/utils/') || filePath.includes('/lib/');
                    isComplexComponent = filePath.includes('dashboard') || filePath.includes('admin') || filePath.includes('customizer');
                    maxLines = 300;
                    if (isComplexComponent)
                        maxLines = 450;
                    if (lineCount > maxLines) {
                        violations.push("Exceeds CLAUDE_RULES limit: ".concat(lineCount, " lines (max ").concat(maxLines, ")"));
                    }
                    return [2 /*return*/, {
                            path: filePath,
                            lineCount: lineCount,
                            violations: violations,
                            claudeRulesCompliant: violations.length === 0
                        }];
            }
        });
    });
}
/**
 * Audit specific phase implementation
 */
function auditPhase(phaseName) {
    return __awaiter(this, void 0, void 0, function () {
        var config, allFiles, reports, fileStats, _i, _a, pattern, files, _b, allFiles_1, filePath, content, report, stats, typographyIssues, error_1, auditResult, claudeViolations;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    config = PHASE_CONFIGS[phaseName];
                    if (!config) {
                        throw new Error("Unknown phase: ".concat(phaseName));
                    }
                    console.log("\uD83D\uDD0D Auditing ".concat(config.name, "..."));
                    console.log("\uD83D\uDCCB ".concat(config.description));
                    allFiles = [];
                    reports = [];
                    fileStats = [];
                    _i = 0, _a = config.filePatterns;
                    _d.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    pattern = _a[_i];
                    return [4 /*yield*/, (0, glob_1.glob)(pattern)];
                case 2:
                    files = _d.sent();
                    allFiles.push.apply(allFiles, files);
                    _d.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log("\uD83D\uDCC1 Found ".concat(allFiles.length, " files to audit"));
                    _b = 0, allFiles_1 = allFiles;
                    _d.label = 5;
                case 5:
                    if (!(_b < allFiles_1.length)) return [3 /*break*/, 11];
                    filePath = allFiles_1[_b];
                    _d.label = 6;
                case 6:
                    _d.trys.push([6, 9, , 10]);
                    return [4 /*yield*/, fs_1.promises.readFile(filePath, 'utf-8')
                        // Generate migration report
                    ];
                case 7:
                    content = _d.sent();
                    report = (0, uiSystemMigration_1.generateMigrationReport)(filePath, content);
                    reports.push(report);
                    return [4 /*yield*/, checkClaudeRulesCompliance(filePath)];
                case 8:
                    stats = _d.sent();
                    fileStats.push(stats);
                    // Phase-specific checks
                    if (phaseName === 'typography') {
                        typographyIssues = (0, uiSystemMigration_1.needsTypographyMigration)(content);
                        if (typographyIssues.length > 0 && !(0, uiSystemMigration_1.hasTypographyImports)(content)) {
                            (_c = report.violations).push.apply(_c, typographyIssues);
                        }
                    }
                    return [3 /*break*/, 10];
                case 9:
                    error_1 = _d.sent();
                    console.error("\u274C Error processing ".concat(filePath, ":"), error_1);
                    return [3 /*break*/, 10];
                case 10:
                    _b++;
                    return [3 /*break*/, 5];
                case 11:
                    auditResult = (0, uiSystemMigration_1.validatePhaseCompletion)(phaseName, reports);
                    claudeViolations = fileStats.filter(function (s) { return !s.claudeRulesCompliant; });
                    claudeViolations.forEach(function (violation) {
                        var _a;
                        (_a = auditResult.violations).push.apply(_a, violation.violations);
                    });
                    // Display results
                    console.log("\n\uD83D\uDCCA ".concat(config.name, " Audit Results:"));
                    console.log("\u2705 Files processed: ".concat(allFiles.length));
                    console.log("\uD83D\uDCCF CLAUDE_RULES compliant: ".concat(fileStats.filter(function (s) { return s.claudeRulesCompliant; }).length, "/").concat(fileStats.length));
                    if (auditResult.violations.length === 0) {
                        console.log("\uD83C\uDF89 ".concat(config.name, " PASSED - No violations found"));
                    }
                    else {
                        console.log("\u274C ".concat(config.name, " FAILED - ").concat(auditResult.violations.length, " violations:"));
                        auditResult.violations.forEach(function (violation) {
                            console.log("  \u2022 ".concat(violation));
                        });
                    }
                    if (auditResult.warnings.length > 0) {
                        console.log("\u26A0\uFE0F  Warnings (".concat(auditResult.warnings.length, "):"));
                        auditResult.warnings.forEach(function (warning) {
                            console.log("  \u2022 ".concat(warning));
                        });
                    }
                    // Update audit result with CLAUDE_RULES compliance
                    auditResult.passed = auditResult.violations.length === 0;
                    return [2 /*return*/, auditResult];
            }
        });
    });
}
exports.auditPhase = auditPhase;
/**
 * Audit all phases or specific phase
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var args, targetPhase, result, results, phases, _i, phases_1, phase, result, allPassed, totalViolations, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    args = process.argv.slice(2);
                    targetPhase = args[0];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, , 10]);
                    if (!targetPhase) return [3 /*break*/, 3];
                    return [4 /*yield*/, auditPhase(targetPhase)];
                case 2:
                    result = _a.sent();
                    process.exit(result.passed ? 0 : 1);
                    return [3 /*break*/, 8];
                case 3:
                    // Audit all phases
                    console.log('🔍 Running comprehensive UI system audit...\n');
                    results = [];
                    phases = Object.keys(PHASE_CONFIGS);
                    _i = 0, phases_1 = phases;
                    _a.label = 4;
                case 4:
                    if (!(_i < phases_1.length)) return [3 /*break*/, 7];
                    phase = phases_1[_i];
                    return [4 /*yield*/, auditPhase(phase)];
                case 5:
                    result = _a.sent();
                    results.push(result);
                    console.log('\n' + '='.repeat(60) + '\n');
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7:
                    allPassed = results.every(function (r) { return r.passed; });
                    totalViolations = results.reduce(function (sum, r) { return sum + r.violations.length; }, 0);
                    console.log('📋 COMPREHENSIVE AUDIT SUMMARY:');
                    console.log("\u2705 Phases passed: ".concat(results.filter(function (r) { return r.passed; }).length, "/").concat(results.length));
                    console.log("\u274C Total violations: ".concat(totalViolations));
                    if (allPassed) {
                        console.log('🎉 ALL PHASES PASSED - UI system fully compliant!');
                    }
                    else {
                        console.log('❌ Some phases failed - review violations above');
                    }
                    process.exit(allPassed ? 0 : 1);
                    _a.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_2 = _a.sent();
                    console.error('💥 Audit failed:', error_2);
                    process.exit(1);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
// Run if called directly
if (require.main === module) {
    main();
}
