if (module && module.hot) {
  module.hot.accept()
}

{
  if (window.NRUM && typeof NRUM.mark === "function") {
    NRUM.mark('static_pageload', true)
  }
}

import analysis from '../common/analysis'
import * as utils from '../common/utils'
import header from '../common/header'
import more from '../common/more'
import post from '../common/post'
import popular from '../common/popular'
import share from '../common/share'
import model from '../common/model'
import footer from '../common/footer'

require('../common/reset.css')
require('./index.less')

const search = utils.localParam().search
const docid = window.location.href.match(/\/a\/(\w*)\./)[1]

// mapp and sps analysis
analysis({ 
  spst: 0,
  type: "article",
  docid: docid
})

// common header
document.querySelector('.m-body-wrap').insertAdjacentHTML('beforebegin', header({
  type: 'docid',
  id: docid
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
      const { width, height, echo } = this.dataset
      const imgHeight = Math.floor(containerWidth / width * height)
      const src = utils.optImage(echo, 690)
      this.width = containerWidth
      this.height = imgHeight
      this.dataset.echo = src
    })
  }

  // 查看全文
  {
    const articleContent = document.querySelector('.articleList')
    const mainBody = document.querySelector('#contentHolder')

    if (articleContent.offsetHeight > mainBody.offsetHeight) {
      $(mainBody).append(more())

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
  const search = utils.localParam().search
  const { docid, boardid } = document.documentElement.dataset

  // 打开客户端逻辑
  {
    const ua = navigator.userAgent
    const applink = `http://m.163.com/newsapp/applinks.html?docid=${docid}&s=sps`
    setTimeout(function() {
      // 判断safari 且不是易信 且参数no不等于1， 则打开客户端
      if (ua.match(/IOS/ig) && ua.match(/safari/ig) && ua.match(/safari/ig) && !ua.match(/baidu/ig) && !ua.match(/yixin/ig) && +search['no'] !== 1) {
        $('#iframe').src = applink
      }
      // 判断URL中含有&o=1时，打开客户端
      if (+search['o'] === 1) {
        $('#iframe').src = applink
      }
    }, 1000)
  }

  // 跟帖
  ((replyBoard, docid) => {
    if (!replyBoard) {
      return
    }
    if (window.NRUM && typeof NRUM.mark === "function") {
      NRUM.mark('tieload', true)
    }
    // 获取跟帖
    const replyCount = $('.js-reply-link').text().split('（')[1].split('）')[0] || 0
    post({ boardid: replyBoard, id: docid, votecount: replyCount})
  })(boardid, docid)
}

// hotNews videoNews shareNews
utils.ajax({
  method: "GET",
  dataType: 'json',
  url: 'http://c.m.163.com/nc/article/list/T1348647909107/0-40.html',
  success: function(data) {
    popular('article', data)
    model(data)
  }
})

// common footer
document.querySelector('.m-body-wrap').insertAdjacentHTML('afterend', footer({
  type: 'docid',
  id: docid
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
