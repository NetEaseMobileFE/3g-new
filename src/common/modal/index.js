/**
 * 分享成功后弹框
 * [article] 调用
 */

if (module && module.hot) {
  module.hot.accept()
}

require('./index.less')

export default function modal(data) {
  if (!data.T1348647909107 && !data.T1348647909107.length > 0) {
    console.error('Have not any hot news')
  }
  let { normalNews } = data.reduce((pre, data) => {
    const { normalNews } = pre
    const n = isNormalNews(data)
    n && normalNews.push(n)
    return { normalNews }
  }, { normalNews: [] })

  let html = ''
  const len = normalNews.length > 3 ? 3 : normalNews.length
  for (let i = 0; i < len; i++) {
    const item = normalNews.splice(random(normalNews.length), 1)[0]
    html += `
      <li><a href="http://c.m.163.com/news/a/${item.id}.html?f=share_dialog"><div class="news-title">${item.title}</div></a></li>
    `
  }

  document.querySelector('.m-body-wrap').insertAdjacentHTML('afterend', `
    <div class="fixed-cover-share-dialog">
      <div class="dailog">
        <div class="dialog-title">分享成功<span class="dialog-close"></span></div>
        <h2>相关推荐</h2>
        <ul class="hot-news" style="display:block !important;" data-stat="dialog-newslist">${html}</ul>
        <a class="dialog-more" data-stat="dialog-more">查看更多</a>
      </div>
    </div>
  `)

  function isNormalNews(data) {
    const id = data.docid || data.docID
    if (id && id.length === 16 && !data.skipType) {
      const result = {
        title: data.title,
        id
      }
      return result
    }
  }

  function random(number) {
    return Math.floor(Math.random() * number)
  }

  const dialog = $('.fixed-cover-share-dialog')
  dialog.click((e) => {
    const target = e.target
    if (target === dialog[0] || target.classList.contains('dialog-close')) {
      dialog.hide()
    }
    if (target.classList.contains('news-title')) {
      window.neteaseTracker && window.neteaseTracker(false, 'http://sps.163.com/func/?func=clickStat&spst=0&docid=' + target.href.match(/\/([A-Z0-9]{16})/)[1] + '&target=dailog_news', '', 'sps')
    }
    if (target.classList.contains('dialog-more')) {
      window.neteaseTracker && window.neteaseTracker(false, 'http://sps.163.com/func/?func=clickStat&spst=0&target=dailog_more', '', 'sps')
      window.location.href = 'http://m.163.com/newsapp/applinks.html?from=share_dailog&s=sps'
    }
  })
  dialog.on('touchmove', (e) => {
    e.preventDefault()
  })
}
