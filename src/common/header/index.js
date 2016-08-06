/**
 * 公共头部
 * [article、photo、question、topic、video] 调用
 */

if (module && module.hot) {
  module.hot.accept()
}
require('./index.css')
export default function header(data) {
  const { type } = data
  let param = ''
  for (let item in data) {
    if (item != 'type') {
      const id = data[item]
      param = id ? `${item}=${id}&s=sps` : 's=sps'
    }
  }
  return `
    <header class="g-header">
      <a href="http://m.163.com/newsapp/applinks.html?${param}" data-stat="O_${type}HeaderOpen"></a>
    </header>
  `
}