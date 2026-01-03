/**
 * Args - Command line argument parsing
 */

'use strict';

/**
 * Parse command line arguments
 * @param {string[]} argv - Command line arguments (without node and script)
 * @returns {Object} Parsed options
 * @throws {Error} On invalid arguments
 */
function parseArgs(argv) {
  const options = {
    platform: null,
    lang: null,
    yes: false,
    dryRun: false,
    skillsOnly: false,
    overwrite: false,
    noBackup: false,
    noColor: false,
    help: false,
    version: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    switch (arg) {
      case '--platform':
        options.platform = argv[++i];
        if (!options.platform || !['claude', 'codex'].includes(options.platform)) {
          const err = new Error(`无效的平台参数: ${options.platform}。有效值: claude, codex`);
          err.code = 'INVALID_PARAM';
          throw err;
        }
        break;

      case '--lang':
        options.lang = argv[++i];
        if (!options.lang || !['cn', 'en'].includes(options.lang)) {
          const err = new Error(`无效的语言参数: ${options.lang}。有效值: cn, en`);
          err.code = 'INVALID_PARAM';
          throw err;
        }
        break;

      case '--yes':
      case '-y':
        options.yes = true;
        break;

      case '--dry-run':
        options.dryRun = true;
        break;

      case '--skills-only':
        options.skillsOnly = true;
        break;

      case '--overwrite':
        options.overwrite = true;
        break;

      case '--no-backup':
        options.noBackup = true;
        break;

      case '--no-color':
        options.noColor = true;
        break;

      case '--help':
      case '-h':
        options.help = true;
        break;

      case '--version':
      case '-v':
        options.version = true;
        break;

      default:
        if (arg.startsWith('-')) {
          const err = new Error(`未知参数: ${arg}`);
          err.code = 'INVALID_PARAM';
          throw err;
        }
        break;
    }
  }

  // Check for mutually exclusive options
  if (options.skillsOnly && options.overwrite) {
    const err = new Error('--skills-only 与 --overwrite 不能同时使用');
    err.code = 'MUTEX_PARAMS';
    throw err;
  }

  return options;
}

module.exports = {
  parseArgs,
};
