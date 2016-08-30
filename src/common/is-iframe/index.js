if (module && module.hot) {
  module.hot.accept()
}

require('./index.less')

if (window.top !== window.self) {
  document.body.classList.add('is-iframe')
}
