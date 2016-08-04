if (module && module.hot) {
  module.hot.accept()
}

export default function lazyload(options) {
  let defaults = options || {}
  const offset = defaults.offset || 100
  const lazyTime = defaults.lazyTime || 200
  const _selector = defaults.selector || 'img[data-echo], [data-echo-background]'
  
  let imgList = []

  function isShow(el) {
    const coords = el.getBoundingClientRect()
    return ( (coords.top >= 0 && coords.left >= 0 && coords.top) <= (window.innerHeight || document.documentElement.clientHeight) + parseInt(offset))
  }

  function loadImage() {
    for (let i = imgList.length; i--;) {
      const el = imgList[i]
      if (isShow(el)) {
        const _src = el.getAttribute('data-echo')
        const _bg = el.getAttribute('data-echo-background')
        if (_src) {
          el.src = _src
          imgList.splice(i, 1)
        } else if (_bg) {
          el.style.background = `url(${_bg})`
        }
      }
    }
  }

  function delay() {
    clearTimeout(delay)
    delay = setTimeout(function () {
      loadImage()
    }, lazyTime)
  }

  const nodes = document.querySelectorAll(_selector)
  for (let i = 0, l = nodes.length; i < l; i++) {
    imgList.push(nodes[i])
  }
  
  delay()
  if (defaults.iScroll) {
    defaults.iScroll.on('scrollEnd', delay)
  } else {
    window.addEventListener('scroll', delay, false)
  }
}




