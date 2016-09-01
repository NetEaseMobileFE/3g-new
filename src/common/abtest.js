// ab测试
import { isAndroid, isWeixin, getCookie } from '../common/utils'

if (module && module.hot) {
  module.hot.accept()
}

export default function abtest() {
  const num = Math.random()
  const ntesNuid = getCookie('_ntes_nuid') || ''
  let test = localStorage.getItem('_banner_test') || ''

  if (test.slice(0, -1) === ntesNuid) {
    return test.slice(-1, test.length)
  } else {
    if (isAndroid && isWeixin && num < 0.5) {
      const flag = num < 0.25 ? 'a' : 'b'
      localStorage.setItem('_banner_test', ntesNuid + flag)
    } else {
      localStorage.setItem('_banner_test', ntesNuid + '0')
    }
    return '0'  // 新用户进来显示默认样式
  }
}
