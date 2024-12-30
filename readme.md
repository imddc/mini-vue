# mini-vue

一个使用 TypeScript 构建的 `mini-vue` 实现，采用 `monorepo` 架构，包含多个包模块以及演练场应用。

## 项目结构

```plaintext
mini-vue/
├── apps/            # 演练场应用目录
│   ├── demo-app/    # 一个示例应用
├── packages/        # 本地包目录
│   ├── core/        # 核心库
│   ├── runtime/     # 运行时
│   ├── compiler/    # 编译器
│   ├── shared/      # 通用工具和代码
│   ├── reactivity/      # 通用工具和代码
├── test/            # 测试目录
├── .eslin.config.mjs     # ESLint 配置文件
├── commitlint.config.js # Commitlint 配置文件
├── package.json     # 项目根 package.json 文件
├── pnpm-workspace.yaml # Monorepo 配置文件
└── README.md        # 项目文档
```

## feature

- 现代化开发： 使用 TypeScript 实现 Vue 的核心功能。
- 模块化架构： 采用 Monorepo 管理多个包模块，易于扩展和维护。
- 最佳实践： 集成 ESLint、Prettier、lint-staged、commitlint 等工具，确保代码风格统一和提交规范。
- 实时演练场： 在 apps 目录下提供演示应用，方便测试和验证功能。

## 常用命令

```shell
# 检查代码格式
pnpm lint

# 修复代码格式
pnpm lint:fix

# 测试代码
pnpm test
```

## 开发流程

1. 安装依赖
2. 编写代码
3. 启动测试
4. 提交代码
5. 创建`merge request`, 等待审核
6. 合并代码

### 提交流程

1. 在本地创建子分支。
2. 编写代码并使用 `git add` 添加修改。
3. 执行 `git commit`，`lint-staged` 将自动检查代码格式。
4. 如果提交信息不符合规范，commitlint 将会提示并拒绝提交。
5. `git rebase`父分支，确保代码是最新的。
6. 提交代码到远程仓库。

#### commit 信息规范

```plaintext
<type>(<scope>): <description>
```

示例：
• feat(core): 添加响应式系统
• fix(runtime): 修复渲染 bug
• docs: 更新 README
