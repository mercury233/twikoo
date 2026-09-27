const loadingStates = new WeakMap()
const outsideStates = new WeakMap()

function updateLoading (el, { value }) {
  let state = loadingStates.get(el)
  if (value && !state) {
    const mask = document.createElement('div')
    mask.className = 'el-loading-mask'
    mask.innerHTML = '<div class="el-loading-spinner"><svg class="circular" viewBox="25 25 50 50" aria-hidden="true"><circle class="path" cx="50" cy="50" r="20" fill="none" /></svg></div>'
    const positioned = getComputedStyle(el).position === 'static'
    state = { mask, positioned }
    loadingStates.set(el, state)
    if (positioned) el.classList.add('el-loading-parent--relative')
    el.appendChild(mask)
  } else if (!value && state) {
    // 每个宿主只清理自己的遮罩，管理面板内还有独立的加载区域。
    state.mask.remove()
    if (state.positioned) el.classList.remove('el-loading-parent--relative')
    loadingStates.delete(el)
  }
}

export const loading = {
  inserted: updateLoading,
  update: updateLoading,
  unbind (el) {
    updateLoading(el, { value: false })
  }
}

export const Clickoutside = {
  bind (el, { value }) {
    const state = { callback: value, start: null }
    state.down = event => { state.start = event.target }
    state.up = event => {
      if (state.start && !el.contains(state.start) && !el.contains(event.target)) state.callback()
      state.start = null
    }
    outsideStates.set(el, state)
    document.addEventListener('mousedown', state.down)
    document.addEventListener('mouseup', state.up)
  },
  update (el, { value }) {
    outsideStates.get(el).callback = value
  },
  unbind (el) {
    const state = outsideStates.get(el)
    document.removeEventListener('mousedown', state.down)
    document.removeEventListener('mouseup', state.up)
    outsideStates.delete(el)
  }
}
