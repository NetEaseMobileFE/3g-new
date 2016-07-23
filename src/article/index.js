if (module && module.hot) {
  module.hot.accept()
}

import share from '../common/share'
import header from '../common/header'
require('./index.scss')
const type = 'article11111'
share({ title: 'title111', desc: 'desc' })
document.querySelector('.m-body-wrap').insertAdjacentHTML('beforeend', header('docid', 'aaaa'))
console.log(type)