/**
 * Test: Default platform detection
 */

'use strict';

const path = require('path');
const {
  createTestEnv,
  cleanupTestEnv,
  createDir,
  assert,
} = require('../helpers');

const { detectDefaultPlatform } = require('../../lib/defaults');

module.exports = async function(test) {
  let testDir;

  await test('Only ~/.codex exists -> default to codex', async () => {
    testDir = await createTestEnv();

    const homeDir = path.join(testDir, 'home');
    await createDir(path.join(homeDir, '.codex'));

    const result = await detectDefaultPlatform({ homeDir });

    assert.equal(result.platform, 'codex', 'Should default to codex');
    assert.includes(result.reason, '.codex', 'Reason should mention .codex');
  });

  await test('Only ~/.claude exists -> default to claude', async () => {
    testDir = await createTestEnv();

    const homeDir = path.join(testDir, 'home');
    await createDir(path.join(homeDir, '.claude'));

    const result = await detectDefaultPlatform({ homeDir });

    assert.equal(result.platform, 'claude', 'Should default to claude');
    assert.includes(result.reason, '.claude', 'Reason should mention .claude');
  });

  await test('Neither exists -> default to claude', async () => {
    testDir = await createTestEnv();

    const homeDir = path.join(testDir, 'home');
    await createDir(homeDir);

    const result = await detectDefaultPlatform({ homeDir });

    assert.equal(result.platform, 'claude', 'Should default to claude');
  });

  await test('Both exist -> default to claude', async () => {
    testDir = await createTestEnv();

    const homeDir = path.join(testDir, 'home');
    await createDir(path.join(homeDir, '.claude'));
    await createDir(path.join(homeDir, '.codex'));

    const result = await detectDefaultPlatform({ homeDir });

    assert.equal(result.platform, 'claude', 'Should default to claude when both exist');
  });

  // Cleanup
  if (testDir) {
    await cleanupTestEnv(testDir);
  }
};
