/**
 * Utils - Utility functions with dependency injection support
 */

'use strict';

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const os = require('os');

/**
 * Get home directory (injectable for testing)
 * @param {Object} deps - Dependencies
 * @returns {string} Home directory path
 */
function getHomeDir(deps = {}) {
  if (deps.homeDir) {
    return deps.homeDir;
  }
  return os.homedir();
}

/**
 * Get timestamp string (injectable for testing)
 * @param {Object} deps - Dependencies
 * @returns {string} Timestamp in YYYYMMDD-HHmmss format
 */
function getTimestamp(deps = {}) {
  const now = deps.now ? deps.now() : new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

/**
 * Generate random suffix (injectable for testing)
 * @param {Object} deps - Dependencies
 * @returns {string} Random 6-character string
 */
function randomSuffix(deps = {}) {
  if (deps.randomSuffix) {
    return deps.randomSuffix();
  }
  return Math.random().toString(36).slice(2, 8);
}

/**
 * Check if file exists
 * @param {string} filePath - Path to check
 * @param {Object} deps - Dependencies
 * @returns {Promise<boolean>}
 */
async function fileExists(filePath, deps = {}) {
  const fsModule = deps.fs || fsPromises;
  try {
    const stat = await fsModule.stat(filePath);
    return stat.isFile();
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}

/**
 * Check if directory exists
 * @param {string} dirPath - Path to check
 * @param {Object} deps - Dependencies
 * @returns {Promise<boolean>}
 */
async function dirExists(dirPath, deps = {}) {
  const fsModule = deps.fs || fsPromises;
  try {
    const stat = await fsModule.stat(dirPath);
    return stat.isDirectory();
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}

/**
 * Read file content
 * @param {string} filePath - Path to read
 * @param {Object} deps - Dependencies
 * @returns {Promise<string>}
 */
async function readFileContent(filePath, deps = {}) {
  const fsModule = deps.fs || fsPromises;
  return fsModule.readFile(filePath, 'utf8');
}

/**
 * Recursive delete (compatible with Node 16)
 * @param {string} targetPath - Path to delete
 * @param {Object} deps - Dependencies
 * @returns {Promise<void>}
 */
async function rmrf(targetPath, deps = {}) {
  const fsModule = deps.fs || fsPromises;

  // Check if path exists
  try {
    await fsModule.stat(targetPath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return; // Already doesn't exist
    }
    throw err;
  }

  // Try fs.rm first (Node 16+)
  if (fsModule.rm) {
    try {
      await fsModule.rm(targetPath, { recursive: true, force: true });
      return;
    } catch (err) {
      // Fall through to rmdir
    }
  }

  // Fallback to fs.rmdir with recursive (Node 16+)
  if (fsModule.rmdir) {
    await fsModule.rmdir(targetPath, { recursive: true });
    return;
  }

  // Manual recursive delete as last resort
  const stat = await fsModule.stat(targetPath);
  if (stat.isDirectory()) {
    const entries = await fsModule.readdir(targetPath);
    for (const entry of entries) {
      await rmrf(path.join(targetPath, entry), deps);
    }
    await fsModule.rmdir(targetPath);
  } else {
    await fsModule.unlink(targetPath);
  }
}

/**
 * Ensure directory exists (create if not)
 * @param {string} dirPath - Directory path
 * @param {Object} deps - Dependencies
 * @returns {Promise<void>}
 */
async function ensureDir(dirPath, deps = {}) {
  const fsModule = deps.fs || fsPromises;
  try {
    await fsModule.mkdir(dirPath, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
}

/**
 * Get package root directory (where package.json is)
 * @returns {string}
 */
function getPackageRoot() {
  return path.resolve(__dirname, '..');
}

/**
 * Get source path for platform and language
 * @param {string} platform - 'claude' or 'codex'
 * @param {string} lang - 'cn' or 'en'
 * @returns {Object} { configFile, skillsDir }
 */
function getSourcePaths(platform, lang) {
  const root = getPackageRoot();
  const platformDir = platform === 'claude' ? 'Claude' : 'Codex';
  const langDir = lang === 'cn' ? 'CN' : 'EN';
  const configFileName = platform === 'claude' ? 'CLAUDE.md' : 'AGENTS.md';

  return {
    configFile: path.join(root, platformDir, 'Skills', langDir, configFileName),
    skillsDir: path.join(root, platformDir, 'Skills', langDir, 'skills', 'helloagents'),
  };
}

/**
 * Get target path for platform
 * @param {string} platform - 'claude' or 'codex'
 * @param {Object} deps - Dependencies
 * @returns {Object} { targetDir, configFile, skillsDir, newFile }
 */
function getTargetPaths(platform, deps = {}) {
  const homeDir = getHomeDir(deps);
  const targetDir = platform === 'claude'
    ? path.join(homeDir, '.claude')
    : path.join(homeDir, '.codex');
  const configFileName = platform === 'claude' ? 'CLAUDE.md' : 'AGENTS.md';

  return {
    targetDir,
    configFile: path.join(targetDir, configFileName),
    skillsDir: path.join(targetDir, 'skills', 'helloagents'),
    newFile: path.join(targetDir, '.helloagents.new'),
  };
}

module.exports = {
  getHomeDir,
  getTimestamp,
  randomSuffix,
  fileExists,
  dirExists,
  readFileContent,
  rmrf,
  ensureDir,
  getPackageRoot,
  getSourcePaths,
  getTargetPaths,
};
