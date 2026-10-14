/*!
 * OwO v1.0.2
 * Source: https://github.com/DIYgod/OwO/blob/master/src/OwO.js
 * Author: DIYgod
 * Modified by: iMaeGoo
 * Released under the MIT License.
 */

import DOMPurify from 'dompurify'

export default class OwO {
  constructor (option) {
    const defaultOption = {
      logo: 'OwO表情',
      container: document.getElementsByClassName('OwO')[0],
      target: document.getElementsByTagName('textarea')[0],
      position: 'down',
      maxHeight: '250px',
      odata: {}
    }
    for (const defaultKey in defaultOption) {
      if (defaultOption[defaultKey] && !option[defaultKey]) {
        option[defaultKey] = defaultOption[defaultKey]
      }
    }
    this.container = option.container
    this.target = option.target
    if (option.position === 'up') {
      this.container.classList.add('OwO-up')
    }

    this.odata = option.odata
    setTimeout(() => { this.init(option) })
  }

  init (option) {
    this.area = option.target
    this.packages = Object.keys(this.odata)

    this.logo = document.createElement('div')
    this.logo.className = 'OwO-logo'
    this.logo.appendChild(DOMPurify.sanitize(option.logo, { RETURN_DOM_FRAGMENT: true }))
    const body = document.createElement('div')
    body.className = 'OwO-body'
    const bar = document.createElement('div')
    bar.className = 'OwO-bar'
    this.packagesEle = document.createElement('ul')
    this.packagesEle.className = 'OwO-packages'
    bar.appendChild(this.packagesEle)
    body.appendChild(bar)
    this.container.replaceChildren(this.logo, body)
    const template = document.createElement('template')
    for (const name of this.packages) {
      const opackage = this.odata[name]
      const items = document.createElement('ul')
      items.className = `OwO-items OwO-items-${opackage.type}`
      items.style.maxHeight = `${parseInt(option.maxHeight) - 53}px`
      for (const emotion of opackage.container) {
        const item = document.createElement('li')
        item.className = 'OwO-item'
        item.title = emotion.text || ''
        template.innerHTML = DOMPurify.sanitize(emotion.icon)
        const sourceImage = template.content.querySelector('img')
        if (sourceImage) {
          const image = document.createElement('img')
          if (sourceImage.src && DOMPurify.isValidAttribute('img', 'src', sourceImage.src)) {
            image.src = sourceImage.src
          }
          image.className = sourceImage.className
          image.classList.add('tk-owo-emotion')
          image.alt = emotion.text ? `:${emotion.text}:` : ''
          image.loading = 'lazy'
          item.appendChild(image)
        } else {
          item.textContent = emotion.icon
        }
        items.appendChild(item)
      }
      body.insertBefore(items, bar)
      const tab = document.createElement('li')
      const label = document.createElement('span')
      label.textContent = name
      tab.appendChild(label)
      this.packagesEle.appendChild(tab)
    }

    this.preview = document.createElement('div')
    this.preview.className = 'OwO-preview'
    this.preview.hidden = true
    this.preview.setAttribute('aria-hidden', 'true')
    const previewImage = document.createElement('img')
    previewImage.alt = ''
    this.preview.appendChild(previewImage)
    body.appendChild(this.preview)
    body.addEventListener('pointerover', (e) => {
      if (e.pointerType === 'touch') return
      const image = e.target.closest('.OwO-item')?.querySelector('img.tk-owo-preview')
      if (image) {
        previewImage.src = image.src
        previewImage.className = image.className
        previewImage.classList.add('tk-owo-emotion')
        this.preview.hidden = false
      } else {
        this.preview.hidden = true
      }
    })
    body.addEventListener('pointerout', (e) => {
      const item = e.target.closest('.OwO-item')
      if (!item || !item.contains(e.relatedTarget)) this.preview.hidden = true
    })
    body.addEventListener('scroll', () => { this.preview.hidden = true }, true)

    // bind event
    this.logo.addEventListener('click', () => {
      this.toggle()
    })

    body.addEventListener('click', (e) => {
      let target = null
      if (e.target.classList.contains('OwO-item')) {
        target = e.target
      } else if (e.target.parentNode.classList.contains('OwO-item')) {
        target = e.target.parentNode
      }
      if (target) {
        const cursorPos = this.area.selectionEnd
        const areaValue = this.area.value
        let text = target.textContent
        const image = target.querySelector('img')
        if (image) {
          if (target.title) {
            text = ':' + target.title + ': '
          } else {
            console.warn('This emoticon is treated as a normal image instead of tk-owo-emotion. Please set the text attribute in owo.json for proper behavior.')
            const src = image.getAttribute('src')
            text = src ? `![](<${src.replace(/</g, '%3C').replace(/>/g, '%3E')}>)` : ''
          }
        }
        this.area.value = areaValue.slice(0, cursorPos) + text + areaValue.slice(cursorPos)
        // 手动触发 input 事件
        this.area.dispatchEvent(new InputEvent('input'))
        this.area.focus()
        this.toggle()
      }
    })

    for (let i = 0; i < this.packagesEle.children.length; i++) {
      ((index) => {
        this.packagesEle.children[i].addEventListener('click', () => {
          this.tab(index)
        })
      })(i)
    }

    this.tab(0)
  }

  toggle () {
    this.preview.hidden = true
    if (this.container.classList.contains('OwO-open')) {
      this.container.classList.remove('OwO-open')
    } else {
      this.container.classList.add('OwO-open')
    }
  }

  tab (index) {
    this.preview.hidden = true
    const itemsShow = this.container.getElementsByClassName('OwO-items-show')[0]
    if (itemsShow) {
      itemsShow.classList.remove('OwO-items-show')
    }
    this.container.getElementsByClassName('OwO-items')[index].classList.add('OwO-items-show')

    const packageActive = this.container.getElementsByClassName('OwO-package-active')[0]
    if (packageActive) {
      packageActive.classList.remove('OwO-package-active')
    }
    this.packagesEle.getElementsByTagName('li')[index].classList.add('OwO-package-active')
  }
}
