/**
 * Defaults - Default value detection for platform and language
 */

'use strict';

const path = require('path');
const { dirExists, getHomeDir } = require('./utils');

/**
 * Detect default platform based on existing directories
 * @param {Object} deps - Dependencies
 * @returns {Promise<Object>} { platform, reason }
 */
async function detectDefaultPlatform(deps = {}) {
  const homeDir = getHomeDir(deps);

  const claudeDir = path.join(homeDir, '.claude');
  const codexDir = path.join(homeDir, '.codex');

  const claudeExists = await dirExists(claudeDir, deps);
  const codexExists = await dirExists(codexDir, deps);

  if (codexExists && !claudeExists) {
    return { platform: 'codex', reason: '检测到 ~/.codex' };
  }

  if (claudeExists && !codexExists) {
    return { platform: 'claude', reason: '检测到 ~/.claude' };
  }

  // Both exist or neither exists -> default to claude
  return { platform: 'claude', reason: '默认选择' };
}

/**
 * Get default language
 * @returns {Object} { lang, reason }
 */
function getDefaultLang() {
  return { lang: 'cn', reason: '默认选择' };
}

module.exports = {
  detectDefaultPlatform,
  getDefaultLang,
};
