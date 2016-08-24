/*** 统计 ***/

import { closest } from '../common/utils'

if (module && module.hot) {
  module.hot.accept()
}

function loadScript(id, src, callback) {
  let script = document.getElementById(id)
  if (script) {
    callback()
    return
  }
  script = document.createElement('script')
  script.charset = 'utf-8'
  script.async = true
  script.src = src
  script.onload = () => {
    typeof callback === 'function' && callback()
  }
  document.body.appendChild(script)
}

export default function analysis(userOptions) {
  function params() {
    const url = window.location.href
    const start = url.indexOf("?") + 1
    let paras = {}
    if (start !== 0) {
      const queryString = url.substring(start)
      const paraNames = queryString.split('&')
      let arr = []
      for (let i = 0; i < paraNames.length; i++) {
        arr = paraNames[i].split('=')
        paras[arr[0]] = arr[1]
      }
    }
    return paras
  }
  
  function defaults (object) {
    if (!object) {
      return object
    }
    let argsLength = arguments.length
    for (let i = 1; i < argsLength; i++) {
      let iterable = arguments[i]
      if (iterable) {
        for (let key in iterable) {
          if (typeof object[key] == 'undefined') {
            object[key] = iterable[key]
          }
        }
      }
    }
    return object
  }

  let paramsObject = params()
  const ua = navigator.userAgent
  const referrer = document.referrer
  let spsf = paramsObject.f || ''
  if (ua.match(/micromessenger/gi)) {
    spsf = 'wx'
  } else if (ua.match(/weibo/gi) || referrer.match(/weibo\.com/)) {
    spsf = 'wb'
  } else if (ua.match(/yixin/gi)) {
    spsf = 'yx'
  } else if (ua.match(/qq/gi) || referrer.match(/qq\.com/) || referrer.match(/qzone\.com/)) {
    spsf = 'qq'
  }
  let spst = 0
  let spsw = paramsObject['w'] || 1
  let defaultOptions = {
    spss: "newsapp",
    spst: spst,
    spsw: spsw,
    spsf: spsf,
    type: "article",
  }
  defaultOptions.spss = (ua.match(/newsapp/gi)) ? 'native' : 'newsapp'
  let options = defaults(userOptions, defaultOptions)
  let queryStr = '?'

  for (let item in options) {
    if (item != 'type') {
      queryStr = `${queryStr}${item}=${options[item]}&`
    }
  }

  queryStr = queryStr.substr(0, queryStr.length - 1)

  let link = `http://sps.163.com/${options.type}/${queryStr}`

  loadScript('__ntes__analysis', 'http://img6.cache.netease.com/utf8/3g/libs/ntes-stat.js', ()=> {
    window._ntes_nacc = "mapp"
    neteaseTracker()

    window.neteaseTracker && window.neteaseTracker(false, link, '', 'sps' )

    // click analysis
    const clickStat = document.querySelector('.js-analysis')
    if (clickStat) {
      clickStat.addEventListener('click', function(e){
        const target = e.target
        const stat = closest(e.target, '[data-stat]')
        const dataStat = stat.getAttribute('data-stat')
        if (dataStat) {
          window.neteaseTracker && window.neteaseTracker(false, `http://sps.163.com/func/?func=clickStat&${queryStr.slice(1,queryStr.length)}&target=${dataStat}`, '', 'sps')
        }
      })
    }
  })
}




