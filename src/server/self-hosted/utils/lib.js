const crypto = require('crypto')

module.exports = {
  getHtmlToText () {
    const { compile } = require('html-to-text') // HTML 转纯文本
    return compile({
      wordwrap: false,
      selectors: [
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'img', format: 'skip' }
      ]
    })
  },
  getAkismetClient () {
    const { AkismetClient } = require('akismet-api') // 反垃圾 API
    return AkismetClient
  },
  getFormData () {
    const FormData = require('form-data') // 图片上传
    return FormData
  },
  getAxios () {
    const axios = require('axios') // 发送 REST 请求
    return axios
  },
  getBowser () {
    const bowser = require('bowser') // UserAgent 格式化
    return bowser
  },
  getDomPurify () {
    // 初始化反 XSS
    const { JSDOM } = require('jsdom') // document.window 服务器版
    const createDOMPurify = require('dompurify') // 反 XSS
    const window = new JSDOM('').window
    const DOMPurify = createDOMPurify(window)
    return DOMPurify
  },
  getIpToRegion () {
    const { Ip2Region } = require('ts-ip2region2') // IP 属地查询
    return Ip2Region
  },
  getMd5 () {
    return (message) => {
      return crypto.createHash('md5').update(String(message)).digest('hex')
    }
  },
  getSha256 () {
    return (message) => {
      return crypto.createHash('sha256').update(message == null ? '' : String(message)).digest('hex')
    }
  },
  getNodemailer () {
    const nodemailer = require('nodemailer') // 发送邮件
    return nodemailer
  },
  async getPushoo () {
    // pushoo 2.0.9 的 CommonJS 导出指向缺失文件，使用其 ESM 入口。
    const { default: pushoo } = await import('pushoo')
    return pushoo
  }
}
