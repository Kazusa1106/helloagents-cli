/**
 * Test: Mutually exclusive parameters
 */

'use strict';

const { parseArgs } = require('../../lib/args');
const { assert } = require('../helpers');

module.exports = async function(test) {
  await test('--skills-only and --overwrite are mutually exclusive', async () => {
    let error = null;

    try {
      parseArgs(['--skills-only', '--overwrite']);
    } catch (err) {
      error = err;
    }

    assert.ok(error, 'Should throw an error');
    assert.equal(error.code, 'MUTEX_PARAMS', 'Error code should be MUTEX_PARAMS');
    assert.includes(error.message, '--skills-only', 'Error should mention --skills-only');
    assert.includes(error.message, '--overwrite', 'Error should mention --overwrite');
  });

  await test('Invalid platform value throws error', async () => {
    let error = null;

    try {
      parseArgs(['--platform', 'invalid']);
    } catch (err) {
      error = err;
    }

    assert.ok(error, 'Should throw an error');
    assert.equal(error.code, 'INVALID_PARAM', 'Error code should be INVALID_PARAM');
  });

  await test('Invalid lang value throws error', async () => {
    let error = null;

    try {
      parseArgs(['--lang', 'fr']);
    } catch (err) {
      error = err;
    }

    assert.ok(error, 'Should throw an error');
    assert.equal(error.code, 'INVALID_PARAM', 'Error code should be INVALID_PARAM');
  });

  await test('Unknown parameter throws error', async () => {
    let error = null;

    try {
      parseArgs(['--unknown-param']);
    } catch (err) {
      error = err;
    }

    assert.ok(error, 'Should throw an error');
    assert.equal(error.code, 'INVALID_PARAM', 'Error code should be INVALID_PARAM');
  });

  await test('Valid parameters parse correctly', async () => {
    const options = parseArgs([
      '--platform', 'codex',
      '--lang', 'en',
      '-y',
      '--dry-run',
      '--no-backup',
      '--no-color',
    ]);

    assert.equal(options.platform, 'codex', 'Platform should be codex');
    assert.equal(options.lang, 'en', 'Lang should be en');
    assert.ok(options.yes, 'yes should be true');
    assert.ok(options.dryRun, 'dryRun should be true');
    assert.ok(options.noBackup, 'noBackup should be true');
    assert.ok(options.noColor, 'noColor should be true');
  });
};
