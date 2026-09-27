const {
  getAkismetClient
} = require('./lib')
const {
  equalsMail
} = require('.')
const AkismetClient = getAkismetClient()

const logger = require('./logger')

const fn = {
  // 后垃圾评论检测
  async postCheckSpam (comment, config) {
    try {
      let isSpam
      if (comment.isSpam) {
        // 预检测没过的，就不再检测了
        isSpam = true
      } else if (equalsMail(config.BLOGGER_EMAIL, comment.mail)) {
        // 博主本人评论，不再检测了
        isSpam = false
      } else if (config.AKISMET_KEY) {
        // Akismet
        const akismetClient = new AkismetClient({
          key: config.AKISMET_KEY,
          blog: config.SITE_URL
        })
        const isValid = await akismetClient.verifyKey()
        if (!isValid) {
          logger.warn('Akismet key 不可用：', config.AKISMET_KEY)
          return
        }
        isSpam = await akismetClient.checkSpam({
          user_ip: comment.ip,
          user_agent: comment.ua,
          permalink: comment.href,
          comment_type: comment.rid ? 'reply' : 'comment',
          comment_author: comment.nick,
          comment_author_email: comment.mail,
          comment_author_url: comment.link,
          comment_content: comment.comment
        })
      }
      logger.log('垃圾评论检测结果：', isSpam)
      return isSpam
    } catch (err) {
      logger.error('垃圾评论检测异常：', err)
    }
  }
}

module.exports = fn
