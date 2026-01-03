# Changelog

本文件记录项目所有重要变更。
格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/),
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [2026-01-03.1] - 2026-01-03

### 新增
- npx CLI 自动配置工具
  - 一键安装：`npx helloagents`
  - 交互式和非交互式两种模式
  - 平台自动探测（Claude Code / Codex）
  - 文件级冲突处理（备份、生成 .new、覆盖、跳过）
  - Dry-run 预览功能
  - 零外部依赖（纯 Node.js 原生 API）
  - 跨平台支持（Windows / macOS / Linux）
- GitHub Actions CI 测试矩阵
  - 3 平台 × 4 Node 版本 = 12 个测试环境
  - 自动化测试基线（20 个测试用例）
  - CI 状态徽章

### 变更
- README 更新：添加 npx 安装说明和 CI 徽章

## [2025-12-18.2] - 2025-12-18

### 新增
- Windows PowerShell 语法约束增强（G1）
  - 文件操作 `-Force` 参数
  - 环境变量 `$env:VAR` 格式
  - 参数组合验证规则
  - 命令连接规则（禁止 `&&` `||`）
  - 比较运算符规范（`-gt` `-lt` `-eq` `-ne`）
  - 空值比较规范（`$null` 位置）

### 变更
- 项目名称调整："模块化AI编程技能系统" → "AI编程模块化技能系统"

## [2025-12-16.2] - 2025-12-16

### 新增
- 模块化技能系统（5个独立技能：analyze, design, develop, kb, templates）
- 统一复杂度路由器（4种自适应工作流）
- G3 不确定性处理原则
- 跨平台兼容性支持（Windows PowerShell + macOS + Linux）
- G12 状态变量管理
- G11 方案包生命周期管理

### 变更
- 核心规则集体积缩小 70%（通过模块化技能架构）

## [2025-12-01] - 2025-12-01

### 新增
- 初始版本发布
- 需求分析阶段（10分评分系统）
- 方案设计阶段（方案包生成）
- 开发实施阶段（任务执行与知识库同步）
- EHRB 安全检测机制
- 统一输出格式规范（G6）
