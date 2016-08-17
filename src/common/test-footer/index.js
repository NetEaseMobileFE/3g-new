/**
 * 新的打开banner，目前用于文章页ab测试
 */

if (module && module.hot) {
  module.hot.accept()
}

require('./index.less')

export default function testFooter(data) {
  let param = ''
  let stat = ''
  for (let item in data) {
    const id = data[item]
    param = id ? `${item}=${id}&s=sps` : 's=sps'
    stat = `o-${item}-banner-footer`
  }
  const isIos9 = navigator.userAgent.match(/iPhone OS 9/i)

  return `
    <header class="g-banner-footer u-hide-in-newsapp${isIos9 ? ' ios9' : ''}">
      <a href="http://m.163.com/newsapp/applinks.html?${param}" data-stat="${stat}"></a>
    </header>
  `
}
