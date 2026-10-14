import { logger } from '.'

async function initOwoEmotion (api) {
  try {
    const response = await fetch(api)
    if (!response.ok && response.status !== 304) {
      throw new Error('HTTP ' + response.status)
    }
    return formatOdata(await response.json()) ?? {}
  } catch (e) {
    logger.warn('OwO data request failed: ', e)
    return {}
  }
}

async function initOwoEmotions (apis) {
  const odata = {}
  const odatas = await Promise.all(apis.split(',').map((api) => initOwoEmotion(api.trim())))
  Object.assign(odata, ...odatas)
  return odata
}

// 格式化不规范的 OwO 数据格式
function formatOdata (odata) {
  try {
    Object.values(odata).forEach(item => {
      if (item.type === 'image') {
        for (const image of item.container) {
          if (!image.text) {
            // 缺少 text 的，取 img 文件名作为 text
            image.text = getFilename(getImg(image.icon)?.src || '')
          }
        }
      }
    })
    return odata
  } catch (e) {
    logger.warn('OwO data is bad: ', e)
  }
}

const template = document.createElement('template')
function getImg (html) {
  try {
    template.innerHTML = html
    return template.content.querySelector('img')
  } catch (e) {
    return null
  }
}

function getFilename (url) {
  return url.split('#').shift().split('?').shift().split('/').pop()
}

function initMarkedOwo (odata) {
  if (odata && Object.values(odata)) {
    const imgs = {}
    Object
      .values(odata)
      .forEach(item => {
        item.container.forEach(img => {
          const image = getImg(img.icon)
          if (image?.src) {
            imgs[img.text] = { src: image.src, className: image.className }
          }
        })
      })
    return imgs
  }
}

export {
  initOwoEmotions,
  initMarkedOwo
}
