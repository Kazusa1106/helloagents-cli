/**
 * Test Runner - Zero-dependency test framework
 */

'use strict';

const path = require('path');
const fs = require('fs');

// Test results
const results = {
  passed: 0,
  failed: 0,
  errors: [],
};

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

/**
 * Run a single test case
 * @param {string} name - Test name
 * @param {Function} fn - Test function
 */
async function runTest(name, fn) {
  try {
    await fn();
    results.passed++;
    console.log(`  ${colors.green}✔${colors.reset} ${name}`);
  } catch (err) {
    results.failed++;
    results.errors.push({ name, error: err });
    console.log(`  ${colors.red}✖${colors.reset} ${name}`);
    console.log(`    ${colors.dim}${err.message}${colors.reset}`);
  }
}

/**
 * Run all test files in a directory
 * @param {string} dir - Directory containing test files
 */
async function runTestDir(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const testPath = path.join(dir, file);
    console.log(`\n${colors.cyan}${file}${colors.reset}`);

    try {
      const testModule = require(testPath);

      if (typeof testModule === 'function') {
        await testModule(runTest);
      } else if (typeof testModule.run === 'function') {
        await testModule.run(runTest);
      } else {
        console.log(`  ${colors.yellow}⚠${colors.reset} No runnable tests found`);
      }
    } catch (err) {
      results.failed++;
      results.errors.push({ name: file, error: err });
      console.log(`  ${colors.red}✖${colors.reset} Failed to load: ${err.message}`);
    }
  }
}

/**
 * Main entry point
 */
async function main() {
  console.log(`\n${colors.cyan}HelloAGENTS CLI Tests${colors.reset}\n`);
  console.log(`${'─'.repeat(40)}`);

  const casesDir = path.join(__dirname, 'cases');

  // Check if cases directory exists
  if (!fs.existsSync(casesDir)) {
    console.log(`${colors.yellow}⚠${colors.reset} No test cases directory found`);
    console.log(`  Creating ${casesDir}...`);
    fs.mkdirSync(casesDir, { recursive: true });
  }

  // Run all test cases
  await runTestDir(casesDir);

  // Print summary
  console.log(`\n${'─'.repeat(40)}`);
  console.log(`\n${colors.cyan}Summary${colors.reset}`);
  console.log(`  ${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${results.failed}${colors.reset}`);

  // Print error details
  if (results.errors.length > 0) {
    console.log(`\n${colors.red}Failures:${colors.reset}`);
    for (const { name, error } of results.errors) {
      console.log(`\n  ${name}:`);
      console.log(`    ${error.stack || error.message}`);
    }
  }

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error(`${colors.red}Test runner error:${colors.reset}`, err);
  process.exit(1);
});
