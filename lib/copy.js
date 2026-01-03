/**
 * Copy - File copying with near-atomic writes
 */

'use strict';

const path = require('path');
const fsPromises = require('fs').promises;
const { randomSuffix, ensureDir, readFileContent } = require('./utils');

/**
 * Copy a file with near-atomic write
 * @param {string} src - Source file path
 * @param {string} dest - Destination file path
 * @param {Object} deps - Dependencies
 * @returns {Promise<void>}
 */
async function copyFile(src, dest, deps = {}) {
  const fsModule = deps.fs || fsPromises;
  const suffix = randomSuffix(deps);

  // Ensure destination directory exists
  await ensureDir(path.dirname(dest), deps);

  // Write to temporary file first
  const tempPath = `${dest}.tmp-${suffix}`;

  try {
    // Copy to temp file
    await fsModule.copyFile(src, tempPath);

    // Verify copy by comparing sizes
    const srcStat = await fsModule.stat(src);
    const tempStat = await fsModule.stat(tempPath);

    if (srcStat.size !== tempStat.size) {
      throw new Error('File copy verification failed: size mismatch');
    }

    // Rename temp to final destination (atomic on most filesystems)
    await fsModule.rename(tempPath, dest);

  } catch (err) {
    // Clean up temp file on failure
    try {
      await fsModule.unlink(tempPath);
    } catch (cleanupErr) {
      // Ignore cleanup errors
    }
    throw err;
  }
}

/**
 * Copy a directory recursively
 * @param {string} src - Source directory path
 * @param {string} dest - Destination directory path
 * @param {Object} deps - Dependencies
 * @returns {Promise<void>}
 */
async function copyDir(src, dest, deps = {}) {
  const fsModule = deps.fs || fsPromises;

  await ensureDir(dest, deps);

  const entries = await fsModule.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath, deps);
    } else {
      await copyFile(srcPath, destPath, deps);
    }
  }
}

/**
 * Write content to .new file
 * @param {string} src - Source file path
 * @param {string} dest - Destination .new file path
 * @param {Object} deps - Dependencies
 * @returns {Promise<void>}
 */
async function writeNewFile(src, dest, deps = {}) {
  await copyFile(src, dest, deps);
}

/**
 * Get list of files in a directory recursively
 * @param {string} dir - Directory path
 * @param {Object} deps - Dependencies
 * @returns {Promise<string[]>} List of relative file paths
 */
async function listFiles(dir, deps = {}) {
  const fsModule = deps.fs || fsPromises;
  const files = [];

  async function walk(currentDir, relativePath = '') {
    const entries = await fsModule.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.join(relativePath, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath, relPath);
      } else {
        files.push(relPath);
      }
    }
  }

  await walk(dir);
  return files;
}

module.exports = {
  copyFile,
  copyDir,
  writeNewFile,
  listFiles,
};
