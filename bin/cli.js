#!/usr/bin/env node

/**
 * HelloAGENTS CLI - Entry Point
 *
 * CLI tool to configure HelloAGENTS for Claude Code and Codex
 */

'use strict';

const { parseArgs } = require('../lib/args');
const { run } = require('../lib/index');
const { error, info } = require('../lib/output');
const pkg = require('../package.json');

const HELP_TEXT = `
HelloAGENTS - AI编程模块化技能系统配置工具

Usage: npx helloagents [options]

Options:
  --platform <claude|codex>  目标平台（跳过交互）
  --lang <cn|en>             语言版本（跳过交互）
  --yes, -y                  全部使用默认选项（非交互）
  --dry-run                  仅显示将执行的操作，不实际写入
  --skills-only              仅更新 skills/helloagents，跳过顶层配置文件
  --overwrite                强制覆盖顶层配置文件（不生成 .new）
  --no-backup                跳过备份步骤
  --no-color                 禁用 ANSI 颜色输出
  --help, -h                 显示帮助
  --version, -v              显示版本

Examples:
  npx helloagents                          # 交互式安装
  npx helloagents -y                       # 使用默认选项安装
  npx helloagents --platform claude --lang cn  # 指定平台和语言
  npx helloagents --dry-run                # 预览将执行的操作
  npx helloagents --skills-only            # 仅更新技能模块

Documentation: https://github.com/hellowind777/helloagents
`;

async function main() {
  try {
    // Parse command line arguments
    const options = parseArgs(process.argv.slice(2));

    // Handle --help
    if (options.help) {
      console.log(HELP_TEXT);
      process.exit(0);
    }

    // Handle --version
    if (options.version) {
      console.log(`helloagents v${pkg.version}`);
      process.exit(0);
    }

    // Run main logic
    await run(options);

  } catch (err) {
    // Handle known error types
    if (err.code === 'MUTEX_PARAMS') {
      error(err.message);
      process.exit(1);
    }

    if (err.code === 'INVALID_PARAM') {
      error(err.message);
      process.exit(1);
    }

    // Handle unexpected errors
    error(`发生错误: ${err.message}`);
    if (process.env.DEBUG) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

// Run CLI
main();
