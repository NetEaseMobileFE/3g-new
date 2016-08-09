if (module && module.hot) {
  module.hot.accept()
}

{
  if (window.NRUM && typeof NRUM.mark === "function") {
    NRUM.mark('static_pageload', true)
  }
}

import analysis from '../common/analysis'
import share from '../common/share'
import lazyload from '../common/lazyload'
import * as utils from '../common/utils'
import header from '../common/header'
import more from '../common/more'
import post from '../common/post'
import middleShare from '../common/middle-share'
import popular from '../common/popular'
import modal from '../common/modal'
import footer from '../common/footer'
import advert from '../common/advert'

require('../common/reset.css')
require('./index.less')

const search = utils.localParam().search
const { docid, boardid } = document.documentElement.dataset

// mapp and sps analysis
analysis({
  spst: 0,
  type: "article",
  docid: docid
})
lazyload({
  offset: 0,
  throttle: 1000,
  unload: false
})

// common header
document.querySelector('.m-body-wrap').insertAdjacentHTML('beforebegin', header({
  type: 'article',
  docid: docid
}))

// main body
{
  // 视频
  $('.video-holder').on('click', '.play-icon', function() {
    const video = $(this).parent().find('video')
    video.width('100%')
    video.height('100%')
    video[0].play()
  })

  // 正文图片
  {
    const width = document.documentElement.dataset.width
    const containerWidth = Math.floor(width * 6.9 / 7.5)
    $('.js-img').each(function(i) {
      const { width, height } = this.dataset
      const imgHeight = Math.floor(containerWidth / width * height)
      this.width = containerWidth
      this.height = imgHeight
    })
  }

  // 查看全文
  {
    const articleContent = document.querySelector('.articleList')
    const mainBody = document.querySelector('#contentHolder')

    if (articleContent.offsetHeight > mainBody.offsetHeight) {
      $('#contentHolder').append(more({ origin: 'article'} ))

      const showAllArticle = document.querySelector('.js-all-article')
      showAllArticle.addEventListener('click', function(){
        mainBody.style.maxHeight = 'none'
        this.parentElement.style.display = 'none'
      })
    }
  }

  // 投票
  const voteResult = (dom, voteid) => {
    $.getJSON(`http://c.m.163.com/nc/vote/result/${voteid}.html`, (data) => {
      let html = ''
      data.voteitem.forEach((item, i) => {
        const rate = item.num * 100 / data.sumnum
        html += `
          <li>
            <div>${i + 1}. ${item.name} </div>
            <div class="bar"><span style="width: ${rate}%"></span></div>
          </li>
        `
      })

      $(dom).find('ol').attr('class', 'voted').html(html)
      setTimeout(() => {
        $(dom).find('.voted').addClass('show')
      }, 100)
    })
  }
  // 投票事件
  $('.m-body-wrap').on('click', '.type-vote', function(e) {
    const target = $(e.target)
    const voteid = $(this).data('voteid')
    const voteType = $(this).data('optiontype')
    const voteLi = $(this).find('li')
    const voteActive = $(this).find('li.active')

    let options = ''
    if (target.hasClass('submit')) {
      if (voteActive.length === 0 || voteActive.length === voteLi.length) {
        return
      }
      voteActive.forEach((item) => {
        options += `${item.dataset.id},`
      })
      options = options.slice(0, -1)
      utils.importJs(`http://vote.3g.163.com/vote2/mobileVote.do?vote${voteid}=${options}&votedId=${voteid}`)
      voteResult($(this), voteid)
      target.hide()
    }
    if (e.target.tagName.toUpperCase() === 'LI') {
      if (+voteType) {
        target.toggleClass('active')
      } else {
        $(e.target).removeClass('active')
        target.addClass('active')
        utils.importJs(`http://vote.3g.163.com/vote2/mobileVote.do?vote${voteid}=${options}&votedId=${voteid}`)
        voteResult($(this), voteid)
      }
    }
  })

  // 跟帖
  ;((replyBoard, docid) => {
    if (!replyBoard) {
      return
    }
    if (window.NRUM && typeof NRUM.mark === "function") {
      NRUM.mark('tieload', true)
    }
    // 获取跟帖
    const replyCount = $('.js-reply-link').text().split('（')[1].split('）')[0] || 0
    post({
      boardid: replyBoard,
      id: docid,
      votecount: replyCount,
      origin: 'article'
    })
  })(boardid, docid)
}

// 中间分享
$('.m-middle-share')[0].innerHTML = middleShare({
  origin: 'article'
})

// 广告
utils.importJs('http://3g.163.com/touch/advertise/adlist/00340BNC/0-1.html')
window.newAdvertiseList00340BNC = (data) => {
  window.newAdvertiseList00340BNC = null
  if (!data || !data['00340BNC'] || !data['00340BNC'].length) {
    return
  }
  const ad = data['00340BNC'][0]
  $('.js-ad').html(advert(ad))
}

// hotNews videoNews shareNews
utils.ajax({
  method: 'GET',
  dataType: 'json',
  url: 'http://c.m.163.com/nc/article/list/T1348647909107/0-40.html',
  success: function(data) {
    popular('article', data)
    const news = window.RELATIVE_NEWS.length ? window.RELATIVE_NEWS : data['T1348647909107']
    modal(news)
  }
})

// common footer
document.querySelector('.m-body-wrap').insertAdjacentHTML('afterend', footer({
  type: 'article',
  docid: docid
}))

// share component
{
  const spss = search.s || 'newsapp'
  let _url = window.location.origin + location.pathname
  let spsw = 2
  let w = +search.w
  if (w) {
    w++
    spsw = w
  }
  _url += `?s=newsapp&w=${spsw}`
  share({
    title: document.title,
    desc: document.documentElement.dataset.digest,
    url: _url,
    img: 'http://img6.cache.netease.com/utf8/3g/touch/images/share-logo.png',
    statistics: {
      spst: 0,
      docid: docid,
      spss: spss,
      spsw: spsw
    },
    callback: function(status) {
      if (status) {
        $('.fixed-cover-share-dialog').show()
      }
    }
  })
}
