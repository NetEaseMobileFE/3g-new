/**
 * 跟帖
 * [article、photo、video] 调用
 */

if (module && module.hot) {
  module.hot.accept()
}

require('./index.less')
import { importJs, isIos9, isNewsapp } from '../utils'
export default function post(data) {
  const { boardid, params, votecount } = data
  const param = params.split('&')
  const id = param[0].split('=')[1]
  const stat = param[1].split('=')[0]

  // 获取跟帖
  importJs(`http://comment.api.163.com/api/json/post/list/new/hot/${boardid}/${id}/0/3/7/3/1?jsoncallback=hotList`)

  window.hotList = (data) => {
    window.hotList = null
    if (data.hotPosts.length) {
      document.querySelector('.m-comment').style.display = 'block'
    } else {
      return
    }
    let html = ''
    if (+data.code !== 1) {
      $('.m-comment').hide()
      return
    }
    const posts = data["hotPosts"]
    posts.forEach((_item) => {
      let i = 1
      let item = null
      while (_item[i]) {
        item = _item[i]
        i++
      }
      let classList = ''
      let username = ''
      let p = ''
      const names = item.f.trim().replace('：', '').split('&nbsp;')
      if (names.length > 1) {
        username = names[1]
        p = `<p>${names[0]}[${username}]</p>`
      } else {
        p = `<p>${names[0]}</p>`
      }
      const content = item.b
      html += `
      <div class="u-item">
        <div class="item-title">
          <div class="avatar"></div>
          <div class="name">${p}</div>
          <div class="ding">${item.v || 0}顶</div>
        </div>
        <div class="comment-content">${content}</div>
      </div>`
    })

    let a = `http://m.163.com/newsapp/applinks.html?boardid=${boardid}&${params}&title=${encodeURIComponent(document.title)}&s=sps`
    let more = isNewsapp ? '' : `<div class="m-down-tie u-hide-in-newsapp"><a href="${a}" data-stat="o-${stat}-post"> 打开网易新闻,查看更多跟贴 <span class="replyCount"> (${votecount})</span></a></div>`

    document.querySelector('.m-comment').innerHTML = `
      <div class="u-title"> 热门跟贴 </div>
      <div class="comment-list">${html}</div>
      ${more}
    `
  }

}
