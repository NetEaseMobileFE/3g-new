/**
 * loading
 * [photo、question、topic、video、special] 调用
 */

if (module && module.hot) {
  module.hot.accept()
}
require('./index.less')
export default function loading() {
  document.querySelector('.m-loading').innerHTML = '<div class="loading"></div>'
}


