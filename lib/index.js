/**
 * Index - Main flow implementation
 */

'use strict';

const path = require('path');
const fsPromises = require('fs').promises;

const { getHomeDir, getSourcePaths, getTargetPaths, fileExists, dirExists, readFileContent, rmrf, ensureDir } = require('./utils');
const { detectDefaultPlatform, getDefaultLang } = require('./defaults');
const { createReadline, askPlatform, askLanguage, askConfigConflict, askSkillsConflict } = require('./prompts');
const { backupFile, backupDir } = require('./backup');
const { checkConfigFile, checkSkillsDir, checkNewFile, backupNewFileIfDifferent, resolveConflict } = require('./conflict');
const { copyFile, copyDir, writeNewFile, listFiles } = require('./copy');
const { createOutput, printWelcome, printSummary, printDryRunSummary, printRecoveryInstructions, info, success, warn, error, log, newline, header, divider, operation } = require('./output');

/**
 * Main run function
 * @param {Object} options - CLI options
 * @param {Object} deps - Dependencies for testing
 * @returns {Promise<void>}
 */
async function run(options, deps = {}) {
  const fsModule = deps.fs || fsPromises;
  const homeDir = getHomeDir(deps);
  const output = deps.output || createOutput(deps);

  // Track stats and backups
  const stats = { write: 0, backup: 0, newFile: 0, skip: 0 };
  const backups = [];

  // Readline interface (only created if needed)
  let rl = null;

  try {
    // Print welcome message
    output.printWelcome();

    // Determine platform
    let platform = options.platform;
    let platformReason = '';

    if (!platform) {
      if (options.yes) {
        // Auto-detect in -y mode
        const detected = await detectDefaultPlatform(deps);
        platform = detected.platform;
        platformReason = detected.reason;
        output.info(`[默认] ${platformReason}，使用 ${platform === 'claude' ? 'Claude Code' : 'Codex'}`);
      } else {
        // Interactive mode
        rl = createReadline();
        const detected = await detectDefaultPlatform(deps);
        platform = await askPlatform(rl, detected.platform, detected.reason);
      }
    } else {
      output.info(`使用指定平台: ${platform === 'claude' ? 'Claude Code' : 'Codex'}`);
    }

    // Determine language
    let lang = options.lang;

    if (!lang) {
      if (options.yes) {
        // Use default in -y mode
        const defaultLang = getDefaultLang();
        lang = defaultLang.lang;
        output.info(`[默认] 使用语言: ${lang === 'cn' ? '中文' : 'English'}`);
      } else {
        // Interactive mode
        if (!rl) {
          rl = createReadline();
        }
        const defaultLang = getDefaultLang();
        lang = await askLanguage(rl, defaultLang.lang);
      }
    } else {
      output.info(`使用指定语言: ${lang === 'cn' ? '中文' : 'English'}`);
    }

    // Get source and target paths
    const sourcePaths = getSourcePaths(platform, lang);
    const targetPaths = getTargetPaths(platform, deps);

    // Validate source files exist
    const sourceConfigExists = await fileExists(sourcePaths.configFile, deps);
    const sourceSkillsExists = await dirExists(sourcePaths.skillsDir, deps);

    if (!sourceConfigExists) {
      throw new Error(`源配置文件不存在: ${sourcePaths.configFile}`);
    }

    if (!sourceSkillsExists) {
      throw new Error(`源技能目录不存在: ${sourcePaths.skillsDir}`);
    }

    // Ensure target directory exists
    await ensureDir(targetPaths.targetDir, deps);

    // Dry run mode
    if (options.dryRun) {
      output.header('[Dry Run] 以下操作不会实际执行：');

      // Check config file
      if (!options.skillsOnly) {
        const configExists = await checkConfigFile(targetPaths.configFile, deps);
        const configFileName = platform === 'claude' ? 'CLAUDE.md' : 'AGENTS.md';

        if (configExists) {
          if (options.overwrite) {
            output.operation(sourcePaths.configFile, targetPaths.configFile, '备份后覆盖');
            stats.backup++;
            stats.write++;
          } else {
            output.operation(sourcePaths.configFile, targetPaths.newFile, `生成 .helloagents.new（${configFileName} 已存在）`);
            stats.newFile++;
          }
        } else {
          output.operation(sourcePaths.configFile, targetPaths.configFile, '写入');
          stats.write++;
        }
      }

      // Check skills directory
      const skillsExists = await checkSkillsDir(targetPaths.skillsDir, deps);

      if (skillsExists) {
        if (options.noBackup) {
          output.operation(sourcePaths.skillsDir, targetPaths.skillsDir, '直接覆盖');
        } else {
          output.operation(sourcePaths.skillsDir, targetPaths.skillsDir, '备份后覆盖');
          stats.backup++;
        }
        stats.write++;
      } else {
        output.operation(sourcePaths.skillsDir, targetPaths.skillsDir, '写入');
        stats.write++;
      }

      output.printDryRunSummary(stats);
      return;
    }

    // Process config file (unless --skills-only)
    if (!options.skillsOnly) {
      const configExists = await checkConfigFile(targetPaths.configFile, deps);
      const configFileName = platform === 'claude' ? 'CLAUDE.md' : 'AGENTS.md';

      if (configExists) {
        // Determine action
        let action;
        if (options.yes) {
          action = resolveConflict(options, 'config');
        } else {
          if (!rl) {
            rl = createReadline();
          }
          action = await askConfigConflict(rl, configFileName);
        }

        switch (action) {
          case 'new': {
            // Check if .new file already exists
            const sourceContent = await readFileContent(sourcePaths.configFile, deps);
            const newFileStatus = await checkNewFile(targetPaths.newFile, sourceContent, deps);

            if (newFileStatus.exists) {
              if (newFileStatus.sameContent) {
                output.info(`.helloagents.new 已是最新，跳过`);
                stats.skip++;
              } else {
                // Backup existing .new file
                const newBackupPath = await backupNewFileIfDifferent(targetPaths.newFile, deps);
                backups.push(newBackupPath);
                output.info(`已备份旧的 .helloagents.new 至 ${path.basename(newBackupPath)}`);
                stats.backup++;

                // Write new .new file
                await writeNewFile(sourcePaths.configFile, targetPaths.newFile, deps);
                output.success(`已生成 .helloagents.new`);
                stats.newFile++;
              }
            } else {
              await writeNewFile(sourcePaths.configFile, targetPaths.newFile, deps);
              output.success(`已生成 .helloagents.new`);
              stats.newFile++;
            }
            break;
          }

          case 'backup': {
            const backupPath = await backupFile(targetPaths.configFile, deps);
            backups.push(backupPath);
            output.info(`已备份 ${configFileName} 至 ${path.basename(backupPath)}`);
            stats.backup++;

            await copyFile(sourcePaths.configFile, targetPaths.configFile, deps);
            output.success(`已覆盖 ${configFileName}`);
            stats.write++;
            break;
          }

          case 'overwrite': {
            await copyFile(sourcePaths.configFile, targetPaths.configFile, deps);
            output.success(`已覆盖 ${configFileName}`);
            stats.write++;
            break;
          }

          case 'skip': {
            output.info(`跳过 ${configFileName}`);
            stats.skip++;
            break;
          }
        }
      } else {
        // No conflict, just copy
        await copyFile(sourcePaths.configFile, targetPaths.configFile, deps);
        output.success(`已写入 ${configFileName}`);
        stats.write++;
      }
    }

    // Process skills directory
    const skillsExists = await checkSkillsDir(targetPaths.skillsDir, deps);

    if (skillsExists) {
      // Determine action
      let action;
      if (options.yes) {
        action = resolveConflict(options, 'skills');
      } else {
        if (!rl) {
          rl = createReadline();
        }
        action = await askSkillsConflict(rl);
      }

      switch (action) {
        case 'backup': {
          const backupPath = await backupDir(targetPaths.skillsDir, deps);
          backups.push(backupPath);
          output.info(`已备份 skills/helloagents 至 ${path.basename(backupPath)}`);
          stats.backup++;

          // Remove old directory and copy new
          await rmrf(targetPaths.skillsDir, deps);
          await copyDir(sourcePaths.skillsDir, targetPaths.skillsDir, deps);
          output.success(`已更新 skills/helloagents`);
          stats.write++;
          break;
        }

        case 'overwrite': {
          await rmrf(targetPaths.skillsDir, deps);
          await copyDir(sourcePaths.skillsDir, targetPaths.skillsDir, deps);
          output.success(`已覆盖 skills/helloagents`);
          stats.write++;
          break;
        }

        case 'skip': {
          output.info(`跳过 skills/helloagents`);
          stats.skip++;
          break;
        }
      }
    } else {
      // No conflict, ensure parent directory exists and copy
      await ensureDir(path.dirname(targetPaths.skillsDir), deps);
      await copyDir(sourcePaths.skillsDir, targetPaths.skillsDir, deps);
      output.success(`已写入 skills/helloagents`);
      stats.write++;
    }

    // Print summary
    output.printSummary(stats, backups);

  } catch (err) {
    // Print recovery instructions if we have backups
    if (backups.length > 0) {
      output.printRecoveryInstructions(err.message, backups, options.platform || 'claude');
    }
    throw err;

  } finally {
    // Close readline if opened
    if (rl) {
      rl.close();
    }
  }
}

module.exports = {
  run,
};
