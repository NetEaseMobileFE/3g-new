require('./index.less')

if (module && module.hot) {
  module.hot.accept()
}
// http://apm.netease.com/manual?api=web
if (window.NRUM && window.NRUM.mark) {
  window.NRUM.mark('pageload', true)
}
// 安卓阻止页面滚动
isAndroid && document.addEventListener('touchmove', (e) => {
  e.preventDefault()
}, false)

const ua = navigator.userAgent
const search = localParam().search
const isAndroid = !!ua.match(/android/i)
const isAndroid2x = (/android\s?2\./i).test(ua)
const isIOS = !!ua.match(/ipad|ipod|iphone/i)
const iOSVersion = isIOS ? +ua.match(/OS\s(\d*)/)[1] : 0
const isIE = (/MSIE/gi).test(ua)
const isWechat = !!ua.match(/MicroMessenger/i)
const isX5 = !!ua.match(/MQQBrowser/i)

const CHANNLE = search.s || ''
const DOWNLOAD_URLS = {
  iOS: `http://3g.163.com/links/3615?s=${CHANNLE}`,
  android: (!isAndroid2x) ? `http://3g.163.com/links/7263?s=${CHANNLE}` : `http://3g.163.com/links/6264?s=${CHANNLE}`,
  winPhone: `http://3g.163.com/links/3614?s=${CHANNLE}`
}

window.STATS = statsParams(search)

// 加载包管理
jsonp('http://active.163.com/service/form/v1/5847/view/1047.jsonp')
/* eslint-disable no-underscore-dangle */
window._callback = (data) => {
  window._callback = null
  /* eslint-enable no-underscore-dangle */
  const list = data.list

	// 获取url中s的值对应的下载包
  const config = list.filter((item) => {
    return item.type === CHANNLE
  })[0] || {}

  // android 微信和qq浏览器中，跳转应用宝
  if (isAndroid && (isWechat || isX5)) {
    window.location.href = `http://a.app.qq.com/o/simple.jsp?pkgname=com.netease.newsreader.activity&ckey=${config.tencent || 'CK1331205846719'}&android_schema=${scheme}`
  }
  render(config)
  document.body.classList.add('active')
}

// 获取scheme
const scheme = genScheme(search) + '?s=' + (CHANNLE || 'sps')

// iOS中，尝试打开客户端
if (isIOS) {
  setTimeout(() => {
    openNewsapp(false, scheme)
  }, 100)
}
// android中，尝试iframe打开客户端
if (isAndroid) {
  openNewsapp(true, scheme)
}

// 此时如果打不开，则判断，如果url中含有redirect，则重定向url
if (search.redirect) {
  window.location.href = decodeURIComponent(search.redirect)
}

// iOS 微信和qq浏览器中，提示浏览器中打开
if (isIOS && (isWechat || isX5)) {
  document.getElementById('guide').style.display = 'block'
  document.body.classList.add('wechat')
}

function render(config) {
  const androidOpen = document.querySelector('.js-open')
  const androidDown = document.querySelector('.js-down.android')
  const iOSDown = document.querySelector('.js-down.ios')
  androidOpen.dataset.href = scheme
  androidDown.dataset.href = config.android || DOWNLOAD_URLS.android
  iOSDown.dataset.href = config.iOS || DOWNLOAD_URLS.iOS
  if (isIE) {
    iOSDown.dataset.href = DOWNLOAD_URLS.winPhone
  }
}
function statsParams(params) {
  const { docid, sid, pid, vid, liveRoomid, url, subjectid, expertid, readerid, luoboid } = params

  const modelid = docid || vid || liveRoomid || pid || sid || url || subjectid || expertid || readerid || luoboid || ''
  let spst = 0
  sid && (spst = 2)
  pid && (spst = 3)
  liveRoomid && (spst = 4)
  url && (spst = 5)
  vid && (spst = 6)
  expertid && (spst = 8)
  subjectid && (spst = 10)
  luoboid && (spst = 11)
  return {
    spst,
    modelid,
    spss: CHANNLE
  }
}
function genScheme(params) {
  /* eslint-disable no-underscore-dangle */
  let _scheme = 'newsapp://'
  /* eslint-enable no-underscore-dangle */
  const { title, boardid, docid, postid, sid, pid, vid, liveRoomid, url, subjectid, expertid, readerid, luoboid } = params
  if (title && boardid) {
    // 打开跟贴
    return `${_scheme}comment/${boardid}/${postid || docid}/${title}`
  } else if (docid) {
    // 打开文章
    return `${_scheme}doc/${docid}`
  } else if (sid) {
    // 打开专题
    return `${_scheme}topic/${sid}`
  } else if (pid) {
    // 打开图集
    return `${_scheme}photo/${pid.replace('_', '/')}`
  } else if (vid) {
    // 打开视频
    return `${_scheme}video/${vid}`
  } else if (liveRoomid) {
    // 打开直播
    return `${_scheme}live/${liveRoomid}`
  } else if (url) {
    // 打开网址
    return `${_scheme}web/${url}`
  } else if (expertid) {
    // 打开问吧
    return `${_scheme}expert/${expertid}`
  } else if (subjectid) {
    // 打开话题
    return `${_scheme}subject/${subjectid}`
  } else if (readerid) {
    // 打开订阅
    return `${_scheme}reader/${readerid}`
  } else if (luoboid) {
    // 打开萝卜
    return `${_scheme}luobo/${luoboid.replace('_', '/')}`
  }
  // 打开首页
  return `${_scheme}startup`
}

function openNewsapp(soft, _scheme) {
  // 低级尝试，通过iframe打开app，不影响页面显示
  if (soft) {
    document.getElementById('iframe').src = _scheme
  } else {
    window.location.href = _scheme
  }
}

document.body.classList.add(isAndroid ? 'android' : 'ios')

// iOS 9+ 提示下拉
if (isIOS && iOSVersion >= 9) {
  document.querySelector('.tip').style.display = 'block'
}
document.querySelector('.buttons').addEventListener('click', (e) => {
  if (!e.target.classList.contains('btn')) {
    return
  }
  const event = e.target.classList.contains('js-open') ? 'clicklaunch' : 'downloadapp'
  window.neteaseTracker && window.neteaseTracker(false, `http://sps.163.com/func/?func=${event}&modelid=${window.STATS.modelid}&spst=${window.STATS.spst}&spsf&spss=${window.STATS.spss}`, '', 'sps')
  if (isIOS) {
    openNewsapp(true, scheme)
  }
  setTimeout(() => {
    if (document.webkitHidden) {
      return
    }
    window.location.href = e.target.dataset.href
  }, 100)
}, false)
function jsonp(a, b, c) {
  /* eslint no-unused-expressions: ["error", { "allowShortCircuit": true }] */
  let d = document.createElement('script')
  d.src = a
  d.charset = c || 'utf-8'
  d.onload = () => {
    d.onload = d.onerror = null
    d.parentNode.removeChild(d)
    b && b(!0)
  }
  d.onerror = () => {
    d.onload = d.onerror = null
    d.parentNode.removeChild(d)
    b && b(!1)
  }
  document.head.appendChild(d)
}
function localParam(s = window.location.search, hash = window.location.hash) {
  function fn(str, reg) {
    if (str) {
      let data = {}
      str.replace(reg, ($0, $1, $2, $3) => {
        data[$1] = $3
      })
      return data
    }
    return ''
  }
  return {
    search: fn(s, new RegExp('([^?=&]+)(=([^&]*))?', 'g')) || {},
    hash: fn(hash, new RegExp('([^#=&]+)(=([^&]*))?', 'g')) || {}
  }
}
