/**
 * 公共头部
 * [article、photo、question、topic、video] 调用
 */

if (module && module.hot) {
  module.hot.accept()
}

require('./index.css')

export default function header(data) {
  const key = Object.keys(data)[0]
  const id = data[key]
  const param = id ? `${key}=${id}&s=sps` : 's=sps'
  const stat = `o-${key}-banner-footer`

  return `
    <header class="g-header u-hide-in-newsapp">
      <a href="http://m.163.com/newsapp/applinks.html?${param}" data-stat="${stat}"></a>
    </header>
  `
}
