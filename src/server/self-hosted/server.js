#!/usr/bin/env node

const http = require('http')
const logger = require('./utils/logger')

const twikoo = require('./index')
const server = http.createServer()
const sockets = new Set()
const TWIKOO_SHUTDOWN_TIMEOUT = parseInt(process.env.TWIKOO_SHUTDOWN_TIMEOUT) || 5000
const configuredMaxBodyBytes = Number(process.env.TWIKOO_MAX_BODY_BYTES)
// 默认请求体上限 16 MiB
// 默认图片大小上限 10 MiB 经 base64 编码后约为 14 MiB，需留有余量
const TWIKOO_MAX_BODY_BYTES = Number.isSafeInteger(configuredMaxBodyBytes) && configuredMaxBodyBytes > 0
  ? configuredMaxBodyBytes
  : 16 * 1024 * 1024
let isShuttingDown = false
let shuttingDownPromise = null

server.on('request', async function (request, response) {
  if (isShuttingDown) {
    await rejectRequest(request, response, 503, 'Twikoo server is shutting down')
    return
  }
  if (Number(request.headers['content-length']) > TWIKOO_MAX_BODY_BYTES) {
    await rejectRequest(request, response, 413, 'Request body too large')
    return
  }
  try {
    const buffers = []
    let totalBytes = 0
    // 默认迭代器提前退出会销毁连接，须保留连接直到 413 响应发送完毕。
    for await (const chunk of request.iterator({ destroyOnReturn: false })) {
      totalBytes += chunk.length
      if (totalBytes > TWIKOO_MAX_BODY_BYTES) {
        await rejectRequest(request, response, 413, 'Request body too large')
        return
      }
      buffers.push(chunk)
    }
    request.body = JSON.parse(Buffer.concat(buffers, totalBytes).toString())
  } catch (e) {
    request.body = {}
  }
  response.status = function (code) {
    this.statusCode = code
    return this
  }
  response.json = function (json) {
    if (!response.writableEnded) {
      this.writeHead(200, { 'Content-Type': 'application/json' })
      this.end(JSON.stringify(json))
    }
    return this
  }
  return await twikoo(request, response)
})

async function rejectRequest (request, response, code, message) {
  request.pause()
  try {
    await twikoo.allowCors(request, response)
  } catch (e) {
    logger.error('Twikoo CORS configuration failed:', e)
  }
  response.writeHead(code, {
    Connection: 'close',
    'Content-Type': 'application/json'
  })
  response.end(JSON.stringify({ code, message }), () => request.destroy())
}

server.on('connection', (socket) => {
  sockets.add(socket)
  socket.on('close', () => sockets.delete(socket))
})

const port = parseInt(process.env.TWIKOO_PORT) || 8080
const host = process.env.TWIKOO_HOST || (process.env.TWIKOO_LOCALHOST_ONLY === 'true' ? 'localhost' : '::')

server.listen(port, host, function () {
  logger.info('Twikoo is using loki database')
  logger.info(`Twikoo function started on host ${host} port ${port}`)
})

function closeServer () {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

function destroySockets () {
  for (const socket of sockets) {
    socket.destroy()
  }
}

async function shutdownWithTimeout () {
  let timeoutId
  const closeTask = closeServer()
  const timeoutTask = new Promise((resolve) => {
    timeoutId = setTimeout(() => {
      logger.warn(`Twikoo server shutdown timed out after ${TWIKOO_SHUTDOWN_TIMEOUT}ms, destroying open connections`)
      destroySockets()
      resolve()
    }, TWIKOO_SHUTDOWN_TIMEOUT)
  })
  await Promise.race([closeTask, timeoutTask])
  clearTimeout(timeoutId)
  await closeTask
}

async function runShutdown (signal) {
  isShuttingDown = true
  logger.info(`Received ${signal}, shutting down Twikoo server...`)
  try {
    await shutdownWithTimeout()
  } catch (e) {
    logger.error('Twikoo HTTP server shutdown failed:', e)
  } finally {
    if (typeof twikoo.shutdown === 'function') {
      await twikoo.shutdown()
    }
  }
  logger.info('Twikoo server stopped')
}

async function shutdown (signal) {
  if (!shuttingDownPromise) {
    shuttingDownPromise = runShutdown(signal)
  }
  return await shuttingDownPromise
}

async function handleSignal (signal) {
  try {
    await shutdown(signal)
    process.exitCode = 0
  } catch (e) {
    logger.error('Twikoo server shutdown failed:', e)
    process.exitCode = 1
  }
}

process.on('SIGTERM', () => handleSignal('SIGTERM'))
process.on('SIGINT', () => handleSignal('SIGINT'))
