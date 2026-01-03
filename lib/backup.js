/**
 * Backup - File and directory backup functionality
 */

'use strict';

const path = require('path');
const fsPromises = require('fs').promises;
const { getTimestamp, ensureDir } = require('./utils');

/**
 * Backup a single file
 * @param {string} filePath - Path to file to backup
 * @param {Object} deps - Dependencies
 * @returns {Promise<string>} Backup path
 */
async function backupFile(filePath, deps = {}) {
  const fsModule = deps.fs || fsPromises;
  const timestamp = getTimestamp(deps);

  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);
  const backupPath = path.join(dir, `${base}${ext}.backup-${timestamp}`);

  await fsModule.copyFile(filePath, backupPath);

  return backupPath;
}

/**
 * Backup a directory
 * @param {string} dirPath - Path to directory to backup
 * @param {Object} deps - Dependencies
 * @returns {Promise<string>} Backup path
 */
async function backupDir(dirPath, deps = {}) {
  const fsModule = deps.fs || fsPromises;
  const timestamp = getTimestamp(deps);

  const parent = path.dirname(dirPath);
  const name = path.basename(dirPath);
  const backupPath = path.join(parent, `${name}.backup-${timestamp}`);

  // Recursively copy directory
  await copyDirRecursive(dirPath, backupPath, deps);

  return backupPath;
}

/**
 * Recursively copy a directory
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 * @param {Object} deps - Dependencies
 * @returns {Promise<void>}
 */
async function copyDirRecursive(src, dest, deps = {}) {
  const fsModule = deps.fs || fsPromises;

  await ensureDir(dest, deps);

  const entries = await fsModule.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirRecursive(srcPath, destPath, deps);
    } else {
      await fsModule.copyFile(srcPath, destPath);
    }
  }
}

module.exports = {
  backupFile,
  backupDir,
  copyDirRecursive,
};
