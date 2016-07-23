if (module && module.hot) {
  module.hot.accept()
}
require('./index.less')
export default function footer(type, id) {
  const page = type ? `${type}=${id}&s=spss` : 's=spss'
  return `
    <footer class="m-footer">
      <a href="http://m.163.com/newsapp/applinks.html?${page}" class="open-newsapp" data-stat="6">
        <i class="m-share-home-icon"></i>
        <span>立即打开 &gt;</span>
      </a>
      <div class="share-wrap">
        <div class="share-wrap-list" data-stat="7">
          <span class="share">分享</span>
          <a class="wapShareLink wapShareLink_weixin" data-type="wx" href="javascript:void(0);"></a>
          <a class="wapShareLink wapShareLink_sina" data-type="wb" target="_share" href=""></a>
          <a class="wapShareLink wapShareLink_qqzone" data-type="qq" target="_share" href=""></a>
          <a class="wapShareLink wapShareLink_yixin" data-type="yx" target="_share" href=""></a>
        </div>
      </div>
    </footer>
  `
}


