import analysis from '../common/analysis'
import share from '../common/share'
import lazyload from '../common/lazyload'
import * as utils from '../common/utils'
import abtest from '../common/abtest'
import header from '../common/header'
import testHeader from '../common/test-header'
import more from '../common/more'
import post from '../common/post'
import middleShare from '../common/middle-share'
import popular from '../common/popular'
import modal from '../common/modal'
import footer from '../common/footer'
import testFooter from '../common/test-footer'
import advert from '../common/advert'
import '../common/is-newsapp'
import '../common/is-iframe'

require('../common/reset.css')
require('./index.less')

/* eslint-disable func-names */

if (module && module.hot) {
  module.hot.accept()
}

if (window.NRUM && typeof window.NRUM.mark === 'function') {
  window.NRUM.mark('static_pageload', true)
}

const search = utils.localParam().search
const { docid, boardid } = document.documentElement.dataset

// mapp and sps analysis
analysis({
  spst: 0,
  type: 'article',
  docid
})

lazyload({
  offset: 0,
  throttle: 1000,
  unload: false
})

// common header
const abFlag = abtest()
let headerHtml = ''
let footerHtml = ''
if (+abFlag !== 0) {
  headerHtml = abFlag === 'a' ? testHeader({ docid }) : ''
  footerHtml = abFlag === 'a' ? '' : testFooter({ docid })
} else {
  headerHtml = header({ docid })
  footerHtml = footer({ docid })
}
document.querySelector('.m-body-wrap').insertAdjacentHTML('beforebegin', headerHtml)

// main body
{
  // 视频
  $('.video-holder').on('click', function () {
    const video = $(this).find('video')
    $(this).find('img, .play-icon').hide()
    video.show()
    setTimeout(() => {
      video[0].play()
    }, 10)
  })

  // 正文图片
  {
    const w = document.documentElement.dataset.width
    const containerWidth = Math.floor((w * 6.9) / 7.5)
    $('.js-img').each(function () {
      const { width, height } = this.dataset
      const imgHeight = Math.floor((containerWidth / width) * height)
      this.width = containerWidth
      this.height = imgHeight
    })
  }

  // 查看全文
  {
    const articleContent = document.querySelector('.articleList')
    const mainBody = document.querySelector('#contentHolder')
    if (window.self !== window.top) {
      // 被iframe嵌套，隐藏加载全文
      mainBody.style.maxHeight = 'none'
    } else if (articleContent.offsetHeight > mainBody.offsetHeight) {
      $('#contentHolder').append(more({ origin: 'docid' }))
      const showAllArticle = document.querySelector('.js-all-article')
      showAllArticle.addEventListener('click', function () {
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
        const rate = (item.num * 100) / data.sumnum
        html += `
          <li>
            <div>${i + 1}. ${item.name} </div>
            <div class='bar'><span style='width: ${rate}%'></span></div>
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
  $('.m-body-wrap').on('click', '.type-vote', function (e) {
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
    if (window.NRUM && typeof window.NRUM.mark === 'function') {
      window.NRUM.mark('tieload', true)
    }
    // 获取跟帖
    const replyText = $('.js-reply-link').text()
    const replyCount = replyText ? replyText.split('（')[1].split('）')[0] : 0
    post({
      boardid: replyBoard,
      params: `postid=${docid}&docid=${docid}`,
      votecount: replyCount
    })
  })(boardid, docid)
}

// 中间分享
$('.m-middle-share')[0].innerHTML = middleShare({
  origin: 'docid'
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
  success: (data) => {
    popular('docid', data)
    const news = window.RELATIVE_NEWS.length ? window.RELATIVE_NEWS : data.T1348647909107
    modal(news)
  }
})

// common footer
document.querySelector('.m-body-wrap').insertAdjacentHTML('afterend', footerHtml)

// share component
{
  const spss = search.s || 'newsapp'
  let url = window.location.origin + location.pathname
  let spsw = 2
  let w = +search.w
  if (w) {
    w++
    spsw = w
  }
  url += `?s=newsapp&w=${spsw}`
  share({
    title: document.title,
    desc: document.documentElement.dataset.digest,
    url,
    img: 'http://img6.cache.netease.com/utf8/3g/touch/images/share-logo.png',
    statistics: {
      spst: 0,
      docid,
      spss,
      spsw
    },
    callback: (status) => {
      if (status) {
        $('.fixed-cover-share-dialog').show()
      }
    }
  })
}
