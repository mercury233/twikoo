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
  getHtmlToTextForWordCount () {
    const { compile } = require('html-to-text') // HTML 转纯文本，字数统计专用
    return compile({
      wordwrap: false,
      formatters: {
        imageTextRule (elem, walk, builder) {
          // 图片按替代文本计数，无有效替代文本的图片占10个字符
          builder.addInline(elem.attribs.alt?.trim() || '-'.repeat(10), { noWordTransform: true })
        },
        horizontalRule (elem, walk, builder) {
          // 水平分割线占10个字符，html-to-text默认输出的是45个字符
          builder.addInline('-'.repeat(10), { noWordTransform: true })
        }
      },
      selectors: [
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'img', format: 'imageTextRule' },
        { selector: 'hr', format: 'horizontalRule' },
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
  getPushoo () {
    const pushoo = require('pushoo').default // 即时消息通知
    return pushoo
  }
}
