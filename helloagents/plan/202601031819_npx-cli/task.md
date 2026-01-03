# 任务清单: npx CLI 自动配置工具

目录: `helloagents/plan/202601031819_npx-cli/`

---

## 1. 项目初始化

- [ ] 1.1 在项目根目录创建 `package.json`，配置：
  - name: "helloagents"
  - version: "1.0.0"
  - bin: { "helloagents": "bin/cli.js" }
  - files: ["bin/", "lib/", "Claude/", "Codex/", "test/"]
  - engines: { "node": ">=14.0.0" }
  - scripts: { "test": "node test/run.js" }
  - 零依赖（无 dependencies）
- [ ] 1.2 创建 `bin/cli.js` 入口文件（包含 shebang `#!/usr/bin/env node`）
- [ ] 1.3 创建 `lib/` 目录结构：index.js, args.js, prompts.js, copy.js, backup.js, conflict.js, output.js, utils.js, defaults.js

## 2. 工具模块实现（支持依赖注入）

- [ ] 2.1 在 `lib/utils.js` 中实现（所有函数支持注入以便测试）：
  - `getHomeDir(deps)`: 默认 `os.homedir()`，可注入
  - `getTimestamp(deps)`: 默认当前时间 YYYYMMDD-HHmmss，可注入 `now` 函数
  - `randomSuffix(deps)`: 默认 `Math.random().toString(36).slice(2,8)`，可注入
  - `fileExists()` / `dirExists()`: 异步检查文件/目录存在
  - `readFileContent()`: 读取文件内容用于比较
  - `rmrf(path)`: 兼容 Node 14 的递归删除（优先 `fs.rm`，fallback `fs.rmdir({recursive:true})`）
- [ ] 2.2 在 `lib/output.js` 中实现：
  - ANSI 颜色常量（支持 `--no-color` 和 `NO_COLOR` 环境变量）
  - `success()` / `error()` / `warn()` / `info()`: 格式化输出函数
  - `printDryRunSummary()`: 输出 dry-run 汇总
  - 支持注入 `stdout` 以便测试捕获输出

## 3. 默认值探测模块

- [ ] 3.1 在 `lib/defaults.js` 中实现平台/语言默认值探测：
  - `detectDefaultPlatform(homeDir)`:
    - 仅存在 `~/.codex` → 返回 `codex`
    - 仅存在 `~/.claude` → 返回 `claude`
    - 都不存在/都存在 → 返回 `claude`（回退默认）
  - `getDefaultLang()`: 返回 `cn`（回退默认）
  - 探测结果需在输出中明确打印（如 `[默认] 检测到 ~/.claude，使用 Claude Code`）

## 4. 参数解析模块

- [ ] 4.1 在 `lib/args.js` 中实现参数解析（手写，无 commander）：
  - 支持: --platform, --lang, --yes/-y, --dry-run, --skills-only, --overwrite, --no-backup, --no-color, --help/-h, --version/-v
  - 参数互斥检测: --skills-only 与 --overwrite 同时使用时报错退出
  - 返回解析后的 options 对象

## 5. 交互模块实现

- [ ] 5.1 在 `lib/prompts.js` 中实现（原生 readline）：
  - `askPlatform()`: 选择平台（1.Claude Code 2.Codex）
  - `askLanguage()`: 选择语言（1.中文 2.English）
  - `askConfigConflict()`: 顶层配置文件冲突处理（4选项）
  - `askSkillsConflict()`: skills 目录冲突处理（3选项）
  - 支持默认值（直接回车选择默认）
  - **关键**: `-y` 模式下不创建 readline，直接返回默认值，避免无 TTY 卡死

## 6. 备份模块实现

- [ ] 6.1 在 `lib/backup.js` 中实现（支持注入 `getTimestamp`）：
  - `backupFile(filePath, deps)`: 备份单个文件为 `<name>.backup-<timestamp>`
  - `backupDir(dirPath, deps)`: 备份目录为 `<name>.backup-<timestamp>/`
  - 返回备份路径供恢复指令使用

## 7. 冲突检测模块实现

- [ ] 7.1 在 `lib/conflict.js` 中实现：
  - `checkConfigFile(targetPath)`: 检测顶层配置文件是否存在
  - `checkSkillsDir(targetPath)`: 检测 skills/helloagents 是否存在
  - `checkNewFile(targetPath)`: 检测 .helloagents.new 是否存在及内容是否相同
  - `backupNewFileIfDifferent(deps)`: 如 .new 存在且内容不同，改名为 .backup-<timestamp>

## 8. 文件复制模块实现

- [ ] 8.1 在 `lib/copy.js` 中实现（支持注入 `fs` wrapper 和 `randomSuffix`）：
  - `copyFile(src, dest, deps)`: 近似原子写入（临时文件 → 校验 → rename）
  - `copyDir(src, dest, deps)`: 递归复制目录
  - `writeNewFile(src, dest, deps)`: 写入 .helloagents.new 文件
  - 错误处理：失败时保留备份，输出恢复指令

## 9. 主流程实现

- [ ] 9.1 在 `lib/index.js` 中实现主流程（支持完整依赖注入）：
  - 函数签名: `run(options, deps = {})`
  - 可注入: `fs`, `homeDir`, `now`, `getTimestamp`, `randomSuffix`, `stdout`
  - 显示欢迎信息
  - `-y` 模式: 不创建 readline，使用探测默认值或参数值
  - 非 `-y` 模式: 根据参数/交互确定 platform 和 lang
  - 根据 --skills-only 决定是否处理顶层配置
  - 检测冲突并询问/使用默认策略
  - 执行复制操作
  - 显示结果摘要（明确打印最终选择的 platform/lang）
- [ ] 9.2 实现 Dry Run 模式：
  - 收集所有将执行的操作
  - 输出操作列表（源→目标、操作类型）
  - 输出汇总统计
  - 声明"不会做任何写入"

## 10. CLI 入口实现

- [ ] 10.1 在 `bin/cli.js` 中实现：
  - Shebang 行
  - 调用 args.js 解析参数
  - 处理 --help 和 --version
  - 调用 lib/index.js 主流程
  - 全局异常捕获，输出友好错误信息

## 11. 失败恢复输出

- [ ] 11.1 实现失败时的恢复指令输出：
  - 输出错误原因
  - 输出已创建的备份列表
  - 输出跨平台恢复命令模板（PowerShell + Bash）

## 12. 安全检查

- [ ] 12.1 执行安全检查（按G9）：
  - 输入验证：参数值校验（platform 只能是 claude/codex，lang 只能是 cn/en）
  - 路径安全：确保只操作目标目录内的文件
  - 权限处理：捕获 EACCES 等权限错误并友好提示

## 13. 文档更新

- [ ] 13.1 更新 `README.md` 添加 npx 使用说明：
  - 快速开始
  - CLI 参数说明（含 `-y` 行为说明）
  - 使用示例
  - 冲突处理说明
  - 默认值探测逻辑说明
- [ ] 13.2 更新知识库文档

## 14. 自动化测试基线

### 14.1 测试框架搭建

- [ ] 14.1.1 创建 `test/run.js` 测试入口：
  - 收集并执行所有测试用例
  - 统计 passed/failed
  - 非零退出码表示失败
- [ ] 14.1.2 创建 `test/helpers.js` 测试工具：
  - `createTestEnv()`: 使用 `fs.mkdtemp(path.join(os.tmpdir(), 'helloagents-'))` 创建临时目录
  - `cleanupTestEnv(dir)`: 使用 `rmrf` helper 清理（兼容 Node 14）
  - `createMockFs(overrides)`: 创建可注入的 fs wrapper，支持故障注入
  - `createMockDeps(overrides)`: 创建标准化的依赖注入对象
  - `collectOutput(stream)`: 收集 stdout 输出用于断言
  - `spawnWithTimeout(cmd, args, opts, timeout)`: 带超时的 spawn 封装（默认 10s）

### 14.2 核心测试用例

- [ ] 14.2.1 `test/cases/first-install.js`: 首次安装（目标目录不存在）
  - 断言: CLAUDE.md 和 skills/helloagents/ 都被创建
- [ ] 14.2.2 `test/cases/conflict-config-new.js`: 配置文件冲突 → 生成 .new
  - 预置已存在的 CLAUDE.md
  - 使用 `-y` 触发默认行为
  - 断言: 原文件不变，.helloagents.new 被创建
- [ ] 14.2.3 `test/cases/conflict-skills-backup.js`: skills 目录冲突 → 备份后覆盖
  - 预置已存在的 skills/helloagents/
  - 使用 `-y` 触发默认行为
  - 断言: 备份目录存在（匹配 `.backup-` 模式），新目录内容正确
- [ ] 14.2.4 `test/cases/dry-run.js`: --dry-run 模式
  - 断言: 输出包含操作列表和汇总
  - 断言: 目标目录无任何文件被创建
- [ ] 14.2.5 `test/cases/skills-only.js`: --skills-only 参数
  - 预置已存在的 CLAUDE.md
  - 断言: CLAUDE.md 不变，无 .new 生成
  - 断言: skills/helloagents/ 被更新
- [ ] 14.2.6 `test/cases/mutex-params.js`: 互斥参数检测
  - 使用 --skills-only --overwrite
  - 断言: 进程退出码非零，stderr 包含错误信息
- [ ] 14.2.7 `test/cases/new-file-backup.js`: .new 文件已存在且内容不同
  - 预置已存在的 .helloagents.new（内容与源不同）
  - 断言: 旧 .new 被改名为 .backup-<timestamp>
  - 断言: 新 .new 内容正确

### 14.3 故障注入测试

- [ ] 14.3.1 `test/cases/error-recovery.js`: 失败恢复输出
  - 注入 fs wrapper，在 `rename` 特定路径时抛 `{ code: 'EACCES' }`
  - 断言: 输出包含"备份列表"关键片段
  - 断言: 输出包含"恢复命令"关键片段（PowerShell 和 Bash）
  - 断言: 备份文件确实存在

### 14.4 端到端交互测试

- [ ] 14.4.1 `test/cases/e2e-interactive.js`: 交互式安装（1-2 个用例）
  - 使用 `spawn('node', ['bin/cli.js', '--platform', 'claude', '--lang', 'cn'], ...)`
  - 显式传 --platform/--lang 减少探测差异
  - 设置 10s 超时兜底
  - 通过 `env: { HOME: testDir, USERPROFILE: testDir }` 隔离测试环境
  - 断言: 进程退出码为 0
  - 断言: 目标文件被正确创建

### 14.5 默认值探测测试

- [ ] 14.5.1 `test/cases/default-detection.js`: 默认平台探测
  - 场景1: 仅存在 ~/.codex → 断言默认 codex
  - 场景2: 仅存在 ~/.claude → 断言默认 claude
  - 场景3: 都不存在 → 断言默认 claude
  - 场景4: 都存在 → 断言默认 claude

---

## 依赖注入点汇总

| 注入点 | 默认实现 | 测试用途 |
|--------|----------|----------|
| `homeDir` | `os.homedir()` | 指向临时测试目录 |
| `now` | `() => new Date()` | 固定时间戳便于精确断言 |
| `getTimestamp` | 基于 `now` 生成 | 固定备份文件名 |
| `randomSuffix` | `Math.random()...` | 固定临时文件名 |
| `fs` | `require('fs').promises` | 故障注入（EACCES 等） |
| `stdout` | `process.stdout` | 捕获输出用于断言 |

---

## `-y` 行为规范

```yaml
-y/--yes 语义: 全程非交互，自动采用默认值

platform 默认值:
  1. 如提供 --platform → 使用参数值
  2. 否则探测:
     - 仅存在 ~/.codex → codex
     - 仅存在 ~/.claude → claude
     - 都不存在/都存在 → claude（回退）
  3. 输出明确打印最终选择

lang 默认值:
  1. 如提供 --lang → 使用参数值
  2. 否则 → cn（回退）

冲突处理默认值:
  - CLAUDE.md/AGENTS.md → 生成 .helloagents.new
  - skills/helloagents/ → 备份后覆盖

关键约束:
  - -y 模式下不创建 readline 实例
  - 直接走默认分支，避免 CI/无 TTY 卡死
```
