# 任务清单: CI 三平台矩阵测试

目录: `helloagents/plan/202601031928_ci-matrix/`

**前置依赖:** 主方案包 `202601031819_npx-cli` 的自动化测试基线（14.x 任务）需先完成

---

## 1. GitHub Actions Workflow

- [ ] 1.1 创建 `.github/workflows/` 目录结构
- [ ] 1.2 创建 `test.yml` workflow 文件：
  - 触发条件: push/PR to main
  - 路径过滤: bin/, lib/, test/, package.json
  - 矩阵: 3 平台 × 4 Node 版本
  - 步骤: checkout → setup-node → npm test
  - `fail-fast: false`

## 2. 文档更新

- [ ] 2.1 更新 `README.md` 添加 CI 状态徽章
- [ ] 2.2 更新知识库文档

## 3. 验证

- [ ] 3.1 Push 到测试分支，验证 workflow 触发
- [ ] 3.2 验证 12 个矩阵任务全部运行
- [ ] 3.3 验证失败场景（可选：临时引入失败测试）
- [ ] 3.4 验证徽章显示正确

## 4. 可选增强

- [ ] 4.1 配置分支保护规则（要求 CI 通过才能合并）
- [ ] 4.2 添加测试覆盖率报告（如需要）
