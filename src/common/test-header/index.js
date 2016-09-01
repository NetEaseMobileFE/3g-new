/**
 * 新的打开banner，目前用于文章页ab测试
 */

if (module && module.hot) {
  module.hot.accept()
}

require('./index.less')

export default function testHeadder(data) {
  const key = Object.keys(data)[0]
  const id = data[key]
  const param = id ? `${key}=${id}&s=sps` : 's=sps'
  const stat = `o-${key}-banner-footer`
  const isIos9 = navigator.userAgent.match(/iPhone OS 9/i)

  return `
    <header class="g-banner-header u-hide-in-newsapp${isIos9 ? ' ios9' : ''}">
      <a href="http://m.163.com/newsapp/applinks.html?${param}" data-stat="${stat}"></a>
    </header>
    <p class="u-height"></p>
  `
}
