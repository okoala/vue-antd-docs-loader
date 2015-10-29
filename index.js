"use strict";

var marked = require("marked")
var loaderUtils = require("loader-utils")
var assign = require("object-assign")
var prism = require('jstransformer')(require('jstransformer-prismjs'))

// default option
var options = {
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
};

var wrapMarkdown = function (html) {
  return '<div class="markdown">' + html + '</div>'
}

var wrapDemoCode = function (html) {
  html = String(html)
    .replace(/\r\n?|[\n\u2028\u2029]/g, '\n')
    .replace(/^\uFEFF/, '')
    .replace(/[\r\n]+/g, '\n') // 去掉多余的换行，并且去掉IE中困扰人的\r
    .replace(/^\n+|\s+$/mg, '') // 去掉空行，首部空行，尾部空白
    .replace('<demo>', '<div class="code-boxes">')
    .replace('</demo>', '</div>')
    .replace(
      /^(.*#\{[^}]*\}.*|[ \t]*[&=:|].*|[ \w\t_$]*([^&\^?|\n\w\/'"{}\[\]+\-():;, \t=\.$_]|:\/\/).*$|(?!\s*(else|do|try|finally|void|typeof\s[\w$_]*)\s*$)[^'":;{}()\[\],\n|=&\/^?]+$)\s?/mg,
      function (expression) { // 输出原文
        // 处理空白字符
        expression = expression
          .replace(/\n/g, '\\n') // 处理回车转义符
          .replace(/^'',|,''$/g, ''); // 去掉多余的代码

        return expression;
    })
    .replace(/<example title=\"([^\"]*)\"[^>]*>(.*?)<\/example>/gim, function(s, title, code) {
      // 删除代码中四个空格，主要是代码格式问题
      code = code.replace(/\s{4}/gi, '')

      var esCode = prism.render(code, { language: 'markup' }).body
      var str = `<div class="code-box code-boxes-col">
          <h3>${title}</h3>
          <div class="code-boxes-col-2-1 code-box-demo">${code}</div>
          <div class="code-boxes-col-2-1 code-box-code">${esCode}</div>
      </div>`

      return str
    })

    // 操作完成后把换行符换回来
    .replace(/\\n/g, '\n')

  return html
}

module.exports = function (markdown) {
  // merge params and default config
  var query = loaderUtils.parseQuery(this.query)
  var configKey = query.config || "markdownLoader"
  var options = assign({}, options, query, this.options[configKey])

  this.cacheable()

  marked.setOptions(options)

  var html = marked(markdown)
  html = wrapMarkdown(html)
  html = wrapDemoCode(html)

  return html
};
