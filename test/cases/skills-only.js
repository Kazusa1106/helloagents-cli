/**
 * Test: --skills-only parameter
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
  readFile,
  assert,
  collectOutput,
} = require('../helpers');

const { run } = require('../../lib/index');

module.exports = async function(test) {
  let testDir;

  await test('--skills-only skips config file', async () => {
    testDir = await createTestEnv();

    const homeDir = path.join(testDir, 'home');
    const claudeDir = path.join(homeDir, '.claude');
    await createDir(claudeDir);

    // Create existing config that should not be touched
    const configFile = path.join(claudeDir, 'CLAUDE.md');
    await createFile(configFile, '# My Custom Config');

    const stdout = collectOutput();

    await run({
      platform: 'claude',
      lang: 'cn',
      yes: true,
      skillsOnly: true,
    }, {
      homeDir,
      stdout: stdout.stream,
    });

    // Verify config file is unchanged
    const content = await readFile(configFile);
    assert.equal(content, '# My Custom Config', 'Config file should be unchanged');

    // Verify no .new file was created
    const newFile = path.join(claudeDir, '.helloagents.new');
    assert.ok(!(await fileExists(newFile)), '.new file should not be created');

    // Verify skills directory was created
    const skillsDir = path.join(claudeDir, 'skills', 'helloagents');
    assert.ok(await dirExists(skillsDir), 'Skills directory should be created');
  });

  await test('--skills-only with no existing config still works', async () => {
    testDir = await createTestEnv();

    const homeDir = path.join(testDir, 'home');
    await createDir(homeDir);

    const stdout = collectOutput();

    await run({
      platform: 'claude',
      lang: 'cn',
      yes: true,
      skillsOnly: true,
    }, {
      homeDir,
      stdout: stdout.stream,
    });

    // Verify no config file was created
    const configFile = path.join(homeDir, '.claude', 'CLAUDE.md');
    assert.ok(!(await fileExists(configFile)), 'Config file should not be created');

    // Verify skills directory was created
    const skillsDir = path.join(homeDir, '.claude', 'skills', 'helloagents');
    assert.ok(await dirExists(skillsDir), 'Skills directory should be created');
  });

  // Cleanup
  if (testDir) {
    await cleanupTestEnv(testDir);
  }
};
