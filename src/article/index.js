if (module && module.hot) {
  module.hot.accept()
}


import analysis from '../common/analysis'
import { localParam } from '../common/utils'
import header from '../common/header'
import share from '../common/share'
import footer from '../common/footer'

require('../common/reset.css')
require('./index.scss')

const search = localParam().search
const docid = search.docid

// mapp and sps analysis
analysis({ 
  type: "func",
  docid: docid
})

// common header
document.querySelector('.m-body-wrap').insertAdjacentHTML('beforebegin', header({
  type: 'docid',
  id: docid
}))

// common footer
document.querySelector('.m-body-wrap').insertAdjacentHTML('afterend', footer())

// share component
{
  const spss = search.s || 'newsapp'
  let _url = window.location.origin + location.pathname
  let spsw = 2
  let w = +search.w
  if (w) {
    w++
    spsw = w
  }
  _url += `?docid=${docid}&s=newsapp&w=${spsw}`
  share({
    title: '测试文章',
    desc: '测试文章测试文章测试文章测试文章',
    url: _url,
    img: 'http://img6.cache.netease.com/utf8/3g/touch/images/share-logo.png',
    statistics: {
      spst: 0,
      docid: docid,
      spss: spss,
      spsw: spsw
    }
  })
}