# Twikoo 私有部署服务端

本 fork 仅支持 LokiJS 本地文件存储，并且不发布 npm 包。

## 安装与启动

Node.js 18 或以上；需准备 C/C++ 编译工具链，用于编译 `ts-ip2region2`。

在 `src/server/self-hosted/` 目录执行：

```sh
npm ci
node server.js
```

默认监听 `8080`，数据写入当前工作目录下的 `data/`。

## 环境变量

| 名称 | 描述 | 默认值 |
| ---- | ---- | ---- |
| `TWIKOO_DATA` | LokiJS 数据目录，相对路径基于启动时的工作目录 | `./data` |
| `TWIKOO_HOST` | 自定义监听地址，优先于 `TWIKOO_LOCALHOST_ONLY` | `::` |
| `TWIKOO_PORT` | 端口号 | `8080` |
| `TWIKOO_MAX_BODY_BYTES` | HTTP 请求体最大字节数，超限返回 413 并关闭连接；必须为JS安全整数；大批量评论导入时可适当调高 | `16777216`（16 MiB） |
| `TWIKOO_THROTTLE` | 每个计数周期内同一 IP 的最大请求次数，超过则返回错误；评论提交频率另由管理面板配置 | `250` |
| `TWIKOO_REQ_TIMES_CLEAR_TIME` | IP 请求计数统一清零的间隔，单位毫秒 | `600000` |
| `TWIKOO_SHUTDOWN_TIMEOUT` | 关闭服务时等待连接结束的超时时间，单位毫秒 | `5000` |
| `TWIKOO_LOCALHOST_ONLY` | 为 `true` 时监听 `localhost`，适用于同主机反代不暴露原始端口 | 未启用 |
| `TWIKOO_LOG_LEVEL` | 日志级别，支持 `verbose` / `info` / `warn` / `error` | `info` |
| `TWIKOO_IP_HEADERS` | 优先读取的客户端 IP 字段，格式为 JSON 数组，例如 Cloudflare 的 `["headers.cf-connecting-ip"]` | `[]` |
