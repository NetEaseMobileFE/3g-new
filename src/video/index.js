if (module && module.hot) {
  module.hot.accept()
}

import analysis from '../common/analysis'
import share from '../common/share'
import * as utils from '../common/utils'
import header from '../common/header'
import post from '../common/post'
import middleShare from '../common/middle-share'
import footer from '../common/footer'

require('../common/reset.css')
require('./index.less')

const search = utils.localParam().search
const videoid = window.location.href.match(/\/v\/(\w*)\./)[1]

// mapp and sps analysis
analysis({ 
  spst: 6,
  type: "article",
  modelid: videoid
})

// common header
document.querySelector('.g-body-wrap').insertAdjacentHTML('beforebegin', header({
  type: 'vid',
  id: videoid
}))

// main body 
{
  const getUrl = (data) => {
    const search = utils.localParam().search
    const newsLink = {
      "openVideo": (data) => {
        const { id } = data
        return `http://m.163.com/newsapp/applinks.html?vid=${id}&s=sps`
      },
      "openNewsapp": (data) => {
        const { id } = data
        return `http://m.163.com/newsapp/applinks.html?s=sps`
      }
    }
    const getNewsLink = (data) => { 
      return newsLink[data.type](data)
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
          <div class="u-open-tip open-newsapp" data-open="openVideo">
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
          <a href="http://m.163.com/newsapp/applinks.html?url=http%3A%2F%2Fm.163.com%2Fnewsapp%2Fapplinks.html%3Freaderid%3D<#=tid#>" data-sid="<#=sid#>" class="u-more">查看更多</a>
        </div>
      `,
      videoList: `
        <li class="single-img">
          <a class="clearfix" href="http://c.m.163.com/news/v/<#=videoid#>.html?from=video">
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
                  <div class="comment"><span><#=replyCount#>跟帖</span></div>
                </div>
              </div>
            </div>
          </a>
        </li>
      `,
      bigVideo: `
        <a class="clearfix" href="http://m.163.com/newsapp/applinks.html?vid=<#=videoid#>&s=sps">
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
        <a class="u-more" href="http://m.163.com/newsapp/applinks.html?s=spss">查看更多&gt;</a>
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
        const search = utils.localParam().search
        const videoid = search.videoid
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
          videoUrl: videoUrl,
          cover: data.cover,
          title: data.title,
          desc: data.desc,
          topicImg: data.topicImg,
          topicDesc: data.topicDesc,
          topicName: data.topicName,
          tid: tid,
          sid: sid,
          style: style
        }))
        holder[0].offsetWidth
        $('.u-play-btn').on('click', function(e) {
          const video = $(this).parent().find('video')
          video[0].play()
          video.show()
          $(this).hide()
          e.stopPropagation()
        })
        if (topicDesc.length > 34) {
          holder.find('.btn').show()
        }
        holder.find('.btn').on('click', function() {
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
        const search = utils.localParam().search
        const installed = search.installed
        const night = search.night
        if (utils.isOwnEmpty(data.recommend) || !(data.recommend.length > 0)) {
          return
        }
        data.recommend.forEach((item, index) => {
          if (index < 3) {
            let time = utils.timeFormat(item.length)
            const playCount = utils.round(item.playCount)
            const replyCount = utils.round(item.replyCount)
            html += utils.simpleParse(TPL.videoList, {
              videoid: item.vid,
              cover: item.cover,
              time: time,
              title: item.title,
              topicName: item.topicName,
              playCount: playCount,
              replyCount: replyCount,
              originImg: '',
              installed: installed,
              night: night
            })
          }
        })
        document.querySelector('.m-video-recommond').innerHTML = `
            <div class="u-title">相关视频</div>
            <ul class="video-list">${html}</ul>
            <a class="u-more" href="http://m.163.com/newsapp/applinks.html?s=spss">查看更多&gt;</a>
          `
      },

      // 热门视频列表
      hotVideoList: () => {
        window.videoCallback = (data) => {
          window.videoCallback = null
          let html = ''
          let lastVideoHtml = ''
          data['VATL2LQO4'].forEach((item, index) => {
            if (index < 3) {
              let time = utils.timeFormat(item.length)
              if (item.title.length > 22) {
                item.title = `${item.title.slice(0, 22)}...`
              }
              if (item.description.length > 15) {
                item.description = `${item.description.slice(0, 15)}...`
              }
              const playCount = utils.round(item.playCount)
              const replyCount = utils.round(item.replyCount)
              const originImg = `<span class="origin-icon" style="background:#828282 url(${item.topicImg});background-size:cover;"></span>`
              html += utils.simpleParse(TPL.videoList, {
                videoid: item.vid,
                cover: item.cover,
                time: time,
                title: item.title,
                topicName: item.topicName,
                playCount: playCount,
                replyCount: replyCount,
                originImg: originImg
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
            $('.m-video-hot .list').html(html)
            $('.js-videos-last').html(lastVideoHtml)
          })
          document.querySelector('.m-video-recommond').insertAdjacentHTML('afterend',`
            <article class="m-video-hot">
              <div class="u-title">热门视频</div>
              <ul class="video-list">${html}</ul>
              <a class="u-more" href="http://m.163.com/newsapp/applinks.html?s=spss">查看更多&gt;</a>
            </article>
            <article class="m-video-last">${lastVideoHtml}</article>
          `)
        }
        utils.importJs('http://c.m.163.com/nc/video/list/VATL2LQO4/n/0-10.html?callback=videoCallback')
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
      post({ boardid: data.replyBoard, id: data.replyid, votecount: data.replyCount})
      $('.m-middle-share').show()
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
$('.m-middle-share')[0].innerHTML = middleShare()

// common footer
document.querySelector('.g-body-wrap').insertAdjacentHTML('afterend', footer({
  type: 'vid',
  id: videoid
}))