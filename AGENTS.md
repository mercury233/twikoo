# 项目协作指南

## 项目定位与维护方向

本项目是基于 Twikoo 1.x 的个人 fork，维护者为 mercury233。上游 main 分支已转向 2.x；本项目保留 1.x 的代码风格，不因同步上游而进行整体重写。

以下是计划中的维护方向，不代表仓库已经完成迁移，也不授权代理在无具体任务时自行实施：

- 项目名改为 `@mercury233/twikoo`，不发布到 npm，只在 GitHub 发布。
- 版本号从 `1.0.0` 重新开始。
- 仅保留 self-hosted 后端，移除其他部署平台。
- 将所需的后端公共代码纳入本地源码，消除对 `twikoo-func`、`tkserver` 等本项目已发布 npm 包的依赖；普通第三方依赖不在此移除范围内。
- 统一使用 npm，移除 Yarn 和 pnpm 的配置与调用。
- 更新前端打包工具链，具体选型尚未确定。

修改时以实际文件为准，区分当前架构与目标架构。避免将目录重组、行为修改和无关格式调整混在一起。

## 当前架构

- `src/client/`：Vue 2 + Element UI 客户端，当前使用 Webpack 5 输出 UMD 库。
- `src/client/main.js` 与 `main.all.js`：分别为不内置和内置 CloudBase SDK 的入口。
- `src/client/utils/api.js`：请求入口；URL 类型的 `envId` 使用 HTTP POST，CloudBase 环境 ID 使用云函数调用。
- `src/client/view/components/`：评论及管理界面组件。
- `src/client/utils/i18n/i18n.js`：界面翻译；新增 UI 文本应沿用现有国际化机制并补充翻译。
- `src/server/self-hosted/server.js`：Node.js HTTP 服务入口，根据数据库环境变量选择 LokiJS 或 MongoDB 实现。
- `src/server/self-hosted/index.js` 与 `mongo.js`：两种数据库下的业务实现；修改共同功能时检查两者是否需要同步。
- `src/server/function/twikoo/utils/`：self-hosted 当前通过 `twikoo-func/utils/*` 引用的公共代码。直接修改本目录未必影响本地服务实际加载的 npm 包，验证时注意模块解析来源。
- 前后端通过事件名（如 `COMMENT_SUBMIT`、`GET_CONFIG`）交互，服务端通过事件分发执行处理函数。
- `Dockerfile` 和 `src/server/pkg/`：当前仍依赖已发布的 `tkserver`，源码重组时需要检查这些发布入口。
- `.github/workflows/`：构建、文档和发布流程，当前仍存在 Yarn 与 npm 发布逻辑。

## 环境与命令

以下命令仅供已有依赖的环境使用，不代表可以自动启动服务或执行构建：

```text
npm.cmd run dev       # 前端开发服务，默认端口 9820
npm.cmd run lint      # ESLint 检查
npm.cmd run build     # 生产构建
npm.cmd run analyze   # 构建并分析包体积
```

后端在 `src/server/self-hosted/` 下执行 `node server.js`，默认端口 8080；前端 `envId` 可配置为 `http://localhost:8080`。

当前文档脚本内部仍调用 Yarn；执行脚本前检查其内容，不要通过 npm 间接调用已决定停用的包管理器。

## 修改与验证约束

- 除非用户明确要求，不生成单独的文档文件。
- 修改范围应与当前任务一致，不顺便实施维护路线中的其他迁移。

## 代码风格

- 沿用现有 JavaScript 和 Vue 组件风格，不主动引入 TypeScript 或改写组件范式。
- 以 `eslint.config.js` 和 `.editorconfig` 为准：当前使用 neostandard 与 Vue 2 essential 规则，2 空格缩进、LF 换行、UTF-8 编码。
