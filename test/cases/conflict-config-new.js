/**
 * Test: Config file conflict - generate .new file
 */

'use strict';

const path = require('path');
const {
  createTestEnv,
  cleanupTestEnv,
  createFile,
  createDir,
  fileExists,
  readFile,
  assert,
  collectOutput,
} = require('../helpers');

const { run } = require('../../lib/index');

module.exports = async function(test) {
  let testDir;

  await test('Existing config file generates .helloagents.new', async () => {
    testDir = await createTestEnv();

    const homeDir = path.join(testDir, 'home');
    const claudeDir = path.join(homeDir, '.claude');
    await createDir(claudeDir);

    // Create existing CLAUDE.md with custom content
    const existingConfig = path.join(claudeDir, 'CLAUDE.md');
    await createFile(existingConfig, '# My Custom Config\n\nDo not overwrite!');

    const stdout = collectOutput();

    // Run with -y flag (default behavior: generate .new)
    await run({
      platform: 'claude',
      lang: 'cn',
      yes: true,
    }, {
      homeDir,
      stdout: stdout.stream,
    });

    // Verify original file is unchanged
    const originalContent = await readFile(existingConfig);
    assert.equal(originalContent, '# My Custom Config\n\nDo not overwrite!', 'Original file should be unchanged');

    // Verify .new file was created
    const newFile = path.join(claudeDir, '.helloagents.new');
    assert.ok(await fileExists(newFile), '.helloagents.new should be created');

    // Verify output mentions .new file
    const output = stdout.getOutput();
    assert.includes(output, '.helloagents.new', 'Output should mention .new file');
  });

  await test('Same content .new file is skipped', async () => {
    testDir = await createTestEnv();

    const homeDir = path.join(testDir, 'home');
    const claudeDir = path.join(homeDir, '.claude');
    await createDir(claudeDir);

    // Create existing CLAUDE.md
    await createFile(path.join(claudeDir, 'CLAUDE.md'), '# Existing');

    // First run to create .new file
    await run({
      platform: 'claude',
      lang: 'cn',
      yes: true,
    }, {
      homeDir,
      stdout: collectOutput().stream,
    });

    // Second run should skip
    const stdout = collectOutput();
    await run({
      platform: 'claude',
      lang: 'cn',
      yes: true,
    }, {
      homeDir,
      stdout: stdout.stream,
    });

    const output = stdout.getOutput();
    assert.includes(output, '已是最新', 'Output should indicate .new is up to date');
  });

  // Cleanup
  if (testDir) {
    await cleanupTestEnv(testDir);
  }
};
