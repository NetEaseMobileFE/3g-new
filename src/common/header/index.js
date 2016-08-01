if (module && module.hot) {
  module.hot.accept()
}
require('./index.css')
export default function header(data) {
  const { type, id } = data
  const page = type ? `${type}=${id}&s=spss` : 's=spss'
  return `
    <header class="g-header">
      <a href="http://m.163.com/newsapp/applinks.html?${page}"></a>
    </header>
  `
}