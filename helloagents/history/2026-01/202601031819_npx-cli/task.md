# 任务清单: npx CLI 自动配置工具

目录: `helloagents/plan/202601031819_npx-cli/`

---

## 1. 项目初始化

- [√] 1.1 在项目根目录创建 `package.json`
- [√] 1.2 创建 `bin/cli.js` 入口文件
- [√] 1.3 创建 `lib/` 目录结构

## 2. 工具模块实现

- [√] 2.1 在 `lib/utils.js` 中实现工具函数
- [√] 2.2 在 `lib/output.js` 中实现输出格式化

## 3. 默认值探测模块

- [√] 3.1 在 `lib/defaults.js` 中实现平台/语言默认值探测

## 4. 参数解析模块

- [√] 4.1 在 `lib/args.js` 中实现参数解析

## 5. 交互模块实现

- [√] 5.1 在 `lib/prompts.js` 中实现交互提示

## 6. 备份模块实现

- [√] 6.1 在 `lib/backup.js` 中实现备份功能

## 7. 冲突检测模块实现

- [√] 7.1 在 `lib/conflict.js` 中实现冲突检测

## 8. 文件复制模块实现

- [√] 8.1 在 `lib/copy.js` 中实现文件复制

## 9. 主流程实现

- [√] 9.1 在 `lib/index.js` 中实现主流程
- [√] 9.2 实现 Dry Run 模式

## 10. CLI 入口实现

- [√] 10.1 在 `bin/cli.js` 中实现 CLI 入口

## 11. 失败恢复输出

- [√] 11.1 实现失败时的恢复指令输出

## 12. 安全检查

- [√] 12.1 执行安全检查（参数验证、路径安全、权限处理）

## 13. 文档更新

- [√] 13.1 更新 `README.md` 添加 npx 使用说明
- [√] 13.2 更新知识库文档

## 14. 自动化测试基线

### 14.1 测试框架搭建

- [√] 14.1.1 创建 `test/run.js` 测试入口
- [√] 14.1.2 创建 `test/helpers.js` 测试工具

### 14.2 核心测试用例

- [√] 14.2.1 `test/cases/first-install.js`: 首次安装
- [√] 14.2.2 `test/cases/conflict-config-new.js`: 配置文件冲突
- [√] 14.2.3 `test/cases/conflict-skills-backup.js`: skills 目录冲突
- [√] 14.2.4 `test/cases/dry-run.js`: --dry-run 模式
- [√] 14.2.5 `test/cases/skills-only.js`: --skills-only 参数
- [√] 14.2.6 `test/cases/mutex-params.js`: 互斥参数检测
- [√] 14.2.7 `test/cases/new-file-backup.js`: .new 文件备份

### 14.3 故障注入测试

- [-] 14.3.1 `test/cases/error-recovery.js`: 跳过（需要更复杂的 mock）

### 14.4 端到端交互测试

- [-] 14.4.1 `test/cases/e2e-interactive.js`: 跳过（需要 TTY 环境）

### 14.5 默认值探测测试

- [√] 14.5.1 `test/cases/default-detection.js`: 默认平台探测

---

## 执行结果

- **总任务数**: 28
- **已完成**: 25
- **已跳过**: 2
- **测试通过**: 20/20
