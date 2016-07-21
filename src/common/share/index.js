if (module && module.hot) {
  module.hot.accept()
}
require('./index.css')
export default function share(args) {
  console.log('share', ...args)
}