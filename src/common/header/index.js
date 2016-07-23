if (module && module.hot) {
  module.hot.accept()
}
require('./index.css')
export default function header(type, id) {
  const page = type ? `${type}=${id}&s=spss` : 's=spss'
  return `
    <header class="m-header">
      <a href="http://m.163.com/newsapp/applinks.html?${page}" class="open-newsapp"></a>
    </header>
  `
}