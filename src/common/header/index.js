/**
 * 公共头部
 * [article、photo、question、topic、video] 调用
 */

if (module && module.hot) {
  module.hot.accept()
}

require('./index.css')

export default function header(data) {
  let param = ''
  let stat = ''
  for (let item in data) {
    const id = data[item]
    param = id ? `${item}=${id}&s=sps` : 's=sps'
    stat = `o-${item}-header`
  }
  return `
    <header class="g-header u-hide-in-newsapp">
      <a href="http://m.163.com/newsapp/applinks.html?${param}" data-stat="${stat}"></a>
    </header>
  `
}
