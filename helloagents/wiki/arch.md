# 架构设计

## 总体架构

```mermaid
flowchart TD
    subgraph Input["输入层"]
        User[用户请求]
    end

    subgraph Router["路由层"]
        Extract[信息提取]
        Semantic[语义分析]
        Intent[意图分类]
        Scope[范围评估]
        EHRB[EHRB检测]
        Decision{路由决策}
    end

    subgraph Workflows["工作流层"]
        QA[💡 咨询问答]
        QuickFix[⚡ 微调模式]
        LightIter[🔄 轻量迭代]
        StdDev[📦 标准开发]
        FullRD[🔬 完整研发]
    end

    subgraph Skills["技能层"]
        Analyze[📋 analyze]
        Design[📐 design]
        Develop[🛠️ develop]
        KB[📚 kb]
        Templates[📝 templates]
    end

    subgraph Output["输出层"]
        Format[统一输出格式]
        KBSync[知识库同步]
        History[历史归档]
    end

    User --> Extract
    Extract --> Semantic --> Intent --> Scope --> EHRB --> Decision

    Decision -->|问答型| QA
    Decision -->|微范围| QuickFix
    Decision -->|小范围| LightIter
    Decision -->|多文件| StdDev
    Decision -->|复杂/EHRB| FullRD

    FullRD --> Analyze --> Design --> Develop
    StdDev --> Design
    LightIter --> Develop
    QuickFix --> Develop

    Analyze -.-> Templates
    Design -.-> Templates
    Develop -.-> KB
    KB -.-> Templates

    Develop --> Format
    Format --> KBSync --> History
```

## 技术栈
- **规则定义:** Markdown + YAML
- **图表:** Mermaid
- **目标平台:** Codex CLI / Claude Code
- **支持系统:** Windows PowerShell / macOS / Linux

## 核心流程

### 统一智能路由流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant R as 路由器
    participant W as 工作流
    participant S as 技能
    participant O as 输出

    U->>R: 发送请求
    R->>R: 语义分析
    R->>R: 意图分类
    R->>R: 范围评估
    R->>R: EHRB检测
    R->>W: 路由到工作流

    alt 完整研发
        W->>S: 调用 analyze
        S-->>W: 需求评分
        alt 评分 < 7
            W->>U: 追问
            U->>W: 补充信息
        end
        W->>S: 调用 design
        S-->>W: 方案包
        W->>S: 调用 develop
    else 标准开发
        W->>S: 调用 design
        W->>S: 调用 develop
    else 轻量迭代
        W->>S: 调用 develop (简化方案)
    else 微调模式
        W->>S: 直接编辑
    end

    S->>O: 统一格式输出
    O->>O: 知识库同步
    O->>U: 返回结果
```

## 重大架构决策

完整的ADR存储在各变更的how.md中，本章节提供索引。

| adr_id | title | date | status | affected_modules | details |
|--------|-------|------|--------|------------------|---------|
| ADR-001 | 采用模块化技能架构 | 2025-12-16 | ✅已采纳 | 全部 | 将规则集拆分为5个独立技能，按需加载 |
| ADR-002 | 统一复杂度路由器 | 2025-12-16 | ✅已采纳 | core | 4种工作流通过语义分析自动选择 |
| ADR-003 | G3不确定性处理原则 | 2025-12-16 | ✅已采纳 | core | 明确披露假设，保守兜底策略 |
| ADR-004 | G12状态变量管理 | 2025-12-16 | ✅已采纳 | core, develop | 追踪方案包和模式状态 |
