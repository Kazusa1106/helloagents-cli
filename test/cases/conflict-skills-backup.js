/**
 * Test: Skills directory conflict - backup and overwrite
 */

'use strict';

const path = require('path');
const fs = require('fs').promises;
const {
  createTestEnv,
  cleanupTestEnv,
  createFile,
  createDir,
  dirExists,
  readFile,
  assert,
  collectOutput,
} = require('../helpers');

const { run } = require('../../lib/index');

module.exports = async function(test) {
  let testDir;

  await test('Existing skills directory is backed up and overwritten', async () => {
    testDir = await createTestEnv();

    const homeDir = path.join(testDir, 'home');
    const claudeDir = path.join(homeDir, '.claude');
    const skillsParentDir = path.join(claudeDir, 'skills');
    const skillsDir = path.join(skillsParentDir, 'helloagents');
    await createDir(skillsDir);

    // Create existing skill file
    await createFile(path.join(skillsDir, 'custom.md'), '# My Custom Skill');

    const stdout = collectOutput();

    // Run with -y flag (default behavior: backup and overwrite)
    await run({
      platform: 'claude',
      lang: 'cn',
      yes: true,
    }, {
      homeDir,
      stdout: stdout.stream,
    });

    // Verify backup was created (check for any backup directory)
    const entries = await fs.readdir(skillsParentDir);
    const backupDirs = entries.filter(e => e.startsWith('helloagents.backup-'));
    assert.ok(backupDirs.length > 0, 'Backup directory should be created');

    // Verify backup contains original file
    const backupDir = path.join(skillsParentDir, backupDirs[0]);
    const backupFile = path.join(backupDir, 'custom.md');
    const backupContent = await readFile(backupFile);
    assert.equal(backupContent, '# My Custom Skill', 'Backup should contain original content');

    // Verify new skills directory exists
    assert.ok(await dirExists(skillsDir), 'Skills directory should exist');

    // Verify output mentions backup
    const output = stdout.getOutput();
    assert.includes(output, '备份', 'Output should mention backup');
  });

  await test('--no-backup skips backup for skills directory', async () => {
    testDir = await createTestEnv();

    const homeDir = path.join(testDir, 'home');
    const claudeDir = path.join(homeDir, '.claude');
    const skillsDir = path.join(claudeDir, 'skills', 'helloagents');
    await createDir(skillsDir);

    await createFile(path.join(skillsDir, 'custom.md'), '# Custom');

    const stdout = collectOutput();

    await run({
      platform: 'claude',
      lang: 'cn',
      yes: true,
      noBackup: true,
    }, {
      homeDir,
      stdout: stdout.stream,
    });

    // Verify no backup directory was created
    const entries = await fs.readdir(path.join(claudeDir, 'skills'));
    const backups = entries.filter(e => e.includes('.backup-'));
    assert.equal(backups.length, 0, 'No backup should be created with --no-backup');
  });

  // Cleanup
  if (testDir) {
    await cleanupTestEnv(testDir);
  }
};
