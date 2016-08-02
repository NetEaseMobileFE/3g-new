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
      <a href="http://m.163.com/newsapp/applinks.html?${param}" data-stat="${type}HeaderOpen"></a>
    </header>
  `
}