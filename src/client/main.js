import { render, destroy } from './view'
import { setLanguage, isUrl, getCommentsCountApi, getRecentCommentsApi, getVisitorsCountApi, updateVisitorsCount } from './utils'

async function init (options = {}) {
  if (!isUrl(options.envId)) {
    throw new Error('envId 必须配置为 HTTP(S) 后端地址')
  }
  setLanguage(options)
  render(options)
  await updateVisitorsCount(options)
}

async function getCommentsCount (options = {}) {
  return await getCommentsCountApi(options)
}

async function getRecentComments (options = {}) {
  return await getRecentCommentsApi(options)
}

async function getVisitorsCount (options = {}) {
  return await getVisitorsCountApi(options)
}

export default init
export {
  init,
  destroy,
  getCommentsCount,
  getRecentComments,
  getVisitorsCount
}
