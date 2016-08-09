if (module && module.hot) {
  module.hot.accept()
}
import { isNewsapp } from '../utils'
require('./index.less')
if (isNewsapp) {
  document.body.classList.add('is-newsapp')
}
