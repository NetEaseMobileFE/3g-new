if (module && module.hot) {
  module.hot.accept()
}

require('./index.less')
import { importJs, isIos9 } from '../utils'
export default function post(data) {
  const { boardid, id, votecount, origin } = data

  // 获取跟帖
  importJs(`http://comment.api.163.com/api/json/post/list/new/hot/${boardid}/${id}/0/3/7/3/1?jsoncallback=hotList`)

  window.hotList = (data) => {
    if (data.hotPosts.length) {
      document.querySelector('.m-comment').style.display = 'block'
    } else {
      return
    }
    let html = ''
    window.hotList = null
    if (+data.code !== 1) {
      $('.m-comment').hide()
      $('.m-down-tie').hide()
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

    let a = isIos9 ? `http://m.163.com/newsapp/applinks.html?docid=${id}&s=sps` : `http://m.163.com/newsapp/applinks.html?boardid=${boardid}&docid=${id}&title=${encodeURIComponent(document.title)}`
    document.querySelector('.m-comment').innerHTML = `
      <div class="u-title"> 热门跟贴 </div>
      <div class="comment-list">${html}</div>
      <div class="m-down-tie"><a href="${a}" data-stat="${origin}Post"> 打开网易新闻,查看更多跟贴 <span class="replyCount"> (${votecount})</span></a></div>
    `
  }

}