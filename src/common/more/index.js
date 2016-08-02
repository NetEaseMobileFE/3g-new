if (module && module.hot) {
  module.hot.accept()
}
require('./index.less')
export default function more(data) {
  const { origin } = data
  return `
    <div class="m-more" data-stat="${origin}LoadMore">
      <span class="js-all-article">加载全文</span>
    </div>
  `
}


