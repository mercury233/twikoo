<template>
  <div :class="[
    type === 'textarea' ? 'el-textarea' : 'el-input',
    size && `el-input--${size}`,
    {
      'is-disabled': disabled,
      'is-exceed': showCount && textValue.length > $attrs.maxlength,
      'el-input-group': $slots.prepend || $slots.append,
      'el-input-group--prepend': $slots.prepend,
      'el-input-group--append': $slots.append,
      'el-input--suffix': clearable || showPassword
    }
  ]" @mouseenter="hovering = true" @mouseleave="hovering = false"
      @focusin="focused = true"
      @focusout="focused = $event.currentTarget.contains($event.relatedTarget)">
    <template v-if="type !== 'textarea'">
      <div v-if="$slots.prepend" class="el-input-group__prepend"><slot name="prepend" /></div>
      <input ref="input" class="el-input__inner" v-bind="$attrs"
          :type="showPassword ? (passwordVisible ? 'text' : 'password') : type"
          :disabled="disabled" :readonly="readonly" :autocomplete="autocomplete"
          @input="onInput" @change="$emit('change', $event.target.value)"
          @compositionstart="composing = true" @compositionend="onCompositionEnd"
          @focus="$emit('focus', $event)"
          @blur="$emit('blur', $event)">
      <span v-if="clearable || showPassword" ref="suffix" class="el-input__suffix">
        <button v-if="clearable && textValue && !disabled && !readonly && (focused || hovering)"
            type="button" class="el-input__icon el-input__clear" :aria-label="t('INPUT_CLEAR')"
            @mousedown.prevent @keyup.stop @click="clear">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6m0-6-6 6" /></svg>
        </button>
        <button v-if="showPassword && !disabled && !readonly && (textValue || focused)"
            type="button" class="el-input__icon el-input__clear" :aria-label="t('INPUT_SHOW_PASSWORD')"
            :aria-pressed="passwordVisible" @mousedown.prevent @keyup.stop @click="togglePassword">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
        </button>
      </span>
      <div v-if="$slots.append" ref="append" class="el-input-group__append"><slot name="append" /></div>
    </template>
    <textarea v-else ref="textarea" class="el-textarea__inner" v-bind="$attrs"
        :disabled="disabled" :readonly="readonly" :autocomplete="autocomplete"
        @input="onInput" @change="$emit('change', $event.target.value)"
        @compositionstart="composing = true" @compositionend="onCompositionEnd"
        @focus="$emit('focus', $event)" @blur="$emit('blur', $event)" />
    <span v-if="showCount" class="el-input__count">{{ textValue.length }}/{{ $attrs.maxlength }}</span>
  </div>
</template>

<script>
import t from '../../utils/i18n'

export default {
  inheritAttrs: false,
  props: {
    value: [String, Number],
    type: { type: String, default: 'text' },
    size: String,
    disabled: Boolean,
    readonly: Boolean,
    clearable: Boolean,
    showPassword: Boolean,
    showWordLimit: Boolean,
    autosize: [Boolean, Object],
    autocomplete: { type: String, default: 'off' }
  },
  data () {
    return { composing: false, focused: false, hovering: false, passwordVisible: false }
  },
  computed: {
    textValue () {
      return this.value == null ? '' : String(this.value)
    },
    showCount () {
      return this.showWordLimit && this.$attrs.maxlength &&
        !this.disabled && !this.readonly && !this.showPassword
    }
  },
  methods: {
    t,
    focus () {
      const input = this.$refs.input || this.$refs.textarea
      if (input) input.focus()
    },
    syncValue () {
      const input = this.$refs.input || this.$refs.textarea
      // 避免重写相同的值打断光标位置，以及覆盖输入法尚未提交的文字。
      if (input && !this.composing && input.value !== this.textValue) input.value = this.textValue
    },
    onInput (event) {
      if (this.composing || event.target.value === this.textValue) return
      this.$emit('input', event.target.value)
      this.$nextTick(this.syncValue)
    },
    onCompositionEnd (event) {
      this.composing = false
      this.onInput(event)
    },
    clear () {
      this.$emit('input', '')
      this.$emit('change', '')
      this.$emit('clear')
      this.focus()
    },
    togglePassword () {
      const input = this.$refs.input
      const { selectionStart, selectionEnd } = input
      this.passwordVisible = !this.passwordVisible
      this.$nextTick(() => {
        this.focus()
        input.setSelectionRange(selectionStart, selectionEnd)
      })
    },
    resizeTextarea () {
      const input = this.$refs.textarea
      if (!input || !this.autosize || !input.getClientRects().length) return
      const style = getComputedStyle(input)
      const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5
      const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
      const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth)
      const borderBox = style.boxSizing === 'border-box'
      const minRows = this.autosize.minRows || 1
      const minHeight = minRows * lineHeight + (borderBox ? padding + border : 0)
      const maxHeight = this.autosize.maxRows
        ? this.autosize.maxRows * lineHeight + (borderBox ? padding + border : 0)
        : Infinity
      const measuringInput = document.createElement('textarea')
      for (const property of [
        'width', 'boxSizing', 'padding', 'borderWidth', 'borderStyle',
        'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontVariant',
        'lineHeight', 'letterSpacing', 'wordSpacing', 'textIndent', 'textTransform',
        'whiteSpace', 'wordBreak', 'overflowWrap', 'tabSize', 'direction'
      ]) {
        measuringInput.style[property] = style[property]
      }
      Object.assign(measuringInput.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        visibility: 'hidden',
        pointerEvents: 'none',
        height: '0',
        minHeight: '0',
        maxHeight: 'none',
        overflow: 'hidden'
      })
      measuringInput.tabIndex = -1
      measuringInput.setAttribute('aria-hidden', 'true')
      measuringInput.value = input.value || input.placeholder
      document.body.appendChild(measuringInput)
      const height = measuringInput.scrollHeight + (borderBox ? border : -padding)
      measuringInput.remove()
      input.style.minHeight = `${minHeight}px`
      input.style.height = `${Math.max(minHeight, Math.min(height, maxHeight))}px`
      input.style.overflowY = height > maxHeight ? 'auto' : 'hidden'
    },
    observeTextarea () {
      if (this.resizeFrame != null) {
        cancelAnimationFrame(this.resizeFrame)
        this.resizeFrame = null
      }
      if (this.resizeObserver) {
        this.resizeObserver.disconnect()
        this.resizeObserver = null
      }
      if (this.type !== 'textarea') return
      let previousWidth
      this.resizeObserver = new ResizeObserver(([entry]) => {
        if (entry.contentRect.width !== previousWidth) {
          previousWidth = entry.contentRect.width
          // 延后修改高度，避免在当前观察通知周期内再次改变容器尺寸。
          if (this.resizeFrame != null) cancelAnimationFrame(this.resizeFrame)
          this.resizeFrame = requestAnimationFrame(() => {
            this.resizeFrame = null
            this.resizeTextarea()
          })
        }
      })
      this.resizeObserver.observe(this.$el)
    },
    updateSuffix () {
      if (this.$refs.suffix) {
        this.$refs.suffix.style.right = `${5 + (this.$refs.append ? this.$refs.append.offsetWidth : 0)}px`
      }
    }
  },
  watch: {
    value () {
      this.syncValue()
      this.$nextTick(this.resizeTextarea)
    },
    type () {
      this.$nextTick(() => {
        this.syncValue()
        this.resizeTextarea()
        this.observeTextarea()
      })
    }
  },
  mounted () {
    this.syncValue()
    this.resizeTextarea()
    this.updateSuffix()
    this.observeTextarea()
  },
  updated () {
    this.updateSuffix()
  },
  beforeDestroy () {
    if (this.resizeObserver) this.resizeObserver.disconnect()
    if (this.resizeFrame != null) cancelAnimationFrame(this.resizeFrame)
  }
}
</script>

<style>
/* 容器基础规则不增加作用域优先级，保留页面对宽度等布局属性的覆盖。 */
:where(.twikoo) .el-input,
:where(.twikoo) .el-textarea {
  position: relative;
  display: inline-block;
  width: 100%;
  font-size: 14px;
}
.twikoo .el-textarea {
  vertical-align: bottom;
}
.twikoo .el-input__inner,
.twikoo .el-textarea__inner {
  box-sizing: border-box;
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: inherit;
  background-image: none;
  outline: none;
  transition: border-color 0.2s;
}
.twikoo .el-input__inner {
  display: inline-block;
  height: 40px;
  line-height: 40px;
  padding: 0 15px;
  appearance: none;
}
.twikoo .el-textarea__inner {
  display: block;
  padding: 5px 15px;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
}
.twikoo .el-input__inner::placeholder,
.twikoo .el-textarea__inner::placeholder {
  color: #c0c4cc;
}
.twikoo .el-input--small {
  font-size: 13px;
}
.twikoo .el-input--small .el-input__inner {
  height: 32px;
  line-height: 32px;
}
.twikoo .el-input--suffix .el-input__inner {
  padding-right: 30px;
}
.twikoo .el-input__suffix {
  position: absolute;
  top: 0;
  right: 5px;
  height: 100%;
  display: inline-flex;
  align-items: center;
}
.twikoo .el-input__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: #c0c4cc;
  cursor: pointer;
}
.twikoo .el-input__clear:hover {
  color: #909399;
}
.twikoo .el-input__clear svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
}
.twikoo .el-input__count {
  position: absolute;
  right: 10px;
  bottom: 5px;
  font-size: 12px;
}
.twikoo .is-disabled > .el-input__inner,
.twikoo .is-disabled > .el-textarea__inner {
  cursor: not-allowed;
}
.twikoo .is-exceed > .el-textarea__inner {
  border-color: #f56c6c;
}
.twikoo .el-input-group {
  display: inline-table;
  border-collapse: separate;
  border-spacing: 0;
  line-height: normal;
}
.twikoo .el-input-group > .el-input__inner {
  display: table-cell;
  vertical-align: middle;
}
.twikoo .el-input-group__prepend,
.twikoo .el-input-group__append {
  display: table-cell;
  position: relative;
  vertical-align: middle;
  width: 1px;
  padding: 0 20px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  white-space: nowrap;
}
.twikoo .el-input-group__prepend {
  border-right: 0;
}
.twikoo .el-input-group__append {
  border-left: 0;
}
.twikoo .el-input-group--prepend .el-input__inner,
.twikoo .el-input-group__append {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.twikoo .el-input-group--append .el-input__inner,
.twikoo .el-input-group__prepend {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.twikoo .el-input-group__append .el-button {
  margin: -10px -20px;
  border-color: transparent;
  border-top: 0;
  border-bottom: 0;
  background: transparent;
  color: inherit;
  font-size: inherit;
}
</style>
