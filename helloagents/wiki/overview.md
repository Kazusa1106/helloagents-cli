# HelloAGENTS

> 本文件包含项目级别的核心信息。详细的模块文档见 `modules/` 目录。

---

## 1. 项目概述

### 目标与背景
HelloAGENTS 是一个 AI 编程模块化技能系统，通过智能路由和人性化工作流，将混乱的智能体输出转化为结构化、可追溯、生产就绪的代码。

**核心价值:**
- 智能复杂度路由（4种自适应工作流）
- 语义意图分析（非关键词匹配）
- 结构化需求评分（10分制）
- 人性化交互模式（透明决策）

### 范围
- **范围内:**
  - AI 编程助手的规则集定义
  - 需求分析、方案设计、开发实施的完整工作流
  - 知识库管理与同步机制
  - 跨平台兼容性（Windows/macOS/Linux）
- **范围外:**
  - 具体业务代码实现
  - AI 模型训练或微调
  - IDE 插件开发

### 干系人
- **负责人:** Hellowind

---

## 2. 模块索引

| 模块名称 | 职责 | 状态 | 文档 |
|---------|------|------|------|
| core | 全局规则（G1-G12）与路由机制 | ✅稳定 | [core.md](modules/core.md) |
| analyze | 需求分析阶段技能 | ✅稳定 | [analyze.md](modules/analyze.md) |
| design | 方案设计阶段技能 | ✅稳定 | [design.md](modules/design.md) |
| develop | 开发实施阶段技能 | ✅稳定 | [develop.md](modules/develop.md) |
| kb | 知识库管理技能 | ✅稳定 | [kb.md](modules/kb.md) |
| templates | 文档模板集合 | ✅稳定 | [templates.md](modules/templates.md) |

---

## 3. 快速链接
- [技术约定](../project.md)
- [架构设计](arch.md)
- [API 手册](api.md)
- [数据模型](data.md)
- [变更历史](../history/index.md)
