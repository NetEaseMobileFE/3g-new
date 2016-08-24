/**
 * 热门新闻和视频列表
 * [article、photo] 调用
 */

if (module && module.hot) {
  module.hot.accept()
}

require('./index.less')
import { importJs, optImage, ajax, round } from '../utils'

export default function popular(_type, _data) {
  const getUrl = (data) => {
    /*******************************
    doc: 获取普通文章链接，ios9下唤醒到客户端
    photoset: 获取图集链接，ios9下唤醒客户端
    video: 获取视频链接，ios9下唤醒客户端
    bigVideo: 获取底部大视频链接，ios9唤醒客户端，安卓微信下取微下载链接
    ********************************/
    const isIos9 = navigator.userAgent.match(/iPhone OS 9/i)
    const newsLink = {
      "doc": (data) => {
        const { id, source } = data
        let url = `http://c.m.163.com/news/a/${id}.html?from=${source}`
        if(!!isIos9) {
          url = `http://m.163.com/newsapp/applinks.html?docid=${id}&redirect=${encodeURIComponent(url)}&s=sps`
        }
        return url
      },
      "photoset": (data) => {
        const { channelId, setId, source } = data
        let url = `http://c.m.163.com/news/p/${channelId}/${setId}.html?from=${source}`
        if(!!isIos9) {
          url = `http://m.163.com/newsapp/applinks.html?pid=${channelId}_${setId}&redirect=${encodeURIComponent(url)}&s=sps`
        }
        return url
      },
      "video": (data) => {
        const { id, source } = data
        let url = `http://c.m.163.com/news/v/${id}.html?from=${source}`
        if(!!isIos9) {
          url = `http://m.163.com/newsapp/applinks.html?vid=${id}&redirect=${encodeURIComponent(url)}&s=sps`
        }
        return url
      },
      "bigVideo": (data) => {
        const { id } = data
        let url = `http://m.163.com/newsapp/applinks.html?vid=${id}&s=sps`
        return url
      }
    }
    const getNewsLink = (data) => {
      return newsLink[data.type](data)
    }

    return getNewsLink(data)
  }

  // 热门新闻
  {
    function loadNews (callback) {
      setTimeout(function(){
        hotNews(_data)
        callback()
      }, 200)
    }

    loadNews(function() {
      ajax({
        method: "GET",
        dataType: 'json',
        url: 'http://c.m.163.com/nc/video/list/VBJ4L28O7/n/0-10.html',
        success: renderVideos
      })
    })

    function hotNews(data) {
      if (!data.T1348647909107 && !data.T1348647909107.length > 0) {
        console.error('Have not any hot news')
      }
      let { photoNews, normalNews } = data.T1348647909107.reduce((pre, data) => {
        const { photoNews, normalNews } = pre
        const p = isPhotoset(data)
        const n = isNormalNews(data)
        p && photoNews.push(p)
        n && normalNews.push(n)
        return { photoNews, normalNews }
      }, { photoNews: [], normalNews: [] })

      let html = ''
      for (let i = 0; i < 10; i++) {
        if (i === 4 || i === 9) {
          // 第五第十条为图集
          const item = photoNews.splice(random(photoNews.length), 1)[0]
          const _url = getUrl({
            source: _type,
            type: 'photoset',
            setId: item.id.split('|')[1],
            channelId: item.id.split('|')[0].slice(-4)
          })
          html += `
            <li class="multi-img" data-stat="${_type}-news${i}">
              <a href="${_url}">
                <div class="title-wrap">
                  <span class="title ellipsis">${item.title}</span>
                  <span class="count">${round(item.replyCount)}跟贴</span>
                </div>
                <div class="img-wrap">
                  <span style="background-image:url(${optImage(item.img[0], 184)})"></span>
                  <span style="background-image:url(${optImage(item.img[1], 184)})"></span>
                  <span style="background-image:url(${optImage(item.img[2], 184)})"></span>
                </div>
              </a>
            </li>
          `
        } else {
          const newsLen = normalNews.length
          // 前四条新闻按权重读取，后面随机读取
          const item = i < 4 ? normalNews.slice(0, 4)[i] : normalNews.slice(4, newsLen).splice(random(newsLen - 4), 1)[0]
          const _url = getUrl({
            source: _type,
            type: 'doc',
            id: item.id
          })
          html += `
            <li class="single-img" data-stat="${_type}-news${i}">
              <a href="${_url}">
                <img src="${optImage(item.img, 160, 120)}" onerror="this.src='http://img2.cache.netease.com/3g/img11/3gtouch13/default.jpg'">
                <div class="news-wrap">
                  <div class="news-title">${item.title}</div>
                  <span class="news-tip"> ${round(item.replyCount)} 跟贴</span>
                </div>
              </a>
            </li>
          `
        }
      }
      document.querySelector('.m-hotnews').innerHTML = `
        <div class="u-title">热门新闻</div>
        <ul class="news-list">${html}</ul>
        <a class="u-more u-hide-in-newsapp" data-stat="o-${_type}-news-more" href="http://m.163.com/newsapp/applinks.html?s=sps">查看更多新闻 &gt;</a>
      `
    }
    function isPhotoset(data) {
      if (data.imgsrc && data.imgextra && data.imgextra.length > 1) {
        const result = {
          title: data.title,
          id: data.skipID,
          img: [].concat(data.imgsrc, data.imgextra[0].imgsrc, data.imgextra[1].imgsrc),
          replyCount: data.replyCount
        }
        return result
      }
    }
    function isNormalNews(data) {
      if (data.docid.length === 16 && !data.skipType) {
        const result = {
          title: data.title,
          img: data.imgsrc,
          id: data.docid,
          replyCount: data.replyCount
        }
        return result
      }
    }
    function random(number) {
      return Math.floor(Math.random() * number)
    }

    const renderVideos = (data) => {
      let html = ''
      let lastVideoHtml = ''
      data['VBJ4L28O7'].forEach((item, index) => {
        if (index < 4) {
          if (item.title.length > 22) {
            item.title = (item.title.slice(0, 22)) + "..."
          }
          if (item.description.length > 15) {
            item.description = "" + (item.description.slice(0, 15))
          }
          const _url = getUrl({
            source: _type,
            type: 'video',
            id: item.vid
          })
          html += `
            <li class="single-img" data-stat="${_type}-video${index}">
              <a href="${_url}">
                <div class="cover">
                  <img src="${item.cover}" />
                  <span class="u-video-icon"></span>
                </div>
                <div class="news-wrap">
                  <div class="news-title">${item.title}</div>
                  <div class="news-subtitle">${item.description}</div>
                </div>
              </a>
            </li>
          `
        }
        if (index == 4) {
          const _url = getUrl({
            source: _type,
            type: 'bigVideo',
            id: item.vid
          })
          lastVideoHtml += `
            <a class="clearfix" href="${_url}" data-stat="${_type}-video${index}">
              <div class="news-wrap">
                <div class="news-title">${item.title}</div>
                <div class="news-subtitle">${item.description}</div>
              </div>
              <div class="cover">
                <img src="${item.cover}">
                <span class="u-video-icon"></span>
                <span class="u-tip-icon">打开网易新闻</span>
              </div>
            </a>
            <a class="u-more u-hide-in-newsapp" data-stat="o-${_type}-video-more" href="http://m.163.com/newsapp/applinks.html?s=sps">查看更多视频 &gt;</a>
          `
        }
      })
      document.querySelector('.m-hotnews').insertAdjacentHTML('afterend', `<article class="m-videos"><div class="u-title">热门视频</div><ul class="list-wrap">${html}</ul></article><article class="m-videos-last u-hide-in-newsapp">${lastVideoHtml}</article>`)
    }
  }

  // 滚动加载更多新闻和视频
  const screenHeight = document.documentElement.clientHeight

  document.addEventListener('scroll', function(e){
    const hotNews = document.querySelector('.m-hotnews .news-list')
    if (hotNews) {
      let loaded = hotNews.getAttribute('data-loaded')
      if (+loaded === 1) {
        return
      }
      let currentScrollTop = document.body.scrollTop
      let totalHeight = document.querySelector('.m-body-wrap').offsetHeight
      if (currentScrollTop + screenHeight + 20 > totalHeight) {
        hotNews.setAttribute('data-loaded', 1)
        return setTimeout((function(_this) {
          return function() {
            hotNews.className = 'news-list expanded'
            document.querySelector('.m-videos').style.display = 'block'
          }
        })(this), 1000)
      }
    }
  })
}
