import { Marked } from 'marked'

const marked = new Marked({
  gfm: true,
  breaks: true,
  async: false
})

function escapeAttribute (value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Comment UIs rarely use indented (4-space) code blocks, but users often
// prefix lines with spaces for visual indentation — which Markdown would
// otherwise render as a code block (#855).
marked.use({
  tokenizer: {
    code () {
      return undefined
    }
  },
  renderer: {
    image (token) {
      if (!token.owo) return false
      const className = ['tk-owo-emotion', token.className].filter(Boolean).join(' ')
      return `<img class="${escapeAttribute(className)}" src="${escapeAttribute(token.href)}" alt="${escapeAttribute(token.text)}">`
    }
  },
  extensions: [{
    name: 'owo',
    level: 'inline',
    start (src) {
      return src.indexOf(':')
    },
    tokenizer (src) {
      if (this.lexer.state.inRawBlock) return
      const match = /^:([^\s:]+):/.exec(src)
      const images = this.lexer.options.odata
      if (!match || !images || !Object.prototype.hasOwnProperty.call(images, match[1])) return
      const image = images[match[1]]
      const url = image?.src
      if (typeof url !== 'string' || !url) return
      // 标准图片 token 让外层 Markdown 图片的 alt 使用纯文本渲染。
      return { type: 'image', raw: match[0], href: url, text: match[0], className: image.className, owo: true }
    }
  }]
})

export default marked
