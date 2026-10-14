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
  if (response.status !== 200) {
    const error = new Error(`HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ''}`)
    error.status = response.status
    try {
      const result = await response.json()
      if (typeof result?.message === 'string' && result.message.trim()) {
        error.message += `: ${result.message}`
      }
    } catch (e) {}
    throw error
  }
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
