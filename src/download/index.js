require('./index.less')

if (module && module.hot) {
	module.hot.accept()
}
// http://apm.netease.com/manual?api=web
window.NRUM && window.NRUM.mark && window.NRUM.mark('pageload', true)

const ua = navigator.userAgent
const search = localParam().search
const isAndroid = ua.match(/android/i)
const isAndroid2_x = (/android\s?2\./i).test(ua)
const isIOS = ua.match(/ipad|ipod|iphone/i)
const iOSVersion = isIOS ? +ua.match(/OS\s(\d*)/)[1] : 0
const isIE = (/MSIE/gi).test(ua)

const DOWNLOAD_URLS = {
	iOS: 'http://3g.163.com/links/3615',
	android: (!isAndroid2_x) ? 'http://3g.163.com/links/4304' : 'http://3g.163.com/links/6264',
	winPhone: 'http://3g.163.com/links/3614',

}

const CHANNLE = search.s || ''

// 加载包管理
jsonp('http://active.163.com/service/form/v1/5847/view/1047.jsonp')
window._callback = (data) => {
  window._callback = null
  const list = data.list
	// 获取url中s的值对应的下载包
  const config = list.filter((item) => {
    return item.type === CHANNLE
  })[0]

}
function render(config) {

}
function genScheme(params) {
	let scheme = 'newsapp://'
	const { title, boardid, docid, postid, sid, pid } = params
	if (title && boardid) {
		// 打开跟贴
		return `${scheme}comment/${boardid}/${postid || docid}/${title}`
	} else if (docid) {
		// 打开文章
		return `${scheme}doc/${docid}`
	} else if (sid) {
		// 打开专题
		return `${scheme}topic/${sid}`
	} else if (pid) {
		// 打开图集
		return `${scheme}photo/${pid.replace('_', '/')}`
	} else if (vid) {
		// 打开视频
		return `${scheme}video/${vid}`
	}
}


document.body.classList.add(isAndroid ? 'android' : 'ios')

// iOS 9+ 提示下拉
if (isIOS && iOSVersion >= 9) {
	document.querySelector('.tip').style.display = 'block'
}

function jsonp(a, b, c) {
  let d = document.createElement('script')
  d.src = a
  d.charset = c || 'utf-8'
  d.onload = function() {
    this.onload = this.onerror = null
    this.parentNode.removeChild(this)
    b && b(!0)
  }
  d.onerror = function() {
    this.onload = this.onerror = null
    this.parentNode.removeChild(this)
    b && b(!1)
  }
  document.head.appendChild(d)
}
function localParam(search = window.location.search, hash = window.location.hash) {
  function fn(str, reg) {
    if (str) {
      let data = {}
      str.replace(reg, ($0, $1, $2, $3 ) => {
        data[ $1 ] = $3
      })
      return data
    }
  }
  return  {
		search: fn(search, new RegExp( "([^?=&]+)(=([^&]*))?", "g" )) || {},
		hash: fn(hash, new RegExp( "([^#=&]+)(=([^&]*))?", "g" )) || {}
	}
}
