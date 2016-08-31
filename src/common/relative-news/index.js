/**
 * 相关新闻
 * [article、photo] 调用
 */
import { optImage } from '../utils'

require('./index.less')

if (module && module.hot) {
  module.hot.accept()
}

export default function relativeNews(data) {
  let html = ''
  data.forEach((item, index) => {
    if (index < 3) {
      html += `
        <li class="single-img">
          <a href="http://c.m.163.com/news/a/${item.docID}.html?form=relative${index}">
            <div class="news-img" style="background:url(${optImage(item.imgsrc, 160, 120)}) no-repeat center"></div>
            <div class="news-wrap">
              <div class="news-title">${item.title}</div>
            </div>
          </a>
        </li>
      `
    }
  })
  return `<div class="u-title">相关新闻</div><ul class="news-list">${html}</ul>`
}
