"use strict";

var marked = require("marked");
var loaderUtils = require("loader-utils");
var assign = require("object-assign");

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
  return '<div class="markdown">' + html + '</div>';
}

module.exports = function (markdown) {
  // merge params and default config
  var query = loaderUtils.parseQuery(this.query);
  var configKey = query.config || "markdownLoader";
  var options = assign({}, options, query, this.options[configKey]);

  this.cacheable();

  marked.setOptions(options);

  var html = marked(markdown);
  html = wrapMarkdown(html);

  return html;
};
