module.exports = function (source) {
  // Vue Loader 15.11.1 对普通样式生成默认导入，但其 pitcher 仅转发命名导出。
  // CSS Modules 需要 styleN 的映射，普通样式则只需要执行模块以注入或提取 CSS。
  return source.replace(/^import style\d+ from ("[^"\r\n]+\?vue&type=style&[^"\r\n]+")$/gm, (statement, request) => {
    const query = JSON.parse(request).split('?')[1]
    return new URLSearchParams(query).has('module') ? statement : `import ${request}`
  })
}
