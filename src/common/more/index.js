/**
 * 加载全文遮罩层
 * [article、photo] 调用
 */

require('./index.less')

if (module && module.hot) {
  module.hot.accept()
}

export default function more(data) {
  const { origin } = data
  return `
    <div class="m-more" data-stat="${origin}-all">
      <span class="js-all-article">加载全文</span>
    </div>
  `
}
