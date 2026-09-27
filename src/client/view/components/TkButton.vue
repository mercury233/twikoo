<template>
  <button class="el-button"
      :class="[`el-button--${type}`, size && `el-button--${size}`, { 'is-disabled': disabled }]"
      :type="nativeType"
      :disabled="disabled"
      @click="!disabled && $emit('click', $event)">
    <span><slot /></span>
  </button>
</template>

<script>
export default {
  props: {
    type: { type: String, default: 'default' },
    size: String,
    nativeType: { type: String, default: 'button' },
    disabled: Boolean
  }
}
</script>

<style>
/* 保留 el-* 类名，兼容宿主主题针对 Twikoo 1.x 的样式。 */
/* 基础规则的作用域不增加优先级，让页面布局样式仍可覆盖。 */
:where(.twikoo) .el-button {
  display: inline-block;
  box-sizing: border-box;
  margin: 0;
  padding: 12px 20px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  appearance: none;
  user-select: none;
  transition: 0.1s;
}
.twikoo .el-button + .el-button {
  margin-left: 10px;
}
.twikoo .el-button--primary {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
}
.twikoo .el-button--primary:focus,
.twikoo .el-button--primary:hover {
  background: #66b1ff;
  border-color: #66b1ff;
  color: #fff;
}
.twikoo .el-button--primary:active {
  background: #3a8ee6;
  border-color: #3a8ee6;
}
.twikoo .el-button--small,
.twikoo .el-button--mini {
  font-size: 12px;
  border-radius: 3px;
}
.twikoo .el-button--small {
  padding: 9px 15px;
}
.twikoo .el-button--mini {
  padding: 7px 15px;
}
.twikoo .el-button--text {
  border-color: transparent;
  background: transparent;
  color: #409eff;
  padding-left: 0;
  padding-right: 0;
}
.twikoo .el-button--text:focus,
.twikoo .el-button--text:hover {
  color: #66b1ff;
}
.twikoo .el-button--text:active {
  color: #3a8ee6;
}
.twikoo .el-button.is-disabled {
  cursor: not-allowed;
}
</style>
