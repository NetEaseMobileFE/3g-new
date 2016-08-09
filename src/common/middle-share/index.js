/**
 * 中间分享
 * [article、photo、video] 调用
 */

if (module && module.hot) {
  module.hot.accept()
}
require('./index.less')
export default function middleShare(data) {
  const { origin } = data
  return `
    <div class="ui-title">
      分享
    </div>
    <div class="share-list" data-stat="${origin}MiddleShare">
      <a class="share-icon u-weixin" data-type="wx" href="javascript:void(0);">微信</a>
      <a class="share-icon u-sina" data-type="wb" target="_share" href="">微博</a>
      <a class="share-icon u-qqzone" data-type="qq" target="_share" href="">QQ空间</a>
      <a class="share-icon u-yixin" data-type="yx" target="_share" href="">易信</a>
    </div>
  `
}


