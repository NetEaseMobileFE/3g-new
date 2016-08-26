/**
 * 红包测试
 * [article] 调用
 */

if (module && module.hot) {
  module.hot.accept()
}

import { isWeixin, isAndroid } from '../utils'
require('./index.less')

export default function testRedpacket() {
  if (isAndroid && isWeixin && Math.random() < 0.2) {
    document.querySelector('.m-body-wrap').insertAdjacentHTML('afterend', `
      <section class="redpacket-test">
        <div class="fix-repacket" data-stat="article-redpacket"></div>
        <div class="redpacket-modal">
          <div class="modal-wrap" data-stat="article-modal">
            <div class="close" data-stat="redpacket-close"></div>
          </div>
        </div>
      </section>
    `)

    const redpacket = document.querySelector('.fix-repacket')
    const modal = document.querySelector('.redpacket-modal')
    redpacket.addEventListener('click', function(){
      modal.style.display = 'block'
    })
    document.querySelector('.modal-wrap').addEventListener('click', function(e) {
      if (e.target.className == 'close') {
        modal.style.display = 'none'
      } else {
        window.location.href = 'http://campaign.app.qq.com/dom/npsb/jump.jsp?pkgName=com.netease.newsreader.activity&ckey=CK1340386015772'
      }
    })
  } else {
    return
  }
}
