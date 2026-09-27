const {
  getAkismetClient,
  getTencentcloudTms
} = require('./lib')
const {
  equalsMail
} = require('.')
const AkismetClient = getAkismetClient()

const logger = require('./logger')

let tencentcloudTms

function getTencentCloudTms () {
  if (!tencentcloudTms) {
    try {
      tencentcloudTms = getTencentcloudTms()
    } catch (e) {
      logger.warn('加载 "tencentcloud-sdk-nodejs-tms" 失败', e)
    }
  }
  return tencentcloudTms
}

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
      } else if (config.QCLOUD_SECRET_ID && config.QCLOUD_SECRET_KEY) {
        // 腾讯云内容安全
        const client = new (getTencentCloudTms().tms.v20201229.Client)({
          credential: { secretId: config.QCLOUD_SECRET_ID, secretKey: config.QCLOUD_SECRET_KEY },
          region: 'ap-shanghai',
          profile: { httpProfile: { endpoint: 'tms.tencentcloudapi.com' } }
        })
        const textModerationParams = {
          // 文档: https://cloud.tencent.com/document/api/1124/51860
          Content: Buffer.from(comment.comment, 'utf8').toString('base64'),
          DataId: comment.id,
          User: { Nickname: comment.nick },
          Device: { IP: comment.ip }
        }
        if (config.QCLOUD_CMS_BIZTYPE) {
          textModerationParams.BizType = config.QCLOUD_CMS_BIZTYPE
        }
        logger.log('腾讯云请求参数：', textModerationParams)
        const checkResult = await client.TextModeration(textModerationParams)
        logger.log('腾讯云返回结果：', checkResult)
        isSpam = checkResult.Suggestion !== 'Pass'
        if (isSpam) {
          logger.warn(`腾讯云判定不通过: id="${comment.id}" nick="${comment.nick}" suggestion="${checkResult.Suggestion}" label="${checkResult.Label}" subLabel="${checkResult.SubLabel}"`)
        }
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
