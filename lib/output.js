/**
 * Output - Formatted output with ANSI colors
 */

'use strict';

// Check if colors should be disabled
const NO_COLOR = process.env.NO_COLOR !== undefined || process.argv.includes('--no-color');

// ANSI color codes
const colors = {
  reset: NO_COLOR ? '' : '\x1b[0m',
  bold: NO_COLOR ? '' : '\x1b[1m',
  dim: NO_COLOR ? '' : '\x1b[2m',

  // Foreground colors
  red: NO_COLOR ? '' : '\x1b[31m',
  green: NO_COLOR ? '' : '\x1b[32m',
  yellow: NO_COLOR ? '' : '\x1b[33m',
  blue: NO_COLOR ? '' : '\x1b[34m',
  magenta: NO_COLOR ? '' : '\x1b[35m',
  cyan: NO_COLOR ? '' : '\x1b[36m',
  white: NO_COLOR ? '' : '\x1b[37m',
};

// Symbols
const symbols = {
  success: NO_COLOR ? '[OK]' : '✔',
  error: NO_COLOR ? '[ERROR]' : '✖',
  warning: NO_COLOR ? '[WARN]' : '⚠',
  info: NO_COLOR ? '[INFO]' : 'ℹ',
  arrow: NO_COLOR ? '->' : '→',
  bullet: NO_COLOR ? '*' : '•',
};

/**
 * Create output functions with injectable stdout
 * @param {Object} deps - Dependencies
 * @returns {Object} Output functions
 */
function createOutput(deps = {}) {
  const stdout = deps.stdout || process.stdout;
  const stderr = deps.stderr || process.stderr;

  function write(stream, message) {
    stream.write(message + '\n');
  }

  return {
    /**
     * Print success message
     * @param {string} message
     */
    success(message) {
      write(stdout, `${colors.green}${symbols.success}${colors.reset} ${message}`);
    },

    /**
     * Print error message
     * @param {string} message
     */
    error(message) {
      write(stderr, `${colors.red}${symbols.error}${colors.reset} ${message}`);
    },

    /**
     * Print warning message
     * @param {string} message
     */
    warn(message) {
      write(stdout, `${colors.yellow}${symbols.warning}${colors.reset} ${message}`);
    },

    /**
     * Print info message
     * @param {string} message
     */
    info(message) {
      write(stdout, `${colors.cyan}${symbols.info}${colors.reset} ${message}`);
    },

    /**
     * Print plain message
     * @param {string} message
     */
    log(message) {
      write(stdout, message);
    },

    /**
     * Print empty line
     */
    newline() {
      write(stdout, '');
    },

    /**
     * Print header
     * @param {string} title
     */
    header(title) {
      write(stdout, `\n${colors.bold}${colors.cyan}${title}${colors.reset}\n`);
    },

    /**
     * Print divider
     */
    divider() {
      write(stdout, `${colors.dim}${'─'.repeat(40)}${colors.reset}`);
    },

    /**
     * Print operation item
     * @param {string} source
     * @param {string} target
     * @param {string} action
     */
    operation(source, target, action) {
      write(stdout, `\n源: ${colors.cyan}${source}${colors.reset}`);
      write(stdout, `  ${symbols.arrow} 目标: ${colors.cyan}${target}${colors.reset}`);
      write(stdout, `  ${symbols.arrow} 操作: ${action}`);
    },

    /**
     * Print dry-run summary
     * @param {Object} stats - { write, backup, newFile, skip }
     */
    printDryRunSummary(stats) {
      write(stdout, '');
      write(stdout, `${colors.dim}${'─'.repeat(40)}${colors.reset}`);
      write(stdout, `汇总: 写入 ${stats.write || 0} | 备份 ${stats.backup || 0} | 生成.new ${stats.newFile || 0} | 跳过 ${stats.skip || 0}`);
      write(stdout, '');
      write(stdout, `${colors.yellow}${symbols.warning}${colors.reset}  Dry Run 模式：不会做任何写入`);
    },

    /**
     * Print final summary
     * @param {Object} stats - { write, backup, newFile, skip }
     * @param {Array} backups - List of backup paths
     */
    printSummary(stats, backups = []) {
      write(stdout, '');
      write(stdout, `${colors.dim}${'─'.repeat(40)}${colors.reset}`);
      write(stdout, `${colors.green}${symbols.success}${colors.reset} 安装完成！`);
      write(stdout, '');
      write(stdout, `汇总: 写入 ${stats.write || 0} | 备份 ${stats.backup || 0} | 生成.new ${stats.newFile || 0} | 跳过 ${stats.skip || 0}`);

      if (backups.length > 0) {
        write(stdout, '');
        write(stdout, `${colors.cyan}已创建的备份:${colors.reset}`);
        for (const backup of backups) {
          write(stdout, `  ${symbols.bullet} ${backup}`);
        }
      }
    },

    /**
     * Print welcome message
     */
    printWelcome() {
      write(stdout, '');
      write(stdout, `${colors.bold}${colors.cyan}HelloAGENTS${colors.reset} - AI编程模块化技能系统`);
      write(stdout, `${colors.dim}配置工具 v1.0.0${colors.reset}`);
      write(stdout, '');
    },

    /**
     * Print recovery instructions on failure
     * @param {string} errorMessage
     * @param {Array} backups - List of backup paths
     * @param {string} platform - 'claude' or 'codex'
     */
    printRecoveryInstructions(errorMessage, backups, platform) {
      const configDir = platform === 'claude' ? '.claude' : '.codex';

      write(stderr, '');
      write(stderr, `${colors.red}${symbols.error} 复制失败: ${errorMessage}${colors.reset}`);

      if (backups.length > 0) {
        write(stderr, '');
        write(stderr, `${colors.cyan}已创建的备份:${colors.reset}`);
        for (const backup of backups) {
          write(stderr, `  ${backup}`);
        }

        write(stderr, '');
        write(stderr, `${colors.cyan}恢复命令（如需回滚）:${colors.reset}`);
        write(stderr, '');
        write(stderr, `# macOS/Linux`);
        for (const backup of backups) {
          const original = backup.replace(/\.backup-\d{8}-\d{6}\/?$/, '');
          const name = original.split('/').pop() || original.split('\\').pop();
          write(stderr, `rm -rf ${original}`);
          write(stderr, `mv ${backup} ${original}`);
        }
        write(stderr, '');
        write(stderr, `# Windows PowerShell`);
        for (const backup of backups) {
          const original = backup.replace(/\.backup-\d{8}-\d{6}\/?$/, '');
          const name = original.split('/').pop() || original.split('\\').pop();
          write(stderr, `Remove-Item "${original}" -Recurse -Force`);
          write(stderr, `Rename-Item "${backup}" "${name}"`);
        }
      }

      write(stderr, '');
      write(stderr, `请修复问题后重新运行，或使用上述命令手动恢复。`);
    },
  };
}

// Default instance
const defaultOutput = createOutput();

module.exports = {
  colors,
  symbols,
  createOutput,
  ...defaultOutput,
};
