<img src="https://raw.githubusercontent.com/twikoojs/twikoo/62f9a93941f10367f13a21e2b797d49ae93bc012/docs/static/logo.png" width="300" alt="Twikoo">

----

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

一个**简洁**、**安全**、**免费**的静态网站评论系统。<br>
A **simple**, **safe**, **free** comment system.

## 本分支修改

本仓库是 mercury233 维护的 Twikoo 1.x fork，项目名为 `@mercury233/twikoo`，版本号从 `1.0.0` 重新开始；[上游](https://github.com/twikoojs/twikoo)已转向 2.x，本分支继续维护 1.x 架构。

| 范围 | 修改 |
| --- | --- |
| 后端 | 仅保留 self-hosted + LokiJS，移除云平台部署和 MongoDB；公共代码纳入本地源码，移除 `twikoo-func`、`tkserver` 包依赖 |
| 前端 | 保留 Vue 2 + Webpack 5，以本地组件替代 Element UI，以官方 Marked + OwO 扩展替代内置修改版 |
| 属地查询 | 改用 `ts-ip2region2`，支持 IPv4 / IPv6；安装后端依赖需要原生扩展编译工具链 |
| 功能裁剪 | 移除 Cloudbase 支持、Cap 验证码、腾讯云 / LLM 审核、内置代码高亮、Artalk / Disqus 导入 |
| 构建与分发 | 统一使用 npm；前端仅输出 `twikoo.min.js`；CI 上传产物，暂不发布 npm 包或 GitHub Release |

## 特色 | Features

<details>
<summary>点击展开</summary>

### 简单

* 私有部署，支持 Docker 或直接运行 Node.js
* 使用 LokiJS 本地文件存储，无需独立数据库服务

### 易用

* 支持回复、点赞
* 无需额外适配，支持搭配浅色主题与深色主题使用
* 支持 API 调用，批量获取文章评论数、最新评论
* 访客在昵称栏输入 QQ 号，会自动补全 QQ 昵称和 QQ 邮箱
* 访客填写数字 QQ 邮箱，会使用 QQ 头像作为评论头像
* 支持评论框粘贴图片（可禁用）
* 支持插入图片（可禁用）
* 支持第三方图床及 S3 兼容存储
* 支持插入表情（可禁用）
* 支持 Ctrl + Enter 快捷回复
* 评论框内容实时保存草稿，刷新不会丢失
* [支持 Katex 公式](https://twikoo.js.org/faq.html#%E5%A6%82%E4%BD%95%E5%90%AF%E7%94%A8-katex-%E6%94%AF%E6%8C%81)

### 安全

* 隐私信息安全（通过后端控制敏感字段（邮箱、IP、环境配置等）不会泄露）
* 支持 Akismet 垃圾评论检测（需自行注册 [akismet.com](https://akismet.com/)）
* 支持 Turnstile、极验验证码
* 支持人工审核模式
* 防 XSS 注入
* 支持按 IP 和全站限制每分钟评论数，以及按 IP 限制请求次数

### 即时

* 支持邮件提醒（访客和博主）
* 支持微信提醒（仅针对博主，基于 [Server酱](https://sc.ftqq.com/3.version)，需自行注册）
* 支持 QQ 提醒（仅针对博主，基于 [Qmsg酱](https://qmsg.zendee.cn/)，需自行注册）

### 个性

* 支持自定义评论框背景图片
* 支持自定义“博主”标识文字
* 支持自定义通知邮件模板
* 支持自定义评论框提示信息（placeholder）
* 支持自定义表情列表（兼容 [OwO 的数据格式](https://cdn.jsdelivr.net/npm/owo@1.0.2/demo/OwO.json)）
* 支持自定义【昵称】【邮箱】【网址】必填 / 选填

### 便捷管理

* 内嵌式管理面板，通过密码登录，可方便地查看评论、隐藏评论、删除评论、修改配置
* 支持隐藏管理入口，通过输入暗号显示
* 支持从 Valine、Twikoo 导入评论，支持导出评论和访问计数

### 缺点

* 不支持 IE，当前前端编译目标为 Chrome 109 及以上
* 使用已废弃的 Vue 2
* 与上游相比，移除基本所有云平台部署支持

</details>

## 预览 | Preview

以下为上游 1.x 界面截图，供参考。

<details>
<summary>点击展开</summary>

### 评论

![评论](https://raw.githubusercontent.com/twikoojs/twikoo/62f9a93941f10367f13a21e2b797d49ae93bc012/docs/static/readme-1.png)

### 评论管理

![评论管理](https://raw.githubusercontent.com/twikoojs/twikoo/62f9a93941f10367f13a21e2b797d49ae93bc012/docs/static/readme-2.png)

### 推送通知

![推送通知](https://raw.githubusercontent.com/twikoojs/twikoo/62f9a93941f10367f13a21e2b797d49ae93bc012/docs/static/readme-3.jpg)

</details>

## 快速上手 | Quick Start

从 [Build 工作流](https://github.com/mercury233/twikoo/actions/workflows/build.yml)对应提交的成功运行中下载并解压 artifact：

| Artifact | 使用方法 |
| --- | --- |
| `twikoo-client` | 将 `twikoo.min.js` 放入网站静态资源目录，按下例加载 |
| `twikoo-server` | 内含 `twikoo-server.tar` Docker 镜像；也可以直接手动部署到支持 Node.js 的环境 |

```html
<div id="tcomment"></div>
<script src="/js/twikoo.min.js"></script>
<script>
  twikoo.init({
    envId: 'https://comments.example.com',
    el: '#tcomment'
  })
</script>
```

替换脚本路径和后端地址；`envId` 必须是 HTTP(S) 地址，本地调试可用 `http://localhost:8080`。首次打开管理面板时设置管理员密码，其余选项在面板内配置。通用功能可参考[上游教程](https://twikoo.js.org/quick-start.html)，部署方式和功能差异以本文为准。

## 特别感谢 | Special Thanks

图标设计：[Maemo Lee](https://www.maemo.cc)

## 开发 | Development

前端 Node.js 版本要求：`^22.18.0 || ^24.11.0 || >=26.0.0`。在仓库根目录执行：

``` sh
npm ci
npm run dev # 开发 (http://localhost:9820/demo.html)
npm run lint # 代码检查
npm run build # 编译 (dist/twikoo.min.js)
```

前端开发服务不包含后端，需按[后端 README](./src/server/self-hosted/README.md)单独启动。

如果您的改动能够帮助到更多人，欢迎提交 Pull Request！

## 国际化 | I18N

支持简体中文、繁体中文、英语、日语、韩语等。翻译位于 [i18n.js](./src/client/utils/i18n/i18n.js)。

## 许可 | License

[MIT License](./LICENSE)，保留上游作者及贡献者的版权声明。
