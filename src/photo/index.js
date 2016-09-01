import analysis from '../common/analysis'
import loading from '../common/loading'
import share from '../common/share'
import * as utils from '../common/utils'
import more from '../common/more'
import post from '../common/post'
// import middleShare from '../common/middle-share'
import popular from '../common/popular'
import testFooter from '../common/test-footer'
import footer from '../common/footer'
import redpacket from '../common/redpacket'
import '../common/is-newsapp'
import '../common/is-iframe'

require('../common/reset.css')
require('./index.less')

if (module && module.hot) {
  module.hot.accept()
}

const search = utils.localParam().search
let channelid = search.channelid || '0096'
let setid = search.setid
if (!setid) {
  const params = window.location.href.match(/p\/([0-9]{4})\/([0-9]{1,})/)
  channelid = params[1] || '0096'
  setid = params[2]
}
const modelid = `${channelid}_${setid}`

// loading
loading()

// mapp and sps analysis
analysis({
  spst: 3,
  type: 'article',
  modelid
})

// body content
{
  const TPL = (() => {
    const myTpl = {
      content: `
        <div class="title"><#=setname#></div>
        <div class="subtitle">
          <span><#=source#></span>
          <span class="time"><#=time#></span>
          <span class="red">跟贴 <span class="js-tiecount"></span> 条</span>
        </div>
        <div><#=content#></div>
      `,
      photos: `
        <p><img class="img" data-index="<#=index#>" src="<#=src#>"/></p>
        <p class="text"><#=imgtitle#></p>
        <p class="text"><#=imgnote#></p>
      `,
      photoset: `
        <li>
          <div class="img-wrap"><img data-src="<#=src#>"></div>
        </li>
      `,
      post: `
        <div class="tie-item" id="<#=postid#>" count="<#=count#>">
          <p class="tie-author clearfix">
            <span class="userHeadImage-contain">
            <img src="<#=headImg#>" alt="user-head-image" />
            </span>
            <span class="fl-l author61"><#=author#></span>
            <span class="fl-r"><#=vote#>顶</span>
          </p>
          <#=floors#>
          <p><#=content#></p>
        </div>
      `,
      fullFloor: `
        <p class="clearfix">
          <span class="fl-l author61"><#=author#></span>
          <span class="fl-r"><#=vote#> 顶</span>
        </p>
        <#=floors#>
        <p><#=content#></p>
      `,
      fold: `
        <div><#=floors#><p class="foldLink">点击展开隐藏楼层</p></div>
      `,
      oriPost: `
        <div>
          <#=floors#>
          <p class="clearfix">
            <span class="fl-l author97"><#=author#></span>
            <span class="fl-r"><#=floorNo#></span>
          </p>
          <p><#=content#></p>
        </div>
      `
    }
    return myTpl
  })()

  const RENDER = (() => {
    const myRender = {
      getHtml(data, start, length) {
        let html = ''
        data.forEach((item, i) => {
          if (i >= start && i < start + length) {
            html += utils.simpleParse(TPL.photos, {
              src: item.imgurl,
              imgtitle: item.imgtitle,
              imgnote: item.note,
              index: i
            })
          }
        })
        return html
      },
      preventDefault(e) {
        e.preventDefault()
      }
    }
    return myRender
  })()

  let number = 10
  window.photosetinfo = (data) => {
    window.photosetinfo = null
    if (!data) return
    const docid = data.postid
    const board = data.boardid
    const photosData = data.photos

    let photoScroll = null
    // share component
    {
      const spss = search.s || 'newsapp'
      let url = window.location.origin + location.pathname + '?s=newsapp'
      let w = +search.w
      if (w) {
        w++
        url += '&w=' + w
      } else {
        url += '&w=2'
      }
      share({
        title: data.setname || document.title,
        desc: data.desc || '',
        url,
        img: data.cover || 'http://img6.cache.netease.com/utf8/3g/touch/images/share-logo.png',
        statistics: {
          spst: 3,
          modelid,
          spss,
          spsw: w
        }
      })
    }

    document.addEventListener('click', (e) => {
      const wrap = document.querySelector('.m-photoset')
      if (wrap.classList.contains('show')) {
        wrap.classList.remove('show')
        document.body.removeEventListener('touchstart', RENDER.preventDefault, false)
      } else {
        if (!e.target.classList.contains('img')) return
        window.location.hash = 'img'
        wrap.classList.add('show')
        document.body.addEventListener('touchstart', RENDER.preventDefault, false)
        let imgIndex = +e.target.dataset.index || 0
        if (+wrap.dataset.loaded === 0) {
          // 加载并显示图集
          wrap.dataset.loaded = 1
          let html = ''
          photosData.forEach((item) => {
            html += utils.simpleParse(TPL.photoset, { src: item.imgurl })
          })
          wrap.querySelector('ul').innerHTML = html
          wrap.querySelector('ul').style.width = `${750 * photosData.length}px`
          const IScroll = window.IScroll
          photoScroll = new IScroll('.m-photoset', {
            scrollX: true,
            scrollY: false,
            momentum: false,
            snap: 'li',
            snapSpeed: 600,
            snapThreshold: 0.08,
            click: true,
            preventDefault: false
          })
          photoScroll.on('scrollEnd', () => {
            const cp = photoScroll.currentPage.pageX
            const imgs = wrap.querySelectorAll('img')
            if (imgs[cp] && !imgs[cp].src) {
              imgs[cp].src = imgs[cp].dataset.src
            }
            if (imgs[cp + 1] && !imgs[cp + 1].src) {
              imgs[cp + 1].src = imgs[cp + 1].dataset.src
            }
            if (imgs[cp - 1] && !imgs[cp - 1].src) {
              imgs[cp - 1].src = imgs[cp - 1].dataset.src
            }
          })
        }

        photoScroll.goToPage(imgIndex, 0, 0)
        const imgs = wrap.querySelectorAll('img')

        imgs[imgIndex].src = imgs[imgIndex].dataset.src
        if (+imgIndex !== 0) {
          imgs[imgIndex - 1].src = imgs[imgIndex - 1].dataset.src
        }
        imgs[imgIndex + 1].src = imgs[imgIndex + 1].dataset.src
      }
    }, false)

    // 禁止并改变安卓的物理返回事件
    const XBack = window.XBack
    XBack.listen(() => {
      window.location.hash = ''
      document.querySelector('.m-photoset').classList.remove('show')
      document.body.removeEventListener('touchstart', RENDER.preventDefault, false)
    })

    document.querySelector('.m-loading').style.display = 'none'

    // 跟帖
    if (docid && board) {
      // 获取跟帖数
      utils.importJs(`http://comment.api.163.com/api/json/thread/total/${board}/${docid}?jsoncallback=getPosts`)
      window.getPosts = (postData) => {
        window.getPosts = null
        const tiecount = document.querySelector('.js-tiecount')
        if (tiecount) {
          tiecount.textContent = postData.votecount || 0
          // 获取跟帖
          post({
            boardid: board,
            params: `postid=${docid}&pid=${modelid}`,
            votecount: postData.votecount || 0
          })
        }
      }
    }

    let photosHtml = RENDER.getHtml(photosData, 0, number)
    photosHtml = utils.simpleParse(TPL.content, {
      setname: data.setname,
      source: data.source,
      time: data.datatime.slice(5, -3),
      content: photosHtml
    })

    if (photosData.length > number) {
      document.querySelector('.article-content').insertAdjacentHTML('afterend', '<div class="expanded"><a class="load-more" data-page="1">加载更多</a></div>')
      const loadMore = document.querySelector('.load-more')
      loadMore.addEventListener('click', (e) => {
        e.preventDefault()
        let page = +loadMore.dataset.page
        if (page * number < photosData.length) {
          let html = RENDER.getHtml(photosData, page * number, number)
          loadMore.insertAdjacentHTML('beforebegin', html)
          loadMore.dataset.page = page + 1
        }
        if ((page + 1) * number >= photosData.length) {
          loadMore.style.display = 'none'
        }
      }, false)
    }

    const articleContent = document.querySelector('.article-content')
    articleContent.innerHTML = photosHtml

    const mainBody = document.querySelector('.main-body')
    articleContent.insertAdjacentHTML('afterend', more({ origin: 'pid' }))
    const showAllArticle = document.querySelector('.js-all-article')
    showAllArticle.addEventListener('click', (e) => {
      const that = e.currentTarget
      mainBody.style.maxHeight = 'none'
      that.parentElement.style.display = 'none'
    })
  }

  utils.importJs(`http://c.3g.163.com/photo/api/jsonp/set/${channelid}/${setid}.json`)
}

// 中间分享
// document.querySelector('.m-middle-share').innerHTML = middleShare({ origin: 'pid' })

// hotNews videoNews
utils.ajax({
  method: 'GET',
  dataType: 'json',
  url: 'http://c.m.163.com/nc/article/list/T1348647909107/0-40.html',
  success: (data) => {
    popular('pid', data)
  }
})

// common footer
// 底部ab测试
{
  const num = Math.random()
  const ntesNuid = utils.getCookie('_ntes_nuid') || ''
  let test = localStorage.getItem('_footer_test') || ''
  let flag = '0'
  if (test.slice(0, -1) === ntesNuid) {
    flag = test.slice(-1, test.length)
  } else if (utils.isAndroid && utils.isWeixin) {
    if (num < 0.5) {
      localStorage.setItem('_footer_test', `${ntesNuid}a`)
    } else {
      localStorage.setItem('_footer_test', `${ntesNuid}b`)
    }
  } else {
    localStorage.setItem('_footer_test', `${ntesNuid}0`)
  }

  if (+flag === 0 || flag === 'b') {
    document.querySelector('.m-body-wrap').insertAdjacentHTML('afterend', testFooter({
      pid: modelid
    }))
  } else {
    document.querySelector('.m-body-wrap').insertAdjacentHTML('afterend', footer({
      pid: modelid
    }))
  }

  if (flag === 'b') {
    document.querySelector('.g-banner-footer a').dataset.stat = 'o-pid-b-footer'
  }
}

// 红包
redpacket()
