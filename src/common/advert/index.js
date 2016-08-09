/*** 广告 ***/

if (module && module.hot) {
  module.hot.accept()
}
require('./index.less')

export default function advert(data) {
  const { url, imgsrc, digest} = data
  return `
    <a href="${url}" class="advert">
      <img src="${imgsrc}">
      <span>${digest}</span>
    </a>
  `
}


