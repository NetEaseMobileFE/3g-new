if (module && module.hot) {
  module.hot.accept()
}

import analysis from '../common/analysis'
import loading from '../common/loading'
import share from '../common/share'
import * as utils from '../common/utils'
import post from '../common/post'
import middleShare from '../common/middle-share'
import advert from '../common/advert'
import testFooter from '../common/test-footer'
import '../common/is-newsapp'
import '../common/is-iframe'

require('../common/reset.css')
require('./index.less')

const search = utils.localParam().search
const videoid = search.videoid || window.location.href.match(/\/v\/(\w*)\./)[1]

loading()

// mapp and sps analysis
analysis({ 
  spst: 6,
  type: 'article',
  modelid: videoid
})

// main body 
{
  const getUrl = (data) => {
    const newsLink = {
      openVideo(_d) {
        return `http://m.163.com/newsapp/applinks.html?vid=${_d}&s=sps`
      },
      openNewsapp() {
        return 'http://m.163.com/newsapp/applinks.html?s=sps'
      }
    }
    const getNewsLink = (d) => { 
      return newsLink[d.type](d.id)
    }

    return getNewsLink(data)
  }

  const TPL = (() => {
    const myTpl = {
      videoHolder: `
        <div class="video-holder">
          <div class="video-wrap" style="background-image:url(<#=cover#>)">
            <video src="<#=videoUrl#>" type="video/mp4" webkit-playsinline="true" controls=""></video>
            <div class="u-play-btn"></div>
          </div>
          <div class="u-open-tip open-newsapp" data-open="openVideo" data-stat="o-vid-tip">
            打开网易新闻，观看视频体验更加流畅
          </div>
          <div class="video-desc-wrap" style="display:<#=style#>">
            <div class="title-bar">
              <div class="video-title"><#=title#></div>
              <div class="btn arrow-down"></div>
            </div>
            <div class="video-subtitle">
              <span><#=desc#></span>
            </div>
          </div>
        </div>
        <div class="subscibe-wrap">
          <img src="<#=topicImg#>" alt="<#=topicDesc#>">
          <div class="subscibe-title">
            <p><#=topicName#></p>
            <p><#=topicDesc#></p>
          </div>
          <a href="http://m.163.com/newsapp/applinks.html?s=sps&url=http%3A%2F%2Fm.163.com%2Fnewsapp%2Fapplinks.html%3Freaderid%3D<#=tid#>" data-sid="<#=sid#>" class="u-more u-hide-in-newsapp">查看更多</a>
        </div>
      `,
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
      // 视频
      videoBodyContent: (data) => {
        let videoUrl = null
        const sid = data.topicSid
        const holder = $('.js-video-player')
        // const topicDesc = data.topicDesc
        const topicDesc = data.desc
        let style = null
        let tid = ''
        if (data.videoTopic) {
          tid = data.videoTopic.tid || ''
          style = 'block'
        } else {
          style = 'none'
        }
        holder.find('.articleList').hide()
        videoUrl = data.pano_mp4_url ? data.pano_mp4_url : data.mp4_url
        holder.prepend(utils.simpleParse(TPL.videoHolder, {
          videoUrl,
          cover: data.cover,
          title: data.title,
          desc: data.desc,
          topicImg: data.topicImg,
          topicDesc: data.topicDesc,
          topicName: data.topicName,
          tid,
          sid,
          style
        }))
        $('.u-play-btn').on('click', function (e) {
          const video = $(this).parent().find('video')
          video[0].play()
          video.show()
          $(this).hide()
          e.stopPropagation()
        })
        if (topicDesc && topicDesc.length > 34) {
          holder.find('.btn').show()
        }
        holder.find('.btn').on('click', function () {
          if (~this.className.indexOf('rotate')) {
            $('.video-subtitle').css('max-height', '0.8rem')
            $(this).removeClass('rotate')
          } else {
            $('.video-subtitle').css('max-height', 'none')
            $(this).addClass('rotate')
          }
        })
      },

      // 相关视频列表
      videoRecommend: (data) => {
        let html = ''
        if (utils.isOwnEmpty(data.recommend) || !(data.recommend.length > 0)) {
          return
        }
        data.recommend.forEach((item, index) => {
          if (index < 3) {
            let time = utils.timeFormat(item.length)
            const playCount = utils.round(item.playCount)
            let replyHtml = `<div class="comment"><span>${utils.round(item.replyCount)}跟帖</span></div>`
            html += utils.simpleParse(TPL.videoList, {
              videoid: item.vid,
              cover: item.cover,
              time,
              title: item.title,
              topicName: item.topicName,
              playCount,
              replyHtml,
              originImg: '',
              index: index + 1
            })
          }
        })
        document.querySelector('.m-video-recommond').innerHTML = `
            <div class="u-title">相关视频</div>
            <ul class="video-list">${html}</ul>
            <a class="u-more u-hide-in-newsapp" href="http://m.163.com/newsapp/applinks.html?s=sps">查看更多&gt;</a>
          `
      },

      // 热门视频列表
      hotVideoList: () => {
        window.videoCallback = (data) => {
          window.videoCallback = null
          let html = ''
          let lastVideoHtml = ''
          data.VBJ4L28O7.forEach((item, index) => {
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
            $('.m-video-hot')[0].innerHTML = `
              <div class="u-title">热门视频</div>
              <ul class="video-list">${html}</ul>
              <a class="u-more u-hide-in-newsapp" href="http://m.163.com/newsapp/applinks.html?s=sps">查看更多&gt;</a>
            `
            $('.m-video-last').html(lastVideoHtml)
          })
        }
        utils.importJs('http://c.m.163.com/nc/video/list/VBJ4L28O7/n/0-10.html?callback=videoCallback')
      }
    }
    return render
  })($)

  // 打开客户端
  {
    $('.g-body-wrap').on('click', '.open-newsapp', function(e) {
      const _type = this.dataset.open
      window.location.href = getUrl({
        type: _type,
        id: videoid
      })
    })
  }

  utils.ajax({
    method: "GET",
    dataType: 'json',
    url: `http://c.m.163.com/nc/video/detail/${videoid}.html`,
    success: function(data) {
      if (window.NRUM && typeof NRUM.mark === "function") {
        NRUM.mark('videoload', true)
      }
      ArticleRander.videoBodyContent(data)
      ArticleRander.videoRecommend(data)
      // 获取跟帖
      post({ 
        boardid: data.replyBoard, 
        params: `postid=${data.replyid}&vid=${videoid}`,
        votecount: data.replyCount
      })
      $('.m-middle-share').show()
      $('.m-loading').hide()
      // share component
      {
        let title = `【视频】${data.title}`
        title = title.replace(/(&quot;)/g, '"')
        let body = data.desc || title
        body = body.replace(/<.*?>/g, "").replace(/(^\s*)/g, "").substr(0, 30)
        const spss = search.s || 'newsapp'
        let _url = window.location.origin + location.pathname
        let spsw = 2
        let w = +search.w
        if (w) {
          w++
          spsw = w
        }
        _url += `?s=${spss}&w=${spsw}`
        share({
          title: title,
          desc: body,
          url: _url,
          img: data.cover || 'http://img6.cache.netease.com/utf8/3g/touch/images/share-logo.png',
          statistics: {
            spst: 6,
            modelid: videoid,
            spss: spss,
            spsw: spsw
          }
        })
      }
    }
  })

  ArticleRander.hotVideoList()
}

// 中间分享
$('.m-middle-share')[0].innerHTML = middleShare({ origin: 'vid' })

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
document.querySelector('.g-body-wrap').insertAdjacentHTML('afterend', testFooter({
  vid: videoid
}))