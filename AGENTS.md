# 项目协作指南

## 项目定位与当前范围

本项目是基于 Twikoo 1.x 的个人 fork，维护者为 mercury233。上游 main 分支已转向 2.x；本项目保留 1.x 的代码风格，不因同步上游而进行整体重写。

以下迁移已经完成：

- 前端包名为 `@mercury233/twikoo`，后端包名为 `@mercury233/tkserver`，版本号从 `1.0.0` 重新开始；两个包均设置了 `private: true`。
- 仅保留 self-hosted 后端和 LokiJS 本地文件存储，已移除 MongoDB、其他部署平台。
- 后端公共代码已纳入 `src/server/self-hosted/utils/`，不再依赖上游发布的 `twikoo-func` 或 `tkserver` 包；普通第三方依赖仍然保留。
- 统一使用 npm，前后端各有独立的 `package.json` 和 `package-lock.json`。根目录依赖不能替代后端依赖。
- 前端使用 Vue 2.7、Webpack 5 和本地 UI 组件；已移除 Element UI、Cloudbase SDK、内置修改版 Marked 和 PrismJS。
- 已移除 Cap 验证码、腾讯云 / LLM 评论审核、Artalk / Disqus 导入和内置代码高亮。保留 Turnstile、极验、Akismet、Valine / Twikoo 导入、邮件与 pushoo 通知、第三方图床及 S3 兼容存储。
- 当前通过 GitHub Actions 上传构建产物，暂不发布 npm 包、GitHub Release 或容器仓库镜像。
- 旧文档站及其构建、发布流程已移除。

事实以当前源码和配置为准。README、上游教程、历史忽略规则或旧提交中出现的路径，不代表当前仍支持相应功能。

## 源码导航

| 路径 | 职责 |
| --- | --- |
| `src/client/main.js` | UMD 库入口，导出 `init`、`getCommentsCount`、`getRecentComments`、`getVisitorsCount`，默认导出 `init` |
| `src/client/utils/api.js` | HTTP POST 请求封装、`envId` 选择、访问令牌读写 |
| `src/client/utils/index.js` | 评论数量与访客统计辅助接口、HTML 净化、链接与公式渲染等 |
| `src/client/utils/marked.js` | 官方 Marked 实例、OwO 行内扩展及 Markdown 配置 |
| `src/client/utils/emotion.js`、`src/client/lib/owo.js` | 表情数据加载、格式转换与选择器 |
| `src/client/utils/i18n/` | 语言选择、翻译键和各语言文本 |
| `src/client/view/index.js`、`src/client/view/App.vue` | Vue 挂载、全局组件和指令注册、评论与管理面板入口 |
| `src/client/view/components/` | 评论列表、提交、用户资料、分页及管理组件；`TkInput.vue`、`TkButton.vue` 为本地基础控件 |
| `src/client/view/directives.js`、`src/client/view/loading.css` | 加载遮罩、点击外部关闭及加载动画样式 |
| `src/server/self-hosted/server.js` | Node.js HTTP 服务、请求体读取、监听配置和优雅关闭 |
| `src/server/self-hosted/index.js` | 事件分发、鉴权、评论与计数业务、配置管理、LokiJS 持久化 |
| `src/server/self-hosted/utils/` | 字段校验、评论转换、属地查询、导入、审核、通知、图片上传和日志 |
| `webpack.config.js`、`babel.config.json`、`loaders/` | 前端打包、转译及 Vue 样式导入兼容处理 |
| `demo/` | 前端演示页面与样式，构建时复制到 `dist/` |
| `Dockerfile`、`.dockerignore`、`docker-compose.yml` | 后端源码镜像构建、构建上下文和本地容器运行配置 |
| `.github/workflows/build.yml`、`.github/dependabot.yml` | CI 构建产物与前后端依赖更新配置 |

## 修改时需要保留的约定

### 前端与接口

- `envId` 必须是 HTTP(S) 后端地址，不再表示云环境 ID。请求入口不要重新引入 `$tcb` 调用方式。
- 前后端通过 `COMMENT_SUBMIT`、`GET_CONFIG` 等事件名交互。后端返回业务结果对象，前端请求封装返回 `{ result }`；修改接口时核对发送端、事件分发、返回字段和所有调用点。
- `twikoo-access-token` 存储在 localStorage 中，并随请求发送。调整鉴权、匿名身份或登录逻辑时，要同时考虑评论归属、点赞和用户删除权限。
- 本地 UI 组件有意保留 `el-*` 类名以兼容宿主主题。修改样式时注意 `.twikoo` 作用域和选择器优先级，不因已移除 Element UI 就统一改名。
- 修改 `TkInput.vue` 时关注 `v-model`、输入法组合输入、焦点与光标、密码显示、清空、字数限制和 textarea 自适应高度；其内部 textarea 引用还被提交、粘贴图片、表情和导入日志功能使用。
- Markdown 使用 `marked.parse()`；OwO 数据通过 `odata` 选项提供，表情图片保留 `tk-owo-emotion` 类名。当前有意禁用缩进代码块，保留 GFM 和换行渲染。公式依赖宿主页面提供的 KaTeX 自动渲染能力。
- 新增 UI 文本沿用 `t()` 和现有翻译键机制；翻译数组的语言顺序以 `src/client/utils/i18n/index.js` 为准，补齐各语言对应项，不直接插入单语言文本。

### 后端与数据

- 后端采用 CommonJS，公共代码从本地 `utils/` 引用。`utils/lib.js` 集中封装第三方库入口，调整依赖时核对实际导出形式及同步 / 异步调用约定。
- 保留客户端字段类型校验、管理权限与评论归属检查，以及前后端 HTML 净化。修改评论展示、导入、邮件模板或图片上传时，核对相应输入处理和输出转义。
- 公开配置通过 `getConfig` 选择字段；管理配置通过 `getConfigForAdmin` 返回。新增配置需同步检查管理界面、后端消费位置和公开范围，密钥不得进入公开配置。
- LokiJS 数据目录由 `TWIKOO_DATA` 指定，默认相对于进程工作目录的 `./data`。注意自动保存及退出时的保存逻辑，验证代码不要读写用户实际数据库。
- 属地查询使用 `ts-ip2region2`，区分 IPv4 / IPv6 查询器，并处理 IPv4 映射地址和带端口的地址；该依赖需要原生扩展编译工具链。

## 本地环境与命令

以下命令仅供依赖已由用户准备好的环境使用，列出命令不代表授权自动启动服务、安装依赖或执行构建。

在仓库根目录：

```text
npm run dev       # 前端开发服务；serve 是同一命令的别名
npm run lint      # ESLint，当前脚本检查 src/**
npm run build     # 前端生产构建
npm run analyze   # 生产构建、写入 stats.json 并启动包体积分析
```

前端开发服务默认监听 `0.0.0.0:9820`，演示页为 `http://localhost:9820/demo.html`，不包含后端服务。

在 `src/server/self-hosted/` 目录执行 `node server.js` 或 `npm start` 启动后端。默认监听 `[::]:8080`，前端本地调试可配置 `envId: 'http://localhost:8080'`。后端直接运行源码，`build` 脚本当前只是占位，不会编译服务端。

后端监听地址、数据目录、限流、日志、代理 IP 头及关闭超时的环境变量说明见 `src/server/self-hosted/README.md`，实现以 `server.js`、`index.js` 和 `utils/constants.js` 为准。

## 构建、部署与 CI

- Webpack 输出 UMD 全局变量 `twikoo`，库文件只有 `dist/twikoo.min.js`；不生成上游的 `twikoo.all.min.js`、nocss 版本或单独提取的库 CSS。
- CSS 通过 `vue-style-loader` 注入，PostCSS 使用 Autoprefixer，并在生产模式启用 cssnano。浏览器目标来自根目录 `browserslist`，当前为 Chrome 109 及以上。
- `loaders/vue-style-imports.js` 修正 Vue Loader 15.11.1 的普通样式默认导入问题，同时保留 CSS Modules 映射。升级相关依赖时先核对该兼容处理，不要直接删除。
- CI 和 Dockerfile 内的安装步骤是现有自动化流程的描述，不授权代理在本地执行会下载或安装依赖的操作。Dependabot 分别检查根目录和后端目录，并限制 Vue / Vue Loader 升级到不兼容的大版本。

## 代码风格与验证

- 沿用 JavaScript、Vue 2 单文件组件和现有组件写法，不主动引入 TypeScript、Vue 3 或其他组件范式。
- 以 `eslint.config.js` 和 `.editorconfig` 为准：neostandard、Vue 2 essential、2 空格缩进、LF 换行、UTF-8 编码。根目录的 lint 脚本不覆盖所有构建配置文件，不把 lint 通过等同于全仓库检查通过。
- 当前没有配置独立的自动化测试脚本。根据改动选择静态检查、已有依赖下的针对性验证或必要的手动验证，不自动安装测试框架，也不为低风险修改添加形式化测试。
- 涉及界面时关注评论提交、回复、搜索、分页及管理面板；涉及后端时关注对应事件、权限与数据保存。仅验证与改动有关的路径，报告实际完成的检查及未验证的部分。
