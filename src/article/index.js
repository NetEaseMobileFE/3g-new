if (module && module.hot) {
  module.hot.accept()
}
import share from '../common/share'
require('./index.scss')
const type = 'article11111'
share({ title: 'title111', desc: 'desc' })
console.log(type)