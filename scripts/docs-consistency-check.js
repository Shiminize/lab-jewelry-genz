#!/usr/bin/env node
const { readFileSync } = require('fs');

const summaryPath = 'IMPLEMENTATION_COMPLETE_SUMMARY.md';
const progressPath = 'Docs/Widget_Program/implementation-progress.md';

function read(path) {
  return readFileSync(path, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    console.error(`Docs consistency check failed: ${message}`);
    process.exit(1);
  }
}

const summary = read(summaryPath);
const progress = read(progressPath);

// Check authority banner present in progress doc
assert(progress.includes('Status Authority: See `IMPLEMENTATION_COMPLETE_SUMMARY.md`'), 'Progress doc must reference summary as authority');

// Summary must explicitly call out recommendation-only scope
assert(/Recommendation Scope/i.test(summary) || /recommendation-only/i.test(summary), 'Summary should call out recommendation-only scope');
// Phase 2 status alignment (progress still tracks completion)
assert(/Phase\s*2:\s*Dashboard\s*&\s*Analytics\s*\(COMPLETED\)/i.test(progress), 'Progress should mark Phase 2 as COMPLETED');

// Harness status alignment (blocked until Mongo + build fixed)
const summaryHarnessBlocked = /`npm run verify:localdb`.*fails/i.test(summary) || /Automation is not yet production ready/i.test(summary);
const progressHarnessBlocked = /Test Harness \(⚠️ BLOCKED\)/.test(progress);
assert(summaryHarnessBlocked && progressHarnessBlocked, 'Harness status must be marked as blocked in both docs');

console.log('Docs consistency check passed.');
