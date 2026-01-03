/**
 * Test: First Install (no existing files)
 */

'use strict';

const path = require('path');
const {
  createTestEnv,
  cleanupTestEnv,
  createDir,
  fileExists,
  dirExists,
  assert,
} = require('../helpers');

const { run } = require('../../lib/index');
const { collectOutput } = require('../helpers');

module.exports = async function(test) {
  let testDir;

  await test('First install creates config file and skills directory', async () => {
    testDir = await createTestEnv();

    // Create mock home directory structure
    const homeDir = path.join(testDir, 'home');
    await createDir(homeDir);

    // Collect output
    const stdout = collectOutput();
    const stderr = collectOutput();

    // Run with -y flag to skip prompts
    await run({
      platform: 'claude',
      lang: 'cn',
      yes: true,
    }, {
      homeDir,
      stdout: stdout.stream,
      stderr: stderr.stream,
    });

    // Verify files were created
    const configFile = path.join(homeDir, '.claude', 'CLAUDE.md');
    const skillsDir = path.join(homeDir, '.claude', 'skills', 'helloagents');

    assert.ok(await fileExists(configFile), 'CLAUDE.md should be created');
    assert.ok(await dirExists(skillsDir), 'skills/helloagents should be created');

    // Verify output contains success message
    const output = stdout.getOutput();
    assert.includes(output, '已写入', 'Output should indicate files were written');
  });

  await test('First install for Codex creates AGENTS.md', async () => {
    testDir = await createTestEnv();

    const homeDir = path.join(testDir, 'home');
    await createDir(homeDir);

    const stdout = collectOutput();

    await run({
      platform: 'codex',
      lang: 'en',
      yes: true,
    }, {
      homeDir,
      stdout: stdout.stream,
    });

    const configFile = path.join(homeDir, '.codex', 'AGENTS.md');
    const skillsDir = path.join(homeDir, '.codex', 'skills', 'helloagents');

    assert.ok(await fileExists(configFile), 'AGENTS.md should be created');
    assert.ok(await dirExists(skillsDir), 'skills/helloagents should be created');
  });

  // Cleanup
  if (testDir) {
    await cleanupTestEnv(testDir);
  }
};
