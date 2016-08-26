if (module && module.hot) {
  module.hot.accept()
}

import analysis from '../common/analysis'
import loading from '../common/loading'
import share from '../common/share'
import * as utils from '../common/utils'
import more from '../common/more'
import post from '../common/post'
// import middleShare from '../common/middle-share'
import popular from '../common/popular'
import testFooter from '../common/test-footer'
import redpacket from '../common/redpacket'
import '../common/is-newsapp'
import '../common/is-iframe'

require('../common/reset.css')
require('./index.less')

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
  type: "article",
  modelid: modelid
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
  {
    window.photosetinfo = (data) => {
      window.photosetinfo = null
      if(!data) return
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
          url: url,
          img: data.cover || 'http://img6.cache.netease.com/utf8/3g/touch/images/share-logo.png',
          statistics: {
            spst: 3,
            modelid: modelid,
            spss: spss,
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
          if (wrap.dataset.loaded == 0) {
            //加载并显示图集
            wrap.dataset.loaded = 1
            let html = ''
            photosData.forEach((item, i) => {
              html += utils.simpleParse(TPL.photoset, {src: item.imgurl})
            })
            wrap.querySelector('ul').innerHTML = html
            wrap.querySelector('ul').style.width = `${750 * photosData.length}px`
            
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
            photoScroll.on('scrollEnd', (e) => {
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
          if (imgIndex != 0) {
            imgs[imgIndex - 1].src = imgs[imgIndex - 1].dataset.src
          }
          imgs[imgIndex + 1].src = imgs[imgIndex + 1].dataset.src
        }
      }, false)

      // 禁止并改变安卓的物理返回事件
      XBack.listen(function() {
        window.location.hash = ''
        document.querySelector('.m-photoset').classList.remove('show')
        document.body.removeEventListener('touchstart', RENDER.preventDefault, false)
      })

      document.querySelector('.m-loading').style.display = 'none'

      // 跟帖
      if (docid && board) {
        document.querySelector('.m-comment').style.display = 'block'
        // 获取跟帖数
        utils.importJs(`http://comment.api.163.com/api/json/thread/total/${board}/${docid}?jsoncallback=getPosts`)

        window.getPosts = (data) => {
          window.getPosts = null
          const tiecount = document.querySelector('.js-tiecount')
          const comment = document.querySelector('.comment-list')
          if (tiecount) {
            tiecount.textContent = data.votecount || 0
            // 获取跟帖
            post({ 
              boardid: board, 
              params: `postid=${docid}&pid=${modelid}`, 
              votecount: data.votecount || 0
            })
          }
        }
      }

      let photosHtml = RENDER.getHtml(photosData, 0, number)
      photosHtml = utils.simpleParse(TPL.content, {
        setname: data.setname, 
        source: data.source, 
        time: data.datatime, 
        content: photosHtml
      })

      if (photosData.length > number) {
        document.querySelector('.article-content').insertAdjacentHTML('afterend', '<div class="expanded"><a class="load-more" data-page="1">加载更多</a></div>')
        const loadMore = document.querySelector('.load-more')
        loadMore.addEventListener('click', function(e) {
          e.preventDefault()
          let page = +loadMore.dataset.page
          if (page*number < photosData.length) {
            let html = RENDER.getHtml(photosData, page * number, number)
            loadMore.insertAdjacentHTML('beforebegin', html)
            loadMore.dataset.page = page + 1
          }
          if ((page+1)*number >= photosData.length) {
            loadMore.style.display = 'none'
          }
        }, false)
      } 
      
      const articleContent = document.querySelector('.article-content')
      articleContent.innerHTML = photosHtml

      const mainBody = document.querySelector('.main-body')
      articleContent.insertAdjacentHTML('afterend', more({ origin: 'pid' }))
      const showAllArticle = document.querySelector('.js-all-article')
      showAllArticle.addEventListener('click', function(){
        mainBody.style.maxHeight = 'none'
        this.parentElement.style.display = 'none'
      })
    }

    utils.importJs(`http://c.3g.163.com/photo/api/jsonp/set/${channelid}/${setid}.json`)
  }
}

// 中间分享
// document.querySelector('.m-middle-share').innerHTML = middleShare({ origin: 'pid' })

// hotNews videoNews
utils.ajax({
  method: "GET",
  dataType: 'json',
  url: 'http://c.m.163.com/nc/article/list/T1348647909107/0-40.html',
  success: function(data) {
    popular('pid', data)
  }
})

// common footer
document.querySelector('.m-body-wrap').insertAdjacentHTML('afterend', testFooter({
  pid: modelid
}))

// 红包
redpacket()


