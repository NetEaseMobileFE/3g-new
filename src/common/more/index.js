if (module && module.hot) {
  module.hot.accept()
}
require('./index.less')
export default function more() {
  return `
    <div class="m-more">
      <span class="js-all-article">加载全文</span>
    </div>
  `
}


