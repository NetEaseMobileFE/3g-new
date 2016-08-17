/**
 * 红包测试
 * [photo] 调用
 */

if (module && module.hot) {
  module.hot.accept()
}

import { getCookie, isWeixin, isAndroid } from '../utils'
require('./index.less')

export default function redpacket() {
  document.querySelector('.redpacket-test').innerHTML = `
    <div class="fix-repacket" data-stat="redpacket"></div>
    <div class="redpacket-modal">
      <div class="modal-wrap" data-stat="modal">
        <div class="close"></div>
      </div>
    </div>
  `
  const _ntes_nuid = getCookie('_ntes_nuid') || ''
  let test = localStorage.getItem('_redpacket_test') || ''

  if (test.slice(0, -1) == _ntes_nuid) {
    if (test.slice(-1, test.length) == '1') {
      const redpacket = document.querySelector('.fix-repacket')
      const modal = document.querySelector('.redpacket-modal')
      redpacket.style.display = 'block'
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
    }
  } else {
    if (isAndroid && isWeixin && Math.random() < 0.3) {
      localStorage.setItem('_redpacket_test', _ntes_nuid + '1')
    } else {
      localStorage.setItem('_redpacket_test', _ntes_nuid + '0')
    }
  }
}
