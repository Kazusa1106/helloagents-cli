/**
 * Test: Dry run mode
 */

'use strict';

const path = require('path');
const {
  createTestEnv,
  cleanupTestEnv,
  createFile,
  createDir,
  fileExists,
  dirExists,
  assert,
  collectOutput,
} = require('../helpers');

const { run } = require('../../lib/index');

module.exports = async function(test) {
  let testDir;

  await test('Dry run shows operations without writing', async () => {
    testDir = await createTestEnv();

    const homeDir = path.join(testDir, 'home');
    await createDir(homeDir);

    const stdout = collectOutput();

    await run({
      platform: 'claude',
      lang: 'cn',
      dryRun: true,
    }, {
      homeDir,
      stdout: stdout.stream,
    });

    // Verify no files were created
    const configFile = path.join(homeDir, '.claude', 'CLAUDE.md');
    const skillsDir = path.join(homeDir, '.claude', 'skills', 'helloagents');

    assert.ok(!(await fileExists(configFile)), 'Config file should not be created in dry run');
    assert.ok(!(await dirExists(skillsDir)), 'Skills directory should not be created in dry run');

    // Verify output contains dry run info
    const output = stdout.getOutput();
    assert.includes(output, 'Dry Run', 'Output should indicate dry run mode');
    assert.includes(output, '不会做任何写入', 'Output should state no writes will be made');
  });

  await test('Dry run with existing files shows conflict handling', async () => {
    testDir = await createTestEnv();

    const homeDir = path.join(testDir, 'home');
    const claudeDir = path.join(homeDir, '.claude');
    await createDir(claudeDir);

    // Create existing config
    await createFile(path.join(claudeDir, 'CLAUDE.md'), '# Existing');

    const stdout = collectOutput();

    await run({
      platform: 'claude',
      lang: 'cn',
      dryRun: true,
    }, {
      homeDir,
      stdout: stdout.stream,
    });

    const output = stdout.getOutput();
    assert.includes(output, '.helloagents.new', 'Output should show .new file will be generated');
    assert.includes(output, '已存在', 'Output should indicate file exists');
  });

  // Cleanup
  if (testDir) {
    await cleanupTestEnv(testDir);
  }
};
