# 项目技术约定

---

## 技术栈
- **核心:** Markdown 文档 / YAML 配置
- **目标平台:** Codex CLI / Claude Code
- **支持环境:** Windows PowerShell / macOS / Linux

---

## 开发约定
- **文档规范:** Markdown + Mermaid 图表
- **命名约定:**
  - 文件名：小写 + 连字符（如 `overview.md`）
  - 方案包目录：`YYYYMMDDHHMM_<feature>`
  - 技能文件：`SKILL.md`
- **语言规范:**
  - 中文版：`OUTPUT_LANGUAGE: 简体中文`
  - 英文版：`OUTPUT_LANGUAGE: English`

---

## 目录结构约定
```
helloagents/
├── CHANGELOG.md          # 版本历史
├── project.md            # 技术约定（本文件）
├── wiki/                 # 核心文档
│   ├── overview.md       # 项目概述
│   ├── arch.md           # 架构设计
│   ├── api.md            # API 手册（命令接口）
│   ├── data.md           # 数据模型（状态变量）
│   └── modules/          # 模块文档
├── plan/                 # 变更工作区
└── history/              # 已完成变更归档
```

---

## 版本管理
- **版本格式:** `YYYY-MM-DD.N`（日期 + 当日序号）
- **变更记录:** 遵循 Keep a Changelog 格式
- **提交规范:** Conventional Commits

---

## 质量标准
- **文档完整性:** 所有模块必须有对应的 `wiki/modules/<module>.md`
- **模板一致性:** 所有文档遵循 `templates` Skill 定义的模板
- **跨平台兼容:** 所有命令和路径处理需考虑 Windows/Unix 差异
