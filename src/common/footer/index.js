if (module && module.hot) {
  module.hot.accept()
}
require('./index.less')
export default function footer(data) {
  const { type, id} = data
  const page = type ? `${type}=${id}&s=spss` : 's=spss'
  const isIos9 = navigator.userAgent.match(/iPhone OS 9/i)
  return `
    <footer class="g-footer${isIos9 ? ' ios9' : ''}">
      <a href="http://m.163.com/newsapp/applinks.html?${page}" class="u-open-newsapp" data-stat="6">
        <i class="m-share-home-icon"></i>
        <span>立即打开 &gt;</span>
      </a>
      <div class="m-share" data-stat="7">
        <span class="share">分享</span>
        <a class="share-icon u-weixin" data-type="wx" href="javascript:void(0);"></a>
        <a class="share-icon u-sina" data-type="wb" target="_share" href=""></a>
        <a class="share-icon u-qqzone" data-type="qq" target="_share" href=""></a>
        <a class="share-icon u-yixin" data-type="yx" target="_share" href=""></a>
      </div>
    </footer>
  `
}


