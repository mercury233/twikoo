const ARRAY_FIELDS = ['like', 'ups', 'downs']

const parseJsonArrayField = (value) => {
  if (Array.isArray(value)) return value
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (!trimmed.startsWith('[')) return value
  try {
    const parsed = JSON.parse(trimmed)
    return Array.isArray(parsed) ? parsed : value
  } catch (e) {
    return value
  }
}

const normalizeTwikooComment = (comment) => {
  const parsed = { ...comment }
  if (comment._id && comment._id.$oid) {
    // 解决 id 历史数据问题
    parsed._id = comment._id.$oid
  }
  if (comment.pid === null) {
    delete parsed.pid
  }
  if (comment.rid === null) {
    delete parsed.rid
  }
  for (const field of ARRAY_FIELDS) {
    if (field in parsed) {
      parsed[field] = parseJsonArrayField(parsed[field])
    }
  }
  return parsed
}

const fn = {
  // 兼容 Leancloud 两种 JSON 导出格式
  jsonParse (content) {
    try {
      return JSON.parse(content)
    } catch (e1) {
      const results = []
      const lines = content.split('\n')
      for (const line of lines) {
        // 逐行 JSON.parse
        try {
          results.push(JSON.parse(line))
        } catch (e2) {}
      }
      return { results }
    }
  },
  // Valine 导入
  async commentImportValine (valineDb, log) {
    let arr
    if (valineDb instanceof Array) {
      arr = valineDb
    } else if (valineDb && valineDb.results) {
      arr = valineDb.results
    }
    if (!arr) {
      log('Valine 评论文件格式有误')
      return
    }
    const comments = []
    log(`共 ${arr.length} 条评论`)
    for (const comment of arr) {
      try {
        const parsed = {
          _id: comment.objectId,
          nick: comment.nick,
          ip: comment.ip,
          mail: comment.mail,
          mailMd5: comment.mailMd5,
          isSpam: comment.isSpam,
          ua: comment.ua || '',
          link: comment.link,
          pid: comment.pid,
          rid: comment.rid,
          master: false,
          comment: comment.comment,
          url: comment.url,
          created: new Date(comment.createdAt).getTime(),
          updated: new Date(comment.updatedAt).getTime()
        }
        comments.push(parsed)
        log(`${comment.objectId} 解析成功`)
      } catch (e) {
        log(`${comment.objectId} 解析失败：${e.message}`)
      }
    }
    log(`解析成功 ${comments.length} 条评论`)
    return comments
  },
  // Twikoo 导入
  async commentImportTwikoo (twikooDb, log) {
    let arr
    if (twikooDb instanceof Array) {
      arr = twikooDb
    } else if (twikooDb && twikooDb.results) {
      arr = twikooDb.results
    }
    if (!arr) {
      log('Twikoo 评论文件格式有误')
      return
    }
    const comments = []
    log(`共 ${arr.length} 条评论`)
    for (const comment of arr) {
      try {
        const parsed = normalizeTwikooComment(comment)
        comments.push(parsed)
        log(`${comment._id} 解析成功`)
      } catch (e) {
        log(`${comment._id} 解析失败：${e.message}`)
      }
    }
    log(`解析成功 ${comments.length} 条评论`)
    return comments
  }
}

module.exports = fn
