/**
 * loading
 * [photo、question、topic、video、special] 调用
 */
require('./index.less')

if (module && module.hot) {
  module.hot.accept()
}

export default function loading() {
  document.querySelector('.m-loading').innerHTML = '<div class="loading"></div>'
}
