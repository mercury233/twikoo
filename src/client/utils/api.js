import { app } from '../view'

const isUrl = (s) => {
  return /^http(s)?:\/\//.test(s)
}

const call = async (event, data = {}) => {
  const _envId = data.envId || app?.$twikoo.envId
  if (!isUrl(_envId)) {
    throw new Error('envId 必须配置为 HTTP(S) 后端地址')
  }
  const accessToken = localStorage.getItem('twikoo-access-token')
  const response = await fetch(_envId, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, accessToken, ...data, envId: _envId })
  })
  if (response.status !== 200) return Promise.reject(response.status)
  const result = await response.json()
  if (result.accessToken) {
    localStorage.setItem('twikoo-access-token', result.accessToken)
  }
  return { result }
}

export {
  isUrl,
  call
}
