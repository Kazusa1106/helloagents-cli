/**
 * Prompts - Interactive prompts using native readline
 */

'use strict';

const readline = require('readline');

/**
 * Create readline interface
 * @returns {readline.Interface}
 */
function createReadline() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Ask a question and get answer
 * @param {readline.Interface} rl - Readline interface
 * @param {string} question - Question to ask
 * @returns {Promise<string>}
 */
function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Ask for platform selection
 * @param {readline.Interface} rl - Readline interface
 * @param {string} defaultPlatform - Default platform
 * @param {string} reason - Reason for default
 * @returns {Promise<string>} 'claude' or 'codex'
 */
async function askPlatform(rl, defaultPlatform = 'claude', reason = '') {
  const defaultNum = defaultPlatform === 'claude' ? '1' : '2';
  const reasonText = reason ? ` (${reason})` : '';

  console.log('');
  console.log('选择目标平台:');
  console.log(`  1. Claude Code${defaultPlatform === 'claude' ? ` [默认]${reasonText}` : ''}`);
  console.log(`  2. Codex${defaultPlatform === 'codex' ? ` [默认]${reasonText}` : ''}`);
  console.log('');

  const answer = await ask(rl, `请输入选项 (1-2) [${defaultNum}]: `);

  if (answer === '' || answer === defaultNum) {
    return defaultPlatform;
  }

  if (answer === '1') {
    return 'claude';
  }

  if (answer === '2') {
    return 'codex';
  }

  // Invalid input, ask again
  console.log('无效输入，请输入 1 或 2');
  return askPlatform(rl, defaultPlatform, reason);
}

/**
 * Ask for language selection
 * @param {readline.Interface} rl - Readline interface
 * @param {string} defaultLang - Default language
 * @returns {Promise<string>} 'cn' or 'en'
 */
async function askLanguage(rl, defaultLang = 'cn') {
  const defaultNum = defaultLang === 'cn' ? '1' : '2';

  console.log('');
  console.log('选择语言版本:');
  console.log(`  1. 中文${defaultLang === 'cn' ? ' [默认]' : ''}`);
  console.log(`  2. English${defaultLang === 'en' ? ' [默认]' : ''}`);
  console.log('');

  const answer = await ask(rl, `请输入选项 (1-2) [${defaultNum}]: `);

  if (answer === '' || answer === defaultNum) {
    return defaultLang;
  }

  if (answer === '1') {
    return 'cn';
  }

  if (answer === '2') {
    return 'en';
  }

  // Invalid input, ask again
  console.log('无效输入，请输入 1 或 2');
  return askLanguage(rl, defaultLang);
}

/**
 * Ask for config file conflict resolution
 * @param {readline.Interface} rl - Readline interface
 * @param {string} fileName - Name of the config file
 * @returns {Promise<string>} 'new' | 'backup' | 'overwrite' | 'skip'
 */
async function askConfigConflict(rl, fileName) {
  console.log('');
  console.log(`检测到 ${fileName} 已存在，请选择处理方式:`);
  console.log('  1. 生成 .helloagents.new 文件（保留原文件）[默认]');
  console.log('  2. 备份后覆盖');
  console.log('  3. 直接覆盖（不备份）');
  console.log('  4. 跳过');
  console.log('');

  const answer = await ask(rl, '请输入选项 (1-4) [1]: ');

  switch (answer) {
    case '':
    case '1':
      return 'new';
    case '2':
      return 'backup';
    case '3':
      return 'overwrite';
    case '4':
      return 'skip';
    default:
      console.log('无效输入，请输入 1-4');
      return askConfigConflict(rl, fileName);
  }
}

/**
 * Ask for skills directory conflict resolution
 * @param {readline.Interface} rl - Readline interface
 * @returns {Promise<string>} 'backup' | 'overwrite' | 'skip'
 */
async function askSkillsConflict(rl) {
  console.log('');
  console.log('检测到 skills/helloagents 目录已存在，请选择处理方式:');
  console.log('  1. 备份后覆盖 [默认]');
  console.log('  2. 直接覆盖（不备份）');
  console.log('  3. 跳过');
  console.log('');

  const answer = await ask(rl, '请输入选项 (1-3) [1]: ');

  switch (answer) {
    case '':
    case '1':
      return 'backup';
    case '2':
      return 'overwrite';
    case '3':
      return 'skip';
    default:
      console.log('无效输入，请输入 1-3');
      return askSkillsConflict(rl);
  }
}

module.exports = {
  createReadline,
  ask,
  askPlatform,
  askLanguage,
  askConfigConflict,
  askSkillsConflict,
};
