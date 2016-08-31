/**
 * 热门新闻和视频列表
 * [article、photo] 调用
 */
import { optImage, ajax, round } from '../utils'

require('./index.less')

if (module && module.hot) {
  module.hot.accept()
}
/**
 * @method popular
 * @param  {[string]} type [统计类型]
 * @param  {[array]} data [热门新闻列表]
 * @return {[null]}
 */
export default function popular(type, data) {
  // 热门新闻 && 热门视频
  setTimeout(loadNews.bind(null, type, data), 500)
  // 滚动加载新闻
  scrollLoad()
}
function loadNews(type, data) {
  // 加载热门新闻
  hotNews(type, data)
  // 加载热门视频
  ajax({
    method: 'GET',
    dataType: 'json',
    url: 'http://c.m.163.com/nc/video/list/VBJ4L28O7/n/0-10.html',
    success: renderVideos.bind(null, type)
  })
}
function hotNews(type, data) {
  if (!data.T1348647909107 && !data.T1348647909107.length > 0) {
    return
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
    let news = {}
    if (i < 4) {
      // 前四条固定去普通新闻前四条
      news = normalNews.shift()
    } else if (i === 4) {
      // 第五条固定取多图新闻
      news = photoNews.shift()
    } else if (i === 9) {
      // 第十条随机取多图新闻
      news = photoNews.splice(random(photoNews.length), 1)[0]
    } else {
      // 剩余随机取4条普通新闻
      news = normalNews.splice(random(normalNews.length), 1)[0]
    }
    if (news.id.indexOf('|') > 0) {
      // 图集
      const url = getUrl({
        source: type,
        type: 'photoset',
        setId: news.id.split('|')[1],
        channelId: news.id.split('|')[0].slice(-4)
      })
      html += `
        <li class="multi-img" data-stat="${type}-news${i}">
          <a href="${url}">
            <div class="title-wrap">
              <span class="title ellipsis">${news.title}</span>
              <span class="count">${round(news.replyCount)}跟贴</span>
            </div>
            <div class="img-wrap">
              <span style="background-image:url(${optImage(news.img[0], 184)})"></span>
              <span style="background-image:url(${optImage(news.img[1], 184)})"></span>
              <span style="background-image:url(${optImage(news.img[2], 184)})"></span>
            </div>
          </a>
        </li>
      `
    } else {
      // 普通新闻
      const url = getUrl({
        source: type,
        type: 'doc',
        id: news.id
      })
      html += `
        <li class="single-img" data-stat="${type}-news${i}">
          <a href="${url}">
            <img src="${optImage(news.img, 160, 120)}" onerror="this.src='http://img2.cache.netease.com/3g/img11/3gtouch13/default.jpg'">
            <div class="news-wrap">
              <div class="news-title">${news.title}</div>
              <span class="news-tip"> ${round(news.replyCount)} 跟贴</span>
            </div>
          </a>
        </li>
      `
    }
  }
  document.querySelector('.m-hotnews').innerHTML = `
    <div class="u-title">热门新闻</div>
    <ul class="news-list">${html}</ul>
    <a class="u-more u-hide-in-newsapp" data-stat="o-${type}-news-more" href="http://m.163.com/newsapp/applinks.html?s=sps">查看更多新闻 &gt;</a>
  `
}
function renderVideos(type, data) {
  let html = ''
  let lastVideoHtml = ''
  /* eslint-disable no-param-reassign */
  data.VBJ4L28O7.forEach((item, index) => {
    if (index < 4) {
      if (item.title.length > 22) {
        item.title = (item.title.slice(0, 22)) + '...'
      }
      if (item.description.length > 15) {
        item.description = item.description.slice(0, 15)
      }
      const url = getUrl({
        source: type,
        type: 'video',
        id: item.vid
      })
      html += `
        <li class="single-img" data-stat="${type}-video${index}">
          <a href="${url}">
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
    if (index === 4) {
      const url = getUrl({
        source: type,
        type: 'bigVideo',
        id: item.vid
      })
      lastVideoHtml += `
        <a class="clearfix" href="${url}" data-stat="${type}-video${index}">
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
        <a class="u-more u-hide-in-newsapp" data-stat="o-${type}-video-more" href="http://m.163.com/newsapp/applinks.html?s=sps">查看更多视频 &gt;</a>
      `
    }
  })
  document.querySelector('.m-hotnews').insertAdjacentHTML('afterend', `<article class="m-videos"><div class="u-title">热门视频</div><ul class="list-wrap">${html}</ul></article><article class="m-videos-last u-hide-in-newsapp">${lastVideoHtml}</article>`)
}

function scrollLoad() {
  // 滚动加载更多新闻和视频
  const screenHeight = document.documentElement.clientHeight
  const hotNewsDOM = document.querySelector('.m-hotnews')
  hotNewsDOM && document.addEventListener('scroll', scroll, false)
  function scroll() {
    const loaded = +hotNewsDOM.dataset.loaded
    if (+loaded === 1 || !document.querySelector('.m-videos-last')) {
      return
    }
    const top = document.querySelector('.m-videos-last').getBoundingClientRect().top
    if (top < screenHeight - 200) {
      hotNewsDOM.dataset.loaded = 1
      document.removeEventListener('scroll', scroll, false)
      setTimeout(() => {
        hotNewsDOM.querySelector('.news-list').classList.add('expanded')
        document.querySelector('.m-videos').style.display = 'block'
      }, 500)
    }
  }
}
function getUrl(data) {
  /**
  doc: 获取普通文章链接，ios9下唤醒到客户端
  photoset: 获取图集链接，ios9下唤醒客户端
  video: 获取视频链接，ios9下唤醒客户端
  bigVideo: 获取底部大视频链接，ios9唤醒客户端，安卓微信下取微下载链接
  ********************************/
  const isIos9 = !!navigator.userAgent.match(/iPhone OS 9/i)
  const newsLink = {
    doc: (data) => {
      const { id, source } = data
      let url = `http://c.m.163.com/news/a/${id}.html?from=${source}`
      if (isIos9) {
        url = `http://m.163.com/newsapp/applinks.html?docid=${id}&redirect=${encodeURIComponent(url)}&s=sps`
      }
      return url
    },
    photoset: (data) => {
      const { channelId, setId, source } = data
      let url = `http://c.m.163.com/news/p/${channelId}/${setId}.html?from=${source}`
      if (isIos9) {
        url = `http://m.163.com/newsapp/applinks.html?pid=${channelId}_${setId}&redirect=${encodeURIComponent(url)}&s=sps`
      }
      return url
    },
    video: (data) => {
      const { id, source } = data
      let url = `http://c.m.163.com/news/v/${id}.html?from=${source}`
      if (isIos9) {
        url = `http://m.163.com/newsapp/applinks.html?vid=${id}&redirect=${encodeURIComponent(url)}&s=sps`
      }
      return url
    },
    bigVideo: (data) => {
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
  return ''
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
  return ''
}
function random(number) {
  return Math.floor(Math.random() * number)
}
