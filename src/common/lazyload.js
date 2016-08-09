/*** 图片懒加载 ***/

if (module && module.hot) {
  module.hot.accept()
}

export default function lazyload(opts) {
  let echo = {}
  let offset = null
  let poll = null
  let delay = null
  let useDebounce = null
  let unload = null
  let callback = function () {}

  const isHidden = function (element) {
    return (element.offsetParent === null)
  }

  const inView = function (element, view) {
    if (isHidden(element)) {
      return false
    }

    const box = element.getBoundingClientRect()
    return (box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b)
  }

  const debounceOrThrottle = function () {
    if (!useDebounce && !!poll) {
      return
    }
    clearTimeout(poll)
    poll = setTimeout(function(){
      echo.render()
      poll = null
    }, delay)
  }

  echo.init = function (opts) {
    opts = opts || {}
    const offsetAll = opts.offset || 0
    const offsetVertical = opts.offsetVertical || offsetAll
    const offsetHorizontal = opts.offsetHorizontal || offsetAll
    const optionToInt = function (opt, fallback) {
      return parseInt(opt || fallback, 10)
    }
    offset = {
      t: optionToInt(opts.offsetTop, offsetVertical),
      b: optionToInt(opts.offsetBottom, offsetVertical),
      l: optionToInt(opts.offsetLeft, offsetHorizontal),
      r: optionToInt(opts.offsetRight, offsetHorizontal)
    }
    delay = optionToInt(opts.throttle, 250)
    useDebounce = opts.debounce !== false
    unload = !!opts.unload
    callback = opts.callback || callback
    echo.render()
    if (document.addEventListener) {
      document.addEventListener('scroll', debounceOrThrottle, false)
      document.addEventListener('load', debounceOrThrottle, false)
    } else {
      document.attachEvent('onscroll', debounceOrThrottle)
      document.attachEvent('onload', debounceOrThrottle)
    }
  }

  echo.render = function () {
    const nodes = document.querySelectorAll('img[data-echo], [data-echo-background]')
    const length = nodes.length
    let src = null
    let elem = null
    const view = {
      l: 0 - offset.l,
      t: 0 - offset.t,
      b: (window.innerHeight || document.documentElement.clientHeight) + offset.b,
      r: (window.innerWidth || document.documentElement.clientWidth) + offset.r
    }
    for (let i = 0; i < length; i++) {
      elem = nodes[i]
      const _bg = elem.getAttribute('data-echo-background')
      const _img = elem.getAttribute('data-echo')
      const _ph = elem.getAttribute('data-echo-placeholder')
      if (inView(elem, view)) {

        if (unload) {
          elem.setAttribute('data-echo-placeholder', elem.src)
        }

        if (_bg !== null) {
          elem.style.backgroundImage = `url(${_bg})`
          elem.style.backgroundSize = 'cover'
        } else {
          elem.src = _img
        }

        if (!unload) {
          elem.removeAttribute('data-echo')
          elem.removeAttribute('data-echo-background')
        }

        callback(elem, 'load')
      }
      else if (unload && !!(src = _ph)) {

        if (elem.getAttribute('data-echo-background') !== null) {
          elem.style.backgroundImage = `url(${src})`
          elem.style.backgroundSize = 'cover'
        }
        else {
          elem.src = src
        }

        elem.removeAttribute('data-echo-placeholder')
        callback(elem, 'unload')
      }
    }
    if (!length) {
      echo.detach()
    }
  }

  echo.detach = function () {
    if (document.removeEventListener) {
      document.removeEventListener('scroll', debounceOrThrottle)
    } else {
      document.detachEvent('onscroll', debounceOrThrottle)
    }
    clearTimeout(poll)
  }

  echo.init()
}