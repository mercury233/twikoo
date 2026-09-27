import { app } from '../view'

const isUrl = (s) => {
  return /^http(s)?:\/\//.test(s)
}

const call = async (event, data = {}) => {
  const _envId = data.envId || app?.$twikoo.envId
  if (isUrl(_envId)) {
    return await new Promise((resolve, reject) => {
      try {
        const accessToken = localStorage.getItem('twikoo-access-token')
        const xhr = new XMLHttpRequest()
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              const result = JSON.parse(xhr.responseText)
              if (result.accessToken) {
                localStorage.setItem('twikoo-access-token', result.accessToken)
              }
              resolve({ result })
            } else {
              reject(xhr.status)
            }
          }
        }
        xhr.open('POST', _envId)
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify({ event, accessToken, ...data, envId: _envId }))
      } catch (e) {
        reject(e)
      }
    })
  } else {
    throw new Error('envId 必须配置为 HTTP(S) 后端地址')
  }
}

export {
  isUrl,
  call
}
