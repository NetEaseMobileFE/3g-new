// ab测试

if (module && module.hot) {
  module.hot.accept()
}

import { isAndroid, isWeixin, getCookie } from '../common/utils'

export default function abtest() {
  const num = Math.random()
  const _ntes_nuid = getCookie('_ntes_nuid') || ''
  let test = localStorage.getItem('_banner_test') || ''

  if (test.slice(0, -1) == _ntes_nuid) {
    return test.slice(-1, test.length)
  } else {
    if (isAndroid && isWeixin && num < 0.5) {
      const flag = num < 0.25 ? 'a' : 'b'
      localStorage.setItem('_banner_test', _ntes_nuid + flag)
    } else {
      localStorage.setItem('_banner_test', _ntes_nuid + '0')
    }
    return '0'  // 新用户进来显示默认样式
  }
}
