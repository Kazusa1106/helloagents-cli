# 技术设计: CI 三平台矩阵测试

## 技术方案

### 核心技术
- **CI 平台:** GitHub Actions
- **测试命令:** `npm test`（调用 `node test/run.js`）
- **矩阵策略:** 平台 × Node 版本

### 矩阵配置

| 平台 | Node 版本 |
|------|-----------|
| ubuntu-latest | 14, 16, 18, 20 |
| macos-latest | 14, 16, 18, 20 |
| windows-latest | 14, 16, 18, 20 |

**总计:** 3 × 4 = 12 个测试环境

### Workflow 设计

```yaml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false  # 不因单个失败而取消其他任务
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node-version: [14, 16, 18, 20]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - name: Run tests
        run: npm test
```

## 关键决策

| 决策项 | 选择 | 理由 |
|--------|------|------|
| `fail-fast: false` | 不快速失败 | 需要看到所有平台/版本的结果 |
| Node 14 | 保留 | package.json 声明 `>=14.0.0`，需验证 |
| 无 npm install | 是 | 零依赖，无需安装 |
| 无缓存 | 是 | 零依赖，无需缓存 node_modules |

## 触发条件

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'bin/**'
      - 'lib/**'
      - 'test/**'
      - 'package.json'
  pull_request:
    branches: [main]
```

**优化:** 仅在相关文件变更时触发，避免文档修改触发 CI。

## 状态徽章

```markdown
![Test](https://github.com/hellowind777/helloagents/actions/workflows/test.yml/badge.svg)
```

## 项目结构变更

```
helloagents/
├── .github/
│   └── workflows/
│       └── test.yml      # CI workflow (新增)
├── README.md             # 添加徽章 (更新)
└── ...
```

## 预期运行时间

| 阶段 | 时间 |
|------|------|
| Checkout | ~5s |
| Setup Node | ~10s |
| Run tests | ~30s |
| **单任务总计** | ~45s |
| **12 任务并行** | ~1-2min |

## 失败处理

- 单个矩阵任务失败不影响其他任务
- 失败任务在 Actions 页面高亮显示
- 点击可查看详细日志
- PR 页面显示失败状态，阻止合并（如启用分支保护）
