import analysis from '../common/analysis'
import share from '../common/share'
import * as utils from '../common/utils'
import post from '../common/post'
import advert from '../common/advert'
import footer from '../common/footer'
import '../common/is-newsapp'
import '../common/is-iframe'

require('../common/reset.css')
require('./index.less')

if (module && module.hot) {
  module.hot.accept()
}

const search = utils.localParam().search
const videoid = search.videoid || window.location.href.match(/\/v\/(\w*)\./)[1]

// 视频播放
document.querySelector('.js-video').addEventListener('click', (e) => {
  e.preventDefault()
  const target = e.currentTarget
  if (target.classList.contains('playing')) {
    return
  }
  target.classList.add('playing')
  setTimeout(() => {
    target.querySelector('video').play()
  }, 0)
}, false)

// 分享
{
  const title = `【视频】${document.title}`
  const desc = document.querySelector('.video-subtitle').textContent || title
  const img = document.querySelector('.js-video img').src || 'http://img6.cache.netease.com/utf8/3g/touch/images/share-logo.png'
  const spss = search.s || 'sps'
  let spsw = +search.w || 1
  spsw++
  let url = window.location.origin + window.location.pathname
  url += `?s=${spss}&w=${spsw}`
  share({ title,
    desc,
    url,
    img,
    statistics: {
      spst: 6,
      modelid: videoid,
      spss,
      spsw
    }
  })
}

// 获取跟帖
{
  const { board, reply, count } = document.documentElement.dataset
  post({
    boardid: board,
    params: `postid=${reply}&vid=${videoid}`,
    votecount: count
  })
}
// mapp and sps analysis
analysis({
  spst: 6,
  type: 'article',
  modelid: videoid
})

// 相关视频列表
{
  // 视频item
  function template(item, index) {
    const comment = item.replyCount ? `<div class="comment"><span>${utils.round(item.replyCount)}跟帖</span></div>` : ''
    return `
      <li class="single-img">
        <a class="clearfix" href="http://c.m.163.com/news/v/${item.vid}.html?from=video${index}" data-stat="video${index}">
          <div class="cover">
            <img src="${item.cover}" />
            <span class="u-video-time">${utils.timeFormat(item.length)}</span>
          </div>
          <div class="news-wrap">
            <div class="news-title">${item.title}</div>
            <div class="news-subtitle">
              <div>
                <span class="origin-text">${item.topicName}</span>
              </div>
              <div class="visitor-wrap">
                <span class="view">${utils.round(item.playCount)}</span>
                ${comment}
              </div>
            </div>
          </div>
        </a>
      </li>
    `
  }
  function renderRecommand(data) {
    if (utils.isOwnEmpty(data)) {
      document.querySelector('.m-video-recommond').style.display = 'none'
      return
    }
    const html = data.slice(0, 3).map((item, index) => template(item, index)).join('')
    document.querySelector('.m-video-recommond').innerHTML = `
      <div class="u-title">相关视频</div>
      <ul class="video-list">${html}</ul>
      <a class="u-more u-hide-in-newsapp" href="http://m.163.com/newsapp/applinks.html?s=sps">查看更多&gt;</a>
    `
  }
  renderRecommand(window.RECOMMEND_VIDEOS)
  window.RECOMMEND_VIDEOS = null

  // 热门视频
  utils.ajax({
    url: 'http://c.m.163.com/nc/video/list/VATL2LQO4/n/0-4.html',
    dataType: 'JSON',
    success: (data) => {
      const hot = document.querySelector('.m-video-hot')
      if (!data || !data.VATL2LQO4 || !data.VATL2LQO4.length) {
        hot.style.display = 'none'
        return
      }

      const html = data.VATL2LQO4.map((item, index) => template(item, index)).join('')
      hot.innerHTML = `
        <div class="u-title">热门视频</div>
        <ul class="video-list">${html}</ul>
        <a class="u-more u-hide-in-newsapp" href="http://m.163.com/newsapp/applinks.html?s=sps">查看更多&gt;</a>
      `
    }
  })
}

// main body
{
  const TPL = (() => {
    const myTpl = {
      videoList: `
        <li class="single-img">
          <a class="clearfix" href="http://c.m.163.com/news/v/<#=videoid#>.html?from=video<#=index#>" data-stat="video<#=index#>">
            <div class="cover">
              <img src="<#=cover#>" />
              <span class="u-video-time"><#=time#></span>
            </div>
            <div class="news-wrap">
              <div class="news-title"><#=title#></div>
              <div class="news-subtitle">
                <div>
                  <#=originImg#>
                  <span class="origin-text"><#=topicName#></span>
                </div>
                <div class="visitor-wrap">
                  <span class="view"><#=playCount#></span>
                  <#=replyHtml#>
                </div>
              </div>
            </div>
          </a>
        </li>
      `,
      bigVideo: `
        <a class="clearfix" href="http://m.163.com/newsapp/applinks.html?vid=<#=videoid#>&s=sps" data-stat="video7">
          <div class="news-wrap">
            <div class="news-title"><#=title#></div>
            <div class="news-subtitle"><#=description#></div>
          </div>
          <div class="cover">
            <img src="<#=cover#>">
            <span class="u-video-icon"></span>
            <span class="u-tip-icon">打开网易新闻</span>
          </div>
        </a>
        <a class="u-more u-hide-in-newsapp" href="http://m.163.com/newsapp/applinks.html?s=sps">查看更多&gt;</a>
      `
    }
    return myTpl
  })()

  const ArticleRander = (($) => {
    const render = {
      // 热门视频列表
      hotVideoList: () => {
        window.videoCallback = (data) => {
          window.videoCallback = null
          let html = ''
          let lastVideoHtml = ''
          data.VATL2LQO4.forEach((item, index) => {
            if (index < 3) {
              let time = utils.timeFormat(item.length)
              if (item.title.length > 22) {
                item.title = `${item.title.slice(0, 22)}...`
              }
              if (item.description.length > 15) {
                item.description = `${item.description.slice(0, 15)}...`
              }
              const playCount = utils.round(item.playCount)
              let replyHtml = utils.isOwnEmpty(item.replyCount) ? "" : `<div class="comment"><span>${utils.round(item.replyCount)}跟帖</span></div>`
              const originImg = `<span class="origin-icon" style="background:#828282 url(${item.topicImg});background-size:cover;"></span>`
              html += utils.simpleParse(TPL.videoList, {
                videoid: item.vid,
                cover: item.cover,
                time: time,
                title: item.title,
                topicName: item.topicName,
                playCount: playCount,
                replyHtml: replyHtml,
                originImg: originImg,
                index: index + 4
              })
            }
            if (index == 4) {
              const _url = ''
              lastVideoHtml += utils.simpleParse(TPL.bigVideo, {
                videoid: item.vid,
                cover: item.cover,
                title: item.title,
                description: item.description
              })
            }
            // $('.m-video-hot')[0].innerHTML = `
            //   <div class="u-title">热门视频</div>
            //   <ul class="video-list">${html}</ul>
            //   <a class="u-more u-hide-in-newsapp" href="http://m.163.com/newsapp/applinks.html?s=sps">查看更多&gt;</a>
            // `
            $('.m-video-last').html(lastVideoHtml)
          })
        }
        utils.importJs('http://c.m.163.com/nc/video/list/VATL2LQO4/n/0-10.html?callback=videoCallback')
      }
    }
    return render
  })($)
}


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

// common footer
document.querySelector('.g-body-wrap').insertAdjacentHTML('afterend', footer({
  vid: videoid
}))
