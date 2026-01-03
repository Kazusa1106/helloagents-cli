/**
 * Conflict - Conflict detection and resolution
 */

'use strict';

const path = require('path');
const fsPromises = require('fs').promises;
const { fileExists, dirExists, readFileContent, getTimestamp } = require('./utils');

/**
 * Check if config file exists
 * @param {string} targetPath - Path to config file
 * @param {Object} deps - Dependencies
 * @returns {Promise<boolean>}
 */
async function checkConfigFile(targetPath, deps = {}) {
  return fileExists(targetPath, deps);
}

/**
 * Check if skills directory exists
 * @param {string} targetPath - Path to skills directory
 * @param {Object} deps - Dependencies
 * @returns {Promise<boolean>}
 */
async function checkSkillsDir(targetPath, deps = {}) {
  return dirExists(targetPath, deps);
}

/**
 * Check if .new file exists and compare content
 * @param {string} newFilePath - Path to .new file
 * @param {string} sourceContent - Content to compare
 * @param {Object} deps - Dependencies
 * @returns {Promise<Object>} { exists, sameContent }
 */
async function checkNewFile(newFilePath, sourceContent, deps = {}) {
  const exists = await fileExists(newFilePath, deps);

  if (!exists) {
    return { exists: false, sameContent: false };
  }

  try {
    const existingContent = await readFileContent(newFilePath, deps);
    const sameContent = existingContent === sourceContent;
    return { exists: true, sameContent };
  } catch (err) {
    return { exists: true, sameContent: false };
  }
}

/**
 * Backup existing .new file if content is different
 * @param {string} newFilePath - Path to .new file
 * @param {Object} deps - Dependencies
 * @returns {Promise<string|null>} Backup path or null if no backup needed
 */
async function backupNewFileIfDifferent(newFilePath, deps = {}) {
  const fsModule = deps.fs || fsPromises;
  const timestamp = getTimestamp(deps);

  const dir = path.dirname(newFilePath);
  const name = path.basename(newFilePath);
  const backupPath = path.join(dir, `${name}.backup-${timestamp}`);

  await fsModule.rename(newFilePath, backupPath);

  return backupPath;
}

/**
 * Determine conflict resolution action
 * @param {Object} options - CLI options
 * @param {string} conflictType - 'config' or 'skills'
 * @param {string} userChoice - User's choice from prompt
 * @returns {string} Action to take
 */
function resolveConflict(options, conflictType, userChoice = null) {
  // If user made a choice, use it
  if (userChoice) {
    return userChoice;
  }

  // -y mode: use defaults
  if (options.yes) {
    if (conflictType === 'config') {
      return options.overwrite ? 'overwrite' : 'new';
    }
    if (conflictType === 'skills') {
      return options.noBackup ? 'overwrite' : 'backup';
    }
  }

  // --overwrite flag for config
  if (conflictType === 'config' && options.overwrite) {
    return options.noBackup ? 'overwrite' : 'backup';
  }

  // Default actions
  if (conflictType === 'config') {
    return 'new';
  }
  if (conflictType === 'skills') {
    return options.noBackup ? 'overwrite' : 'backup';
  }

  return 'skip';
}

module.exports = {
  checkConfigFile,
  checkSkillsDir,
  checkNewFile,
  backupNewFileIfDifferent,
  resolveConflict,
};
