/**
 * Test Helpers - Utilities for testing
 */

'use strict';

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

/**
 * Create a temporary test environment
 * @returns {Promise<string>} Path to temp directory
 */
async function createTestEnv() {
  const prefix = path.join(os.tmpdir(), 'helloagents-');
  return fsPromises.mkdtemp(prefix);
}

/**
 * Clean up test environment (Node 14 compatible)
 * @param {string} dir - Directory to clean up
 * @returns {Promise<void>}
 */
async function cleanupTestEnv(dir) {
  if (!dir || !dir.includes('helloagents-')) {
    throw new Error('Safety check: refusing to delete non-test directory');
  }

  // Try fs.rm first (Node 14.14+)
  if (fsPromises.rm) {
    try {
      await fsPromises.rm(dir, { recursive: true, force: true });
      return;
    } catch (err) {
      // Fall through
    }
  }

  // Fallback to fs.rmdir with recursive
  if (fsPromises.rmdir) {
    await fsPromises.rmdir(dir, { recursive: true });
    return;
  }

  // Manual recursive delete
  await rmrfManual(dir);
}

/**
 * Manual recursive delete
 * @param {string} targetPath - Path to delete
 */
async function rmrfManual(targetPath) {
  const stat = await fsPromises.stat(targetPath);

  if (stat.isDirectory()) {
    const entries = await fsPromises.readdir(targetPath);
    for (const entry of entries) {
      await rmrfManual(path.join(targetPath, entry));
    }
    await fsPromises.rmdir(targetPath);
  } else {
    await fsPromises.unlink(targetPath);
  }
}

/**
 * Create mock fs wrapper with optional fault injection
 * @param {Object} overrides - Functions to override
 * @returns {Object} Mock fs object
 */
function createMockFs(overrides = {}) {
  return {
    stat: overrides.stat || fsPromises.stat.bind(fsPromises),
    readdir: overrides.readdir || fsPromises.readdir.bind(fsPromises),
    readFile: overrides.readFile || fsPromises.readFile.bind(fsPromises),
    writeFile: overrides.writeFile || fsPromises.writeFile.bind(fsPromises),
    copyFile: overrides.copyFile || fsPromises.copyFile.bind(fsPromises),
    rename: overrides.rename || fsPromises.rename.bind(fsPromises),
    unlink: overrides.unlink || fsPromises.unlink.bind(fsPromises),
    mkdir: overrides.mkdir || fsPromises.mkdir.bind(fsPromises),
    rmdir: overrides.rmdir || fsPromises.rmdir.bind(fsPromises),
    rm: overrides.rm || (fsPromises.rm ? fsPromises.rm.bind(fsPromises) : undefined),
  };
}

/**
 * Create standardized mock dependencies
 * @param {Object} overrides - Values to override
 * @returns {Object} Mock dependencies
 */
function createMockDeps(overrides = {}) {
  return {
    fs: overrides.fs || createMockFs(overrides.fsOverrides),
    homeDir: overrides.homeDir || os.tmpdir(),
    now: overrides.now || (() => new Date('2026-01-03T12:00:00Z')),
    getTimestamp: overrides.getTimestamp || (() => '20260103-120000'),
    randomSuffix: overrides.randomSuffix || (() => 'abc123'),
    stdout: overrides.stdout || process.stdout,
    stderr: overrides.stderr || process.stderr,
  };
}

/**
 * Collect output from a writable stream
 * @returns {Object} { stream, getOutput }
 */
function collectOutput() {
  const chunks = [];

  const stream = {
    write(chunk) {
      chunks.push(chunk);
      return true;
    },
  };

  return {
    stream,
    getOutput() {
      return chunks.join('');
    },
  };
}

/**
 * Spawn process with timeout
 * @param {string} cmd - Command to run
 * @param {string[]} args - Arguments
 * @param {Object} opts - Spawn options
 * @param {number} timeout - Timeout in ms (default 10000)
 * @returns {Promise<Object>} { code, stdout, stderr }
 */
function spawnWithTimeout(cmd, args, opts = {}, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      ...opts,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const stdout = [];
    const stderr = [];

    proc.stdout.on('data', (data) => stdout.push(data));
    proc.stderr.on('data', (data) => stderr.push(data));

    const timer = setTimeout(() => {
      proc.kill('SIGTERM');
      reject(new Error(`Process timed out after ${timeout}ms`));
    }, timeout);

    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        code,
        stdout: Buffer.concat(stdout).toString(),
        stderr: Buffer.concat(stderr).toString(),
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

/**
 * Create a file with content
 * @param {string} filePath - Path to file
 * @param {string} content - File content
 */
async function createFile(filePath, content = '') {
  await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
  await fsPromises.writeFile(filePath, content, 'utf8');
}

/**
 * Create a directory
 * @param {string} dirPath - Path to directory
 */
async function createDir(dirPath) {
  await fsPromises.mkdir(dirPath, { recursive: true });
}

/**
 * Check if file exists
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>}
 */
async function fileExists(filePath) {
  try {
    const stat = await fsPromises.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

/**
 * Check if directory exists
 * @param {string} dirPath - Path to check
 * @returns {Promise<boolean>}
 */
async function dirExists(dirPath) {
  try {
    const stat = await fsPromises.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Read file content
 * @param {string} filePath - Path to file
 * @returns {Promise<string>}
 */
async function readFile(filePath) {
  return fsPromises.readFile(filePath, 'utf8');
}

/**
 * Simple assertion helper
 */
const assert = {
  equal(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
  },

  notEqual(actual, expected, message = '') {
    if (actual === expected) {
      throw new Error(`${message}\nExpected not equal to: ${expected}`);
    }
  },

  ok(value, message = '') {
    if (!value) {
      throw new Error(message || `Expected truthy value, got: ${value}`);
    }
  },

  throws(fn, message = '') {
    let threw = false;
    try {
      fn();
    } catch {
      threw = true;
    }
    if (!threw) {
      throw new Error(message || 'Expected function to throw');
    }
  },

  async rejects(promise, message = '') {
    let threw = false;
    try {
      await promise;
    } catch {
      threw = true;
    }
    if (!threw) {
      throw new Error(message || 'Expected promise to reject');
    }
  },

  includes(str, substr, message = '') {
    if (!str.includes(substr)) {
      throw new Error(`${message}\nExpected "${str}" to include "${substr}"`);
    }
  },

  match(str, pattern, message = '') {
    if (!pattern.test(str)) {
      throw new Error(`${message}\nExpected "${str}" to match ${pattern}`);
    }
  },
};

module.exports = {
  createTestEnv,
  cleanupTestEnv,
  createMockFs,
  createMockDeps,
  collectOutput,
  spawnWithTimeout,
  createFile,
  createDir,
  fileExists,
  dirExists,
  readFile,
  assert,
};
