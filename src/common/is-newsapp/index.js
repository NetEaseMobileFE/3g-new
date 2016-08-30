import { isNewsapp } from '../utils'

require('./index.less')

if (module && module.hot) {
  module.hot.accept()
}

if (isNewsapp) {
  document.body.classList.add('is-newsapp')
}
