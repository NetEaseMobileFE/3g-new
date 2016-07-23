if (module && module.hot) {
  module.hot.accept()
}
require('./index.css')
export default function analysis() {
  // params () => {
  //   const url = window.location.href

  // }
  const url = window.location.href
  const start = url.indexOf("?") + 1
  console.log(start)
}


