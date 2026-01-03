# templates

## 目的
提供文档模板集合，确保所有知识库和方案文件格式一致。

## 模块概述
- **职责:** 知识库文档模板、方案文件模板、版本号解析规则
- **状态:** ✅稳定
- **最后更新:** 2025-12-16

## 规范

### 需求: 知识库文档模板
**模块:** templates

提供知识库核心文件的标准模板。

#### 场景: 创建知识库文件
执行 ~init 或知识库缺失时
- 使用 CHANGELOG.md 模板
- 使用 project.md 模板
- 使用 wiki/*.md 模板
- 使用 wiki/modules/<module>.md 模板
- 使用 history/index.md 模板

### 需求: 方案文件模板
**模块:** templates

提供方案包文件的标准模板。

#### 场景: 创建方案包
方案设计阶段
- 使用 why.md 模板（变更提案）
- 使用 how.md 模板（技术设计）
- 使用 task.md 模板（任务清单）
- G8 触发时包含产品分析章节

### 需求: 版本号解析
**模块:** templates

提供多语言项目的版本号来源规则。

#### 场景: 版本号确定
需要确定项目版本号时
- 按语言查找主来源文件
- 主来源不存在时查找次来源
- 支持：JavaScript/TypeScript、Python、Java、Go、Rust、.NET、C/C++

## 数据模型

### 模板类型
| 类型 | 文件 | 用途 |
|------|------|------|
| 知识库 | CHANGELOG.md | 版本历史 |
| 知识库 | project.md | 技术约定 |
| 知识库 | wiki/overview.md | 项目概述 |
| 知识库 | wiki/arch.md | 架构设计 |
| 知识库 | wiki/api.md | API 手册 |
| 知识库 | wiki/data.md | 数据模型 |
| 知识库 | wiki/modules/<module>.md | 模块文档 |
| 知识库 | history/index.md | 归档索引 |
| 方案包 | why.md | 变更提案 |
| 方案包 | how.md | 技术设计 |
| 方案包 | task.md | 任务清单 |

## 依赖
- core（全局规则、语言规范）

## 变更历史
- 2025-12-16.2 - 初始版本
