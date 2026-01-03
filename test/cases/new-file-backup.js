/**
 * Test: .new file backup when content differs
 */

'use strict';

const path = require('path');
const fs = require('fs').promises;
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

  await test('Existing .new file with different content is backed up', async () => {
    testDir = await createTestEnv();

    const homeDir = path.join(testDir, 'home');
    const claudeDir = path.join(homeDir, '.claude');
    await createDir(claudeDir);

    // Create existing CLAUDE.md
    await createFile(path.join(claudeDir, 'CLAUDE.md'), '# Existing Config');

    // Create existing .new file with different content
    const newFile = path.join(claudeDir, '.helloagents.new');
    await createFile(newFile, '# Old New File Content');

    const stdout = collectOutput();

    await run({
      platform: 'claude',
      lang: 'cn',
      yes: true,
    }, {
      homeDir,
      stdout: stdout.stream,
    });

    // Verify old .new file was backed up (check for any backup file)
    const entries = await fs.readdir(claudeDir);
    const backupFiles = entries.filter(e => e.startsWith('.helloagents.new.backup-'));
    assert.ok(backupFiles.length > 0, 'Backup of old .new file should exist');

    // Verify backup contains original content
    const backupFile = path.join(claudeDir, backupFiles[0]);
    const backupContent = await readFile(backupFile);
    assert.equal(backupContent, '# Old New File Content', 'Backup should contain old content');

    // Verify new .new file was created
    assert.ok(await fileExists(newFile), 'New .new file should exist');

    // Verify output mentions backup
    const output = stdout.getOutput();
    assert.includes(output, '备份', 'Output should mention backup');
  });

  // Cleanup
  if (testDir) {
    await cleanupTestEnv(testDir);
  }
};
