/**
 * 红包测试
 * [photo] 调用
 */
import { isWeixin, isAndroid } from '../utils'

require('./index.less')

if (module && module.hot) {
  module.hot.accept()
}

export default function redpacket() {
  if (isAndroid && isWeixin) {
    document.querySelector('.m-body-wrap').insertAdjacentHTML('afterend', `
      <section class="redpacket-test">
        <div class="fix-repacket" data-stat="redpacket"></div>
        <div class="redpacket-modal">
          <div class="modal-wrap" data-stat="modal">
            <div class="close"></div>
          </div>
        </div>
      </section>
    `)
    const redPacket = document.querySelector('.fix-repacket')
    const modal = document.querySelector('.redpacket-modal')
    redPacket.addEventListener('click', () => {
      modal.style.display = 'block'
    })
    document.querySelector('.modal-wrap').addEventListener('click', (e) => {
      if (e.target.className === 'close') {
        modal.style.display = 'none'
      } else {
        window.location.href = 'http://campaign.app.qq.com/dom/npsb/jump.jsp?pkgName=com.netease.newsreader.activity&ckey=CK1340386015772'
      }
    })
  } else {
    return
  }
}
