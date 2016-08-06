if (module && module.hot) {
  module.hot.accept()
}

import analysis from '../common/analysis'
import loading from '../common/loading'
import lazyload from '../common/lazyload'
import * as utils from '../common/utils'
import share from '../common/share'

require('../common/reset.css')
require('./index.less')

const search = utils.localParam().search
const sid = search.sid || window.location.href.match(/\/s\/(\w*)\./)[1]

loading()

// sps analysis
analysis({ 
  spst: 2,
  type: "article",
  modelid: sid
})

{
  /*********************************************************
  * @descripton 置顶title标题栏
  **********************************************************/
  const TopTitle = (() => {

    const my = {
      config: [],

      init() {
        //得到所有的标题元素
        const h2s = $('.m-news > h2')
        let index = 0
        h2s.forEach((item, index) => {
          my.config[index] = {
            html: `<h2 class="posfixed" id="topTitle">${item.innerHTML}</h2>`,
            element: item,
            isfixed: false
          }
        })
        //绑定滚动事件
        $(window).on('scroll',() => {
          const titleEle = $('#topTitle')
          for(let i = 0,len = h2s.length; i < len; i++) {
            if(h2s[i].getBoundingClientRect().top <= 0 && (i === len-1 || h2s[i+1].getBoundingClientRect().top > 40)) {
              let article
              my.config[index].isfixed = false
              if (!my.config[i].isfixed) {
                if(i == len -1) {
                  article = $(my.config[i].element).parents('article')
                }else {
                  article = $(my.config[i+1].element).parents('article')
                }
                titleEle.remove()
                article.append(my.config[i].html)
                my.config[i].isfixed = true
                index = i
              }
            }else if((h2s[i].getBoundingClientRect().top <= 0 && h2s[i+1].getBoundingClientRect().top > 0 && h2s[i+1].getBoundingClientRect().top <= 40) || my.getScrollTop() < my.getElementTop(h2s[0])) {
              titleEle.remove()
            }
          }
        })
      },

      //获取元素在页面中的所在位置高度
      getElementTop(element) {
        let actualTop = element.offsetTop
        let current = element.offsetParent
        while (current) {
          actualTop += current.offsetTop
          current = current.offsetParent
        }
        return actualTop
      },

      //获取当前页面滚动的高度
      getScrollTop() { 
        let scrollTop = 0
        const selfScrollTop = document.documentElement.scrollTop
        if(document.documentElement && selfScrollTop) {
          scrollTop = selfScrollTop
        }else if(document.body) {
          scrollTop = document.body.scrollTop
        }
        return scrollTop 
      }
    }
    return my

  })()

  /*********************************************************
  * @descripton 工具类方法
  **********************************************************/
  const NTES = (($) => {

    const my = {
      // 获取新闻的链接
      getUrl: (data) => {
        const newsLink = {
          "doc": (data) => {
            const { id } = data
            let url = `http://c.m.163.com/news/a/${id}.html?from=special`
            if(NTUI.isNewsapp) {
              url = `newsapp://doc/${id}`
            }
            return url
          },
          "photoset": (data) => {
            const { id } = data
            const channelid = id.split('|')[0].slice(4)
            const setid = id.split('|')[1]
            let url = `http://c.m.163.com/news/p/${channelid}/${setid}.html?from=special`
            if(NTUI.isNewsapp) {
              url = `newsapp://photo/${channelid}/${setid}`
            }
            return url
          },
          "video": (data) => {
            const { id } = data
            let url = `http://c.m.163.com/news/v/${id}.html?from=special`
            if(NTUI.isNewsapp) {
              url = `newsapp://video/${id}`
            }
            return url
          },
          "live": (data) => {
            const { id } = data
            let url = `http://c.m.163.com/news/l/${id}.html?from=special`
            if(NTUI.isNewsapp) {
              url = `newsapp://live/${id}`
            }
            return url
          },
          "qa": (data) => {
            const { id } = data
            let url = `http://c.3g.163.com/nc/qa/newsapp/question.html?id=${id}&from=special`
            if(NTUI.isNewsapp) {
              url = `newsapp://expert/${id}`
            }
            return url
          },
          "subject": (data) => {
            const { id } = data
            let url = `http://c.3g.163.com/nc/qa/newsapp/topic.html?id=${id}&from=special`
            if(NTUI.isNewsapp) {
              url = `newsapp://subject/${id}`
            }
            return url
          },
          "special": (data) => {
            const { id } = data
            let url = `http://c.m.163.com/news/l/${id}.html?from=special`
            if(NTUI.isNewsapp) {
              url = `newsapp://topic/${id}`
            }
            return url
          },
          "link": (data) => {
            const {id} = data
            return id
          }
        }
        const getNewsLink = (data) => { 
          return newsLink[data.type](data)
        }

        return getNewsLink(data)
      },

      gallery: () => {
        const photoCtrls = $('.m-main-img .gallery').find('li')
        photoCtrls.eq(0).addClass('active')
        const gallerySlide = new NTUI.slide($('.m-main-img .gallery')[0], {
          onTouchEnd: (e, cp) => {
            photoCtrls.removeClass('active')
            photoCtrls[cp].className = 'active'
          }
        })
      },

      /**
      * @descripton json数据顺序化方法
      * @param 需要整合的各类型数组
      */
      jsonSort: (...datas) => {
        let dataArray = []
        let data_len = null
        datas.forEach((data) => {
          data_len = data.length
          while(data_len--) {
            dataArray.push(data[data_len])
          }        
        })

        dataArray.sort((a, b) => {
          return ((a.index || 1) - (b.index || -1))
        })     

        return dataArray
      },

      //pk 投票提交
      pkVote: () => {
        $('.progress-wrap').delegate('.vote-logo','click',function() {
          const _voteid = $(this).data('voteid')
          const _voteoptionid = $(this).data('voteoptionid')
          const url = `http://vote.3g.163.com/vote2/mobileVote.do?vote${_voteid}=${_voteoptionid}&voteId=${_voteid}`
          const numHolder = $(this).parents('.vote').find('p')
          numHolder[0].textContent = +numHolder.text() + 1
          NTUI.importJs(url)
          $(this).parents('.progress-wrap').off('click')
          $(this).addClass('active')
          NTES.showWin('支持成功')
        })
      },

      // 投票
      voteOption: () => {
        // 单选
        $('.vote-options-view li').on('click', '[data-id]', function(e) {
          $(this).addClass('selected')
          const dataVoteid = $(this).data('voteid')
          const dataId = $(this).data('id')
          const sdataType = $(this).parent().data('datetype')
          let url = `http://vote.3g.163.com/vote2/mobileVote.do?vote${dataVoteid}=${dataId}&voteId=${dataVoteid}`
          if(sdataType == 0) {
            NTUI.importJs(url)  // 提交投票
          }else {
            NTES.showWin("投票已结束")
          }
          NTES.voteBehavior(this)
        })

        // 多选投票
        const multipleOpt = $('.vote-area')
        multipleOpt.on('click', '.submit-vote-btn', function(){
          let optIds = []
          let optIdsString = ''
          const votetype = $(this).data('votetype')
          const voteoptionid = $(this).data('voteoptionid')
          const datetype = $(this).data('datetype')
          if(votetype) {
            multipleOpt.find('input').forEach((item) => {
              if($(item).attr('checked')) {
                optIds.push($(item).parents('li').data('id'))
              }
            })
            optIdsString = optIds.join(',')
            const voteid = $(this).data('voteid')
            const url = `http://vote.3g.163.com/vote2/mobileVote.do?vote${voteid}=${optIdsString}&voteId=${voteid}`
          }
          if(voteoptionid || optIds.length) {
            if(!datetype) {
              NTUI.importJs(url)  //提交投票
            }else {
              NTES.showWin('投票已结束')
            }
            NTES.voteBehavior(this)
            $(this).hide()  //隐藏按钮 
          }
        })
      },

      // 画廊
      circleSlider: (elem) => {
        if(elem.find('li').length < 2) return
        const photoCtrls = elem.find('.ctrls .dot')
        const gallerySlide = new NTUI.slide(elem.find('.gallery')[0], {
          onTouchEnd: function(e, cp) {
            photoCtrls.removeClass('on')
            photoCtrls.eq(cp).addClass('on')
          }
        })
      },

      // 投票或提交等的弹出框
      showWin: (m) => {
        let popWin = $('.m-vote-model')
        if(!popWin) {
          popWin = document.createElement('div')
          popWin.className = 'm-vote-model'
          document.body.insertBefore(popWin, null)
          popWin = $(popWin)
        }
        popWin.html(m).css({display:'block'}).addClass("anim-login")
        setTimeout(() => {
          if(popWin) {
            popWin.remove()
            popWin = null
          }
        },2800)
      },
  
      voteble: (elem) => {
        return elem ? '  投票已结束' : '  投票进行中'
      },

      //获取投票结果
      voteBehavior: (tObj) => {
        const voteid = tObj.dataset.voteid
        NTUI.importJs(`http://c.3g.163.com/nc/jsonp/vote/result/${voteid}.html`)
        window.vote_result = (data) => {
          let voteResultContent = ''
          let targetReplaceElem = ''
          for(let i = 0,len = data.voteitem.length; i < len; i++) {
            var dataCache = data.voteitem[i]
            const sNum = data.sumnum
            voteResultContent += NTUI.simpleParse(TPL.voteResult, {
              name: `${i + 1}.${dataCache.name}`,
              percent: my.getRate(dataCache.num, sNum),
              percent2more: my.getRate(dataCache.num, sNum) + 2
            })
          }
          voteResultContent = `<ul class="vote-result-view">${voteResultContent}</ul>`
          if(tObj.classList.contains('submit-vote-btn')) {
            targetReplaceElem = '.vote-multipleOpt-view'
          }else {
            targetReplaceElem = '.vote-options-view'
          }
          $(tObj).parents('.vote-area').find(targetReplaceElem).replaceWith(voteResultContent)
        }
      },
  
      /**
       * [获取百分比]
       * @param  {[type]} target [description]
       * @param  {[type]} summon [description]
       */
      getRate: (target, summon) => {
        return summon ? Math.round((target / summon) * 100) : 0
      },
    }

    return my;
   
  })($)

  /******************************************************************
  * @descripton 界面渲染类方法（策略模式）
  *******************************************************************/
  const RENGUI = (($) => {
    const my = {
      //模块验证输出对象
      ModuleValidator: {
        config: {
          banner: "banner",
          img: "img",
          webviews: "webviews",
          photoset: "photoset",
          video: "video",
          imgnews: "imgnews",    
          news: "news",
          vote: "vote",
          PK: "PK",
          timeline: "timeline",
          circle: "circle",
          special: "special",
          activity: "activity",        
        },

        //模块渲染主入口
        validate: function(data, tIndex) {
          const type = this.config[data.type]
          const checker = this.types[type]
          let contentHtml = null
          if(!type) return
          if(!checker) {
            throw {
              name: 'ValidationError',
              message: `No handler to validate type${type}`
            }
          }
          contentHtml += checker.validate(data, tIndex)
        },

        //模块具体渲染函数
        types: {
          banner: {
            validate: (data, tIndex) => {
              let url = null
              let newsappTip = ''
              if (data.sdocid) {
                url = NTES.getUrl({
                  type: 'doc', 
                  id: data.sdocid
                })
              } else if (data.sid) {
                url = NTES.getUrl({
                  type: 'special', 
                  id: data.sid
                })
              }
              if (data.photoset) {
                newsappTip = `
                  <a class="open-newsapp-tip" data-stat="specialTipBar" href="http://m.163.com/newsapp/applinks.html?pid=${data.photoset.split('|')[0].slice(4)}_${data.photoset.split('|')[1]}&s=sps">
                    打开网易新闻，查看更多图集
                  </a>
                `
              }
              const mustach = data.digest ? TPL.banner : TPL.liveBanner
              bodyContent.content += NTUI.simpleParse(mustach, {
                url: url, 
                banner: data.banner, 
                digest: data.digest,
                newsappTip: newsappTip
              })

              return true
            }
          },
          img: {
            validate: (data, tIndex) => {
              const width = $('body').width()
              if(!data.headpics || data.headpics.length <= 1) {
                let newsappTip = ''
                let url = NTES.getUrl({
                  type: 'doc', 
                  id: data.sdocid
                })
                if (data.tag == 'photoset') {
                  url = NTES.getUrl({
                    type: 'photoset', 
                    id: data.photoset
                  })
                  newsappTip = `
                    <a class="open-newsapp-tip" data-stat="specialTipBar" href="http://m.163.com/newsapp/applinks.html?pid=${data.photoset.split('|')[0].slice(4)}_${data.photoset.split('|')[1]}&s=sps">
                      打开网易新闻，查看更多图集
                    </a>
                  `
                }
                bodyContent.content += NTUI.simpleParse(TPL.mainImg, {
                  url: url,
                  sname: data.sname,
                  imgsrc: utils.optImage(data.imgsrc, width),
                  digest: data.digest,
                  newsappTip: newsappTip
                })
              }else {
                let _headpicHtml = ''
                let _ctrlHtml = ''
                data.headpics.forEach((item) => {
                  let url = NTES.getUrl({
                    type: item.tag, 
                    id: item.url
                  })
                  _headpicHtml += NTUI.simpleParse (
                    `<div class="imgwrapper">
                    <a class="mainshow" href="<#=url#>">
                      <img src="<#=imgsrc#>" width="100%">
                    </a>
                    <h1><#=sname#></h1>
                    </div>`,{url: url, imgsrc: item.imgsrc, sname: item.title})
                  _ctrlHtml += '<li></li>' 
                })
                bodyContent.content += NTUI.simpleParse(TPL.mainImgWithAd, {
                  digest: data.digest, 
                  imgHtml: _headpicHtml, 
                  ctrlHtml: _ctrlHtml
                })
              }
              return true
            }
          },
          webviews: {
            validate: (data, tIndex) => {
              let webviewsContent = ''
              data.webviews.forEach((item) => {
                webviewsContent += NTUI.simpleParse(TPL.webview, {
                  url: item.url,
                  pic: item.pic,
                  title: item.title
                })
              })
              bodyContent.content += `<div class="m-active-nav">${webviewsContent}</div>`
              return true
            }
          },   
          photoset: {
            validate: (data, tIndex) => {
              let thisContent = ''
              data.docs.forEach((item) => {
                let url = `http://c.m.163.com/news/p/${item.channelid}/${item.setid}.html?from=special`
                if(NTUI.isNewsapp) {
                  url = `newsapp://photo/${item.channelid}/${item.setid}`
                }
                thisContent += NTUI.simpleParse(TPL.albumList, {
                  url: url,
                  cover: utils.optImage(item.cover, 347),
                  title: item.title
                })
              })
              $('#indexPhoto li').html(thisContent)

              bodyContent.content += `
                <article class="m-news" type="${data.type}" id="${data.shortname}">
                  <h2><span class="red">${data.index}</span>/${tIndex} ${data.tname}</h2>
                  <div class="gallery">${thisContent}</div>
                </article>`
              return true
            }
          },
          video: {
            validate: (data, tIndex) => {
              let thisContent = ''
              data.docs.forEach((item) => {
                const imgurl = utils.optImage(item.cover, 347)
                const _url = NTES.getUrl({
                  type: 'video', 
                  id: item.vid
                })
                thisContent += NTUI.simpleParse(TPL.videoList, {
                  imgsrc: imgurl,
                  title: item.title,
                  url: _url
                })
              })
              bodyContent.content += `
                <article class="m-news" type="${data.type}" id="${data.shortname}">
                  <h2><span class="red">${data.index}</span>/${tIndex} ${data.tname}</h2>
                  <div class="video-area">${thisContent}</div>
                </article>`
              return true
            }
          },
          imgnews: {
            validate: (data, tIndex) => {
              let imgNewsContent = ''
              if (data.docs) {
                data.docs.forEach((item) => {
                  let url = NTES.getUrl({
                    type: 'doc', 
                    id: item.docid
                  })

                  let userCount = null
                  if(item.replyCount > 10000) {
                    userCount = utils.forDight(item.replyCount / 10000, 1) + '万'
                  }else {
                    userCount = item.replyCount
                  }

                  let replyTemp = `<span class="join">${userCount || 0}跟贴</div>`
                  //判断skipType
                  if(!!item.skipType) {
                    url = NTES.getUrl({
                      type: item.skipType, 
                      id: item.skipID
                    })
                  }
                  // 大图模式
                  if(item.imgType && item.imgType == 1) {
                    if (item.skipType == 'live') {
                      if (!utils.isOwnEmpty(item.live_info)) {
                        const tag = item.TAG
                        const date = new Date()
                        const day = date.getDate()

                        let userCount = null
                        if(item.live_info.user_count > 10000) {
                          userCount = utils.forDight(item.live_info.user_count / 10000, 1) + '万'
                        }else {
                          userCount = item.live_info.user_count
                        }

                        let playDate = null
                        const _day = +item.live_info.start_time.split('-')[2].split(' ')[0]
                        const playTime =  _day - day
                        if(playTime == 0) {
                          playDate = '今天'
                        }else if(playTime == 1) {
                          playDate = '明天'
                        }else if(playTime == 2) {
                          playDate = '后天'
                        }else {
                          playDate = item.live_info.start_time.split(' ')[0]
                        }

                        let advance = tag == '直播预告' ? `<span class="join">${playDate}${item.live_info.start_time.slice(-8,-3)}</span> <span class="advance">${tag}</span>` : `<span class="join">${userCount}人参与</span> <span class="playBack">${tag}</span>`
                        let playHtml = item.TAGS.split(' ')[1] ? '<span class="playIcon"></span>' : ''
                        replyTemp = `${advance}${playHtml}`
                      } else {
                        replyTemp = `<span class="live">LIVE</div>`
                      }
                    } else if (item.skipType == 'video') {
                      replyTemp = `<span class="playIcon"></span>`
                    }
                    imgNewsContent += NTUI.simpleParse(TPL.bigImgNewsList, {
                      url: url,
                      title: item.title,
                      replyCount: replyTemp,
                      img: utils.optImage(item.imgsrc, 710)
                    })
                  } else {
                    if (item.imgextra) {
                      imgNewsContent += NTUI.simpleParse(TPL.imgNewsSet, {
                        url: url,
                        title: item.title,
                        replyCount: replyTemp,
                        img1: utils.optImage(item.imgsrc, 228, 170),
                        img2: utils.optImage(item.imgextra[0].imgsrc, 228, 170),
                        img3: utils.optImage(item.imgextra[1].imgsrc, 228, 170)
                      })
                    }else if (item.skipType == 'live') {
                      const tag = item.TAG
                      const date = new Date()
                      const day = date.getDate()

                      let userCount = null
                      if (utils.isOwnEmpty(item.live_info)) {
                        return false
                      }
                      if(item.live_info.user_count > 10000) {
                        userCount = utils.forDight(item.live_info.user_count / 10000, 1)
                      }else {
                        userCount = item.live_info.user_count
                      }

                      let playDate = null
                      const _day = +item.live_info.start_time.split('-')[2].split(' ')[0]
                      const playTime =  _day - day
                      if(playTime == 0) {
                        playDate = '今天'
                      }else if(playTime == 1) {
                        playDate = '明天'
                      }else if(playTime == 2) {
                        playDate = '后天'
                      }else {
                        playDate = item.live_info.start_time.split(' ')[0]
                      }

                      let advance = tag == '直播预告' ? `<span class="join">${playDate}${item.live_info.start_time.slice(-8,-3)}</span> <span class="advance">${tag}</span>` : `<span class="join">${userCount}万人参与</span> <span class="playBack">${tag}</span>`
                      let playHtml = item.TAGS.split(' ')[1] ? '<span class="playIcon"></span>' : ''
                      replyTemp = `${advance}${playHtml}`
                      imgNewsContent += NTUI.simpleParse(TPL.imgNewsList, {
                        url: url,
                        title: item.title,
                        replyCount: replyTemp,
                        // digest: item.digest,
                        imgsrc: utils.optImage(item.imgsrc, 204, 153)
                      }) 
                    }else {
                      if (!item.replyCount) {
                        replyTemp = ''
                      }
                      if (item.skipType == 'subject') {
                        replyTemp = `<span class="topic">话题</span>`
                      }
                      imgNewsContent += NTUI.simpleParse(TPL.imgNewsList, {
                        url: url,
                        title: item.title || '',
                        replyCount: replyTemp,
                        digest: item.digest,
                        imgsrc: utils.optImage(item.imgsrc, 204, 153)
                      })
                    }
                  }
                })
              }
              bodyContent.content += `
                <article class="m-news" type="${data.type}" id="${data.shortname}">
                  <h2><span class="red">${data.index}</span>/${tIndex}  ${data.tname}</h2>
                  <ul class="m-news-wrap">${imgNewsContent}</ul>
                </article>`

              return true
            }
          }, 
          news: {
            validate: (data, tIndex) => {
              let newsContent = ''
              data.docs.forEach((item) => {
                let url = NTES.getUrl({
                  type: 'doc', 
                  id: item.docid
                })

                let userCount = null
                if(item.replyCount > 10000) {
                  userCount = utils.forDight(item.replyCount / 10000, 1) + '万'
                }else {
                  userCount = item.replyCount
                }

                let replyTemp = item.replyCount ? `<span class="join">${userCount}跟贴</span>` : ''
                if (item.skipType) {
                  url = NTES.getUrl({
                    type: item.skipType, 
                    id: item.skipID
                  })
                }
                newsContent += NTUI.simpleParse(TPL.newsList, {
                  url: url,
                  title: item.title,
                  replyCount: replyTemp,
                  digest: item.digest,
                  imgsrc: item.imgsrc,
                  lmodify: item.lmodify ? utils.formatTime(item.lmodify) : ''
                })
              })
              bodyContent.content += `
                <article class="m-news" type="${data.type}" id="${data.shortname}">
                  <h2><span class="red">${data.index}</span>/${tIndex}  ${data.tname}</h2>
                  ${newsContent}
                </article>`

              return true
            }
          },
          map: {
            validate: (data, tIndex) => {
              debugger
              bodyContent.content += `
                <article class="m-news" type="${data.type}" id="${data.shortname}">
                  <h2><span class="red">${data.index}</span>/${tIndex}  ${data.tname}</h2>
                  <div class="map-wrapper">
                    <div id="iCenter${data.index}" class="i-center" style="position: absolute;"></div>
                  </div>
                </article>
              `
              return true
            }
          },
          vote: {
            validate: (data, tIndex) => {
              let thisContent = ''
              data.docs.forEach((itemDoc) => {
                let dataCache = itemDoc
                let startVoteContent = ''
                if(itemDoc.option_type === 0) {
                  if (itemDoc.date_type === 1) {
                    itemDoc.voteitem.forEach((item, index) => {
                      const sNum = itemDoc.sumnum
                      startVoteContent += NTUI.simpleParse(TPL.voteResult, {
                        name: `${index + 1}.${item.name}`,
                        percent: NTES.getRate(item.num, sNum),
                        percent2more: NTES.getRate(item.num, sNum) + 2
                      })
                    })
                    startVoteContent = `<ul class="vote-result-view">${startVoteContent}</ul>`
                  } else {
                    itemDoc.voteitem.forEach((item, index) => {
                      startVoteContent += NTUI.simpleParse(TPL.voteOption, {
                        id: item.id,
                        name: `${index + 1}.${item.name}`,
                        voteid: itemDoc.voteid
                      })
                    })
                    startVoteContent = `<ul class="vote-options-view" data-dateType="${itemDoc.date_type}" data-voteType="${itemDoc.option_type}">${startVoteContent}</ul>`
                  }
                  
                  thisContent += `
                    <div class="vote-area">
                      <div class="vote-title">
                        <h3><span>${itemDoc.question}</span> <span class="tag">单选</span></h3>
                        <div class="vote-info"><p>${itemDoc.date + NTES.voteble(itemDoc.date_type)}</p><span>${itemDoc.sumnum}人</span> </div>
                      </div>
                      ${startVoteContent}
                    </div>
                  `
                }

                // 多选
                if(dataCache.option_type === 1) {
                  if (itemDoc.date_type === 1) {
                    itemDoc.voteitem.forEach((item, index) => {
                      const sNum = itemDoc.sumnum
                      startVoteContent += NTUI.simpleParse(TPL.voteResult, {
                        name: `${index + 1}.${item.name}`,
                        percent: NTES.getRate(item.num, sNum),
                        percent2more: NTES.getRate(item.num, sNum) + 2
                      })
                    })
                    startVoteContent = `<ul class="vote-result-view">${startVoteContent}</ul>`
                  } else {
                    itemDoc.voteitem.forEach((item, index) => {
                      startVoteContent += NTUI.simpleParse(TPL.voteMultiple, {
                        name: `${index + 1}.${item.name}`,
                        oid: `id${item.id}`,
                        id: item.id
                      })
                    })
                    startVoteContent = `<ul class="vote-multipleOpt-view" data-dateType="${itemDoc.date_type}" data-voteType="${itemDoc.option_type}">${startVoteContent}</ul><div class="submit-vote-btn" data-voteid="${itemDoc.voteid}" data-voteType="${itemDoc.option_type}"  data-dateType="${itemDoc.date_type}">提交</div>`
                  }
                  thisContent += `
                    <div class="vote-area">
                      <div class="vote-title">
                        <h3><span>${itemDoc.question}</span> <span class="tag">多选</span></h3>
                        <div class="vote-info"><p>${itemDoc.date + NTES.voteble(itemDoc.date_type)}</p><span>${itemDoc.sumnum}人</span></div>
                      </div>
                      ${startVoteContent}
                    </div>
                  `
                }
              })
              bodyContent.content += `
                <article class="m-news" type="${data.type}" id="${data.shortname}">
                  <h2><span class="red">${data.index}</span>/${tIndex}  ${data.tname}</h2>
                  <section class="vote-view">${thisContent}</section>
                </article>
              `
              return true
            }
          },
          PK: {
            validate: (data, tIndex) => {
              let pkContent = ''
              let pkProgress = ''
              data.docs.forEach((item) => {
                if(item.option_type === 0) {
                  const affirmative = item.voteitem[0]
                  const negative = item.voteitem[1]
                  // 正方观点
                  pkContent += NTUI.simpleParse(TPL.PKAffirmative, {
                    name: affirmative.name
                  })

                  const _zWidth = utils.forDight(affirmative.num / item.sumnum, 2) * 100 + '%' || '50%'
                  const _fWidth = utils.forDight(negative.num / item.sumnum, 2)  * 100 + '%' || '50%'

                  pkProgress += NTUI.simpleParse(TPL.PKProgress, {
                    voteid: item.voteid,
                    voteOptionId: affirmative.id,
                    num: affirmative.num,
                    style: 'affirmative'
                  })

                  pkContent += `<div class="pk-logo"></div>`
                  pkProgress += `<div class="progress-bar"><span class="affirmative" style="width: ${_zWidth}"></span><span class="negative" style="width: ${_fWidth}"></span></div>`
                  // 反方观点
                  pkContent += NTUI.simpleParse(TPL.PKNegative, {
                    name: negative.name
                  })

                  pkProgress += NTUI.simpleParse(TPL.PKProgress, {
                    voteid: item.voteid,
                    voteOptionId: negative.id,
                    num: negative.num,
                    style: 'negative'
                  })
                }
              })
              bodyContent.content += `
                <article class="m-news" type="${data.type}" id="${data.shortname}">
                  <h2><span class="red">${data.index}</span>/${tIndex}  ${data.tname}</h2>
                  <div class="pk-bar">${pkContent}</div>
                  <div class="progress-wrap">${pkProgress}</div>
                </article>
              `
              return true
            }
          },

          timeline: {
            validate: (data, tIndex) => {
              const docSize = data.docs.length
              let timelineContainer = ''
              let index = 0
              let moreBtn = ''

              data.docs.forEach((item) => {
                let timelineNewsContent = ''
                let dateTitle = ''
                let dateHtml = ''
                let url = NTES.getUrl({
                  type: 'doc', 
                  id: item.docid
                })

                dateTitle = `
                  <dt>
                    <div class="point-icon">
                      <span></span>
                    </div>
                  </dt>
                `

                dateHtml = index == 0 ? `<p><span class="red">最新</span></p>` : `<p><span>${item.ptime.slice(5,10)}</span><span>${item.ptime.slice(11,16)}</span></p>`

                if(item.imgextra) {
                  timelineNewsContent += NTUI.simpleParse(TPL.timelineImagesList, {
                    url: url,
                    title: item.title,
                    img1: item.imgsrc,
                    img2: item.imgextra[0].imgsrc,
                    img3: item.imgextra[1].imgsrc
                  })
                }else if(item.imgsrc) {
                  timelineNewsContent += NTUI.simpleParse(TPL.timelineDigestImages, {
                    url: url,
                    title: item.title,
                    replyCount: item.replyCount,
                    digest: item.digest,
                    imgsrc: item.imgsrc
                  })
                }else {
                  timelineNewsContent += NTUI.simpleParse(TPL.timelineSimple, { 
                    url: url,
                    title: item.title,
                    replyCount: item.replyCount,
                    digest: item.digest,
                    imgsrc: item.imgsrc
                  })
                }

                if(index <= 2) {
                  timelineContainer +=`<div class="item-wrap">${dateHtml}<dl class="timeline-item">${dateTitle}${timelineNewsContent}</dl></div>`
                }else{
                  if(index == 3) {
                    timelineContainer += `<div class="timeline-item-hidden"><div class="item-wrap">${dateHtml}<dl class="timeline-item">${dateTitle}${timelineNewsContent}</dl></div>`
                  }else if(index == docSize-1){
                    timelineContainer += `<div class="item-wrap">${dateHtml}<dl class="timeline-item">${dateTitle}${timelineNewsContent}</dl></div></div>`
                  }else{
                    timelineContainer +=`<div class="item-wrap">${dateHtml}<dl class="timeline-item">${dateTitle}${timelineNewsContent}</dl></div>`
                  }
                }
                index++ 
              })
              moreBtn = docSize > 2 ? '<div class="more-news-btn">更多</div>' : ''
              bodyContent.content += `
                <article class="m-news" type="${data.type}" id="${data.shortname}">
                  <h2><span class="red">${data.index}</span>/${tIndex}  ${data.tname}</h2>
                  <section class="timeline-holder">${timelineContainer+moreBtn}</section>
                </article>
              `
              return true
            }
          },

          circle: {
            validate: (data, tIndex) => {
              let circleContent = ''
              let ctrlsHtml = ''
              const _width = $('body').width()
              const size = data.docs.length
              for(let i = 0; i < size; i++) {
                const imgsrc = utils.optImage(data.docs[i].imgsrc, _width)
                circleContent += NTUI.simpleParse(TPL.circle, {
                  url: data.docs[i].url, 
                  imgsrc: imgsrc
                })
                if(size > 1) {
                  ctrlsHtml += i ? '<span class="dot"></span>' : '<span class="dot on"></span>'
                }
              }
              ctrlsHtml = size > 1 ? `<div class="ctrls">${ctrlsHtml}</div>` : ''
              bodyContent.content += `
                <article class="m-news" type="circle" id="${data.shortname}">
                  <h2><span class="red">${data.index}</span>/${tIndex}  ${data.tname}</h2>
                  <div class="circle-list"><div class="gallery">
                    <ul class="clearfix">${circleContent}</ul>
                    </div>${ctrlsHtml}
                  </div>
                </article>
              `
              return true
            }
          },
          
          special: {
            validate: (data, tIndex) => {
              let specialContent = ''
              data.docs.forEach((item) => {
                specialContent += NTUI.simpleParse(TPL.special, {
                  specialID: item.specialID, 
                  sname: item.sname, 
                  digest: item.digest
                })
              })
              bodyContent.content += `
                <article class="m-news" type="special" id="${data.shortname}">
                  <h2><span class="red">${data.index}</span>/${tIndex}  ${data.tname}</h2>
                  <div class="special-list"><ul class="clearfix m-news-wrap">${specialContent}</ul></div>
                </article>
              `
              return true
            }
          },

          activity: {
            validate: (data, tIndex) => {
              let activityContent = ''
              data.docs.forEach((item) => {
                activityContent += NTUI.simpleParse(TPL.activity, {
                  url: item.url, 
                  imgsrc: utils.optImage(item.imgsrc, 344, 178)
                })
              })
              bodyContent.content += `
                <article class="m-news" type="activity" id="${data.shortname}">
                  <h2><span class="red">${data.index}</span>/${tIndex}  ${data.tname}</h2>
                  <div class="activity-list"><ul class="clearfix">${activityContent}</ul></div>
                </article>
              `
              return true
            }
          },
        }
      },

      //html页面渲染
      displayHTML: (eleStr,htmls) => {
        $(eleStr).append(htmls)  //分段输出
        htmls = ''
        return htmls
      },
    }

    return my

  })($)

  /******************************************************************
  * @descripton 模板引擎
  *******************************************************************/
  const TPL = (($) => {
    const my = {
      liveBanner:  `
        <div class="mainshow-wrapper">
          <a class="mainshow" href="<#=url#>"><img width="100%" src="<#=banner#>"></a>
          <#=newsappTip#>
        </div>
      `,
      banner: `
        <div class="mainshow-wrapper">
          <a class="mainshow" href="<#=url#>"><img width="100%" src="<#=banner#>"></a>
          <#=newsappTip#>
          <p class="digest"><#=digest#></p>
        </div>
      `,

      mainImg: `
        <div class="m-main-img">
          <div class="imgwrapper">
            <a class="mainshow" href="<#=url#>"><img src="" data-echo="<#=imgsrc#>" width="100%"></a>
            <h1><#=sname#></h1>
          </div>
          <#=newsappTip#>
          <p class="digest"><#=digest#></p>
        </div>
      `,

      mainImg2: ` 
        <div class="imgwrapper">
          <a class="mainshow" href="<#=url#>"><img src="" data-echo="<#=imgsrc#>" width="100%"></a>
          <h1><#=sname#></h1>
        </div>
      `,

      // banner轮播图
      mainImgWithAd: `
        <div class="m-main-img">
          <div class="gallery">
            <div class="clearfix"><#=imgHtml#></div>
            <ul class="ctrls"><#=ctrlHtml#></ul>
          </div>
          <p class="digest"><#=digest#></p>
        </div>
      `,

      webview: `
        <a href="<#=url#>">
          <img src="" data-echo="<#=pic#>">
          <span><#=title#></span>
        </a>
      `,

      albumList: `
        <div class="gallery-item">
          <a class="img-wrapper" href="<#=url#>"><img src="" data-echo="<#=cover#>"></a>
          <p><#=title#></p>
        </div>
      `, //图集模板

      videoList: ` 
        <a class="b-video" href="<#=url#>">
          <div class="b-img" style="background-image:url(http://img1.cache.netease.com/3g/img11/3gtouch13/imglist.png);" data-echo-background="<#=imgsrc#>"></div>
          <p class="ttl"><#=title#></p>
          <span class="play-btn"></span>
        </a>
      `, //视频模板

      imgNewsList: `
        <li class="news-list">
          <a  href="<#=url#>">
            <div class="news-img" style="background-image:url(http://img1.cache.netease.com/3g/img11/3gtouch13/imglist.png);" data-echo-background="<#=imgsrc#>"></div>
            <div class="news-wrap">
              <div class="news-title"><#=title#></div>
              <p class="news-desc"><#=digest#></p>

              <div class="newsTips">
                <#=replyCount#>
              </div>
            </div>
          </a>
        </li>
      `, //小图图文新闻

      bigImgNewsList: `
        <li class="big-img-news">
          <a href="<#=url#>">
            <p class="newsTitle"><#=title#></p>
            <div class="cover" style="background-image:url(http://img1.cache.netease.com/3g/img11/3gtouch13/imglist.png);" data-echo-background="<#=img#>"></div>
          </a>
          <div class="newsTips"><#=replyCount#></div>
        </li>
      `, // 新增大图新闻

      imgNewsSet: ` 
        <li class="newsHead multiImg">
          <a href="<#=url#>">
            <p class="newsTitle"><#=title#></p>
            <div class="img-box">
              <img src="" data-echo="<#=img1#>">
              <img src="" data-echo="<#=img2#>">
              <img src="" data-echo="<#=img3#>">
            </div>
            <div class="newsTips">
              <#=replyCount#>
            </div>
          </a>
        </li>
      `, //图文新闻_图集

      newsList: `
        <ul class="comment-item">
          <li class="newsHead ">
            <a href="<#=url#>">
              <div class="newsTitle">
                <#=title#>
              </div>
              <div class="public-info">
                <span class="time"><#=lmodify#></span>
                <span class="post-num"><#=replyCount#></span>
              </div>
            </a>
          </li>
        </ul>
      `,  //文字新闻

      timelineDigestImages: `
        <dd>
          <a href="<#=url#>">
            <h3><#=title#></h3>
            <div class="n-list newslist-digest">
              <img src="" data-echo="<#=imgsrc#>">
              <p><#=digest#></p>
            </div>
          </a>
        </dd>
      `,
      //sdfs
      timelineImagesList: `
        <dd>
          <a href="<#=url#>">
            <h3><#=title#></h3>
            <div class="n-list newslist-images">
              <img src="" data-echo="<#=img1#>">
              <img src="" data-echo="<#=img2#>">
              <img src="" data-echo="<#=img3#>">
            </div>
          </a>
        </dd>
      `,

      timelineTitle: `
        <dd>
          <a href="http://3g.163.com/touch">
            <h3 class="n-list"><#=title#></h3>
          </a>
        </dd>
      `,

      timelineSimple: `
        <dd>
          <a href="<#=url#>">
            <h3><#=title#></h3>
            <div class="n-list">
              <p><#=digest#></p>
            </div>
          </a>
        </dd>
      `,

      PKAffirmative: `
        <div class="affirmative">
          <h3>红方观点</h3>
          <p><#=name#></p>
        </div>
      `,

      PKProgress: `
        <div class="vote <#=style#>">
          <div class="vote-logo" data-voteId="<#=voteid#>" data-voteOptionId="<#=voteOptionId#>"></div> 
          <p><#=num#></p>
        </div>
      `,

      PKNegative: `
        <div class="negative">
          <h3>蓝方观点</h3>
          <p><#=name#></p>
        </div>
      `,

      voteOption: `<li data-id="<#=id#>" data-voteid="<#=voteid#>" ><#=name#></li>`,

      voteResult: `
        <li>
          <p><#=name#></p>
          <div class="view-bar">
            <span style="width:<#=percent#>%"></span>
            <div class="num-count" style="left:<#=percent2more#>%"><#=percent#>%</div>
          </div>
        </li>
      `,

      voteMultiple: `
        <li data-id="<#=id#>">
          <label for="<#=oid#>"> <input type="checkbox" name="<#=id#>" id="<#=oid#>" /> <#=name#> </label>
        </li>
      `,

      circle: `<li><a href="<#=url#>"><img src="" data-echo="<#=imgsrc#>"></a></li>`,

      //专题
      special: `
        <li class="newsHead">
          <a href="http://c.m.163.com/news/s/<#=specialID#>.html?from=special">
            <p class="newsTitle"><#=sname#></p>
            <span class="special">专题</span>
          </a>
        </li>
      `,

      // 活动
      activity: `
        <li>
          <a href="<#=url#>">
            <div class="active-img" style="background-image:url(http://img1.cache.netease.com/3g/img11/3gtouch13/imglist.png);" data-echo-background="<#=imgsrc#>"></div>
          </a>
        </li>
      `

    }

    return my
  })($)

  let bodyContent = {}
  bodyContent.content = ''  //页面内容变量

  // 调用接口专题数据接口 同客户端
  $.ajax({ 
    type: 'get',
    url: `http://c.3g.163.com/nc/special/${sid}.html?callback=mainFunc`,
    dataType: 'jsonp'
  })

  window.mainFunc = (data) => {
    const dataCache = data[sid]
    let newDataArray = {}
    let videoPosters = []

    // share component
    {
      const sid = NTUI.getParameter('sid')
      const spss = NTUI.getParameter('s') || 'newsapp'
      let w = +NTUI.getParameter('spsw')
      let url = `${window.location.origin}${location.pathname}?s=${spss}`

      if(w) {
        w++
        url += `&w=${w}`
      } else {
        url += '&w=2'
      }

      share({
        title: `网易专题：${dataCache.sname}` || '',
        desc: dataCache.digest || '',
        url: url,
        img: 'http://img6.cache.netease.com/utf8/3g/touch/images/share-logo.png',
        statistics: {
          spst: 2,
          modelid: sid,
          spss: spss,
          spsw: w
        }
      })
    }

    const footer = $('.js-footer')
    if (self != top || window.frames.length != parent.frames.length) {
      footer.hide()
    } else {
      footer.show()
    }
    
    footer.on('click', function(e) {
      e.preventDefault()
      window.location.href = 'http://m.163.com/newsapp/applinks.html?s=sps&sid=' + sid 
    })

    $('title').append(dataCache.sname)
    //绘制页面bannber/img、webviews
    RENGUI.ModuleValidator.validate(dataCache)

    if(!!dataCache.webviews) {
      newDataArray = {
        type: "webviews",
        webviews: dataCache.webviews
      }
      RENGUI.ModuleValidator.validate(newDataArray)     
    }

    newDataArray = {}
    document.querySelector('.g-main-body').innerHTML = ''
    bodyContent.content = RENGUI.displayHTML('.g-main-body', bodyContent.content)

    //根据index顺序化docs
    newDataArray = NTES.jsonSort(dataCache.topics, dataCache.topicsplus, dataCache.topicslatest, dataCache.topicspatch)
    let navArray = []
    let newDataArray_len = newDataArray.length

    newDataArray.forEach((item) => {
      navArray.push(item.shortname)
      if(item.type == 'video') {
        for(let i = 0,len = item.docs.length; i < len; i++) {
          videoPosters.push(item.docs[i].cover)
        }
      }
      RENGUI.ModuleValidator.validate(item, newDataArray_len)
    })

    //导航栏加载
    if(dataCache.shownav === '1') {
      let showNavStr = ''
      for(let i = 0,len = navArray.length; i < len; i++) {
        if (i < 6) {
          if(navArray[i]) {
            showNavStr += `<a href="#${navArray[i]}">${navArray[i]}</a>`
          }
        } else if (i == 6) {
          showNavStr += `<a href="#${navArray[i]}">${navArray[i]}</a><a href="javascript:void(0);" class="more">更多</a>`
        } else {
          showNavStr += `<a href="#${navArray[i]}" class="hide">${navArray[i]}</a>`
        }
      }
      showNavStr = `<div class="m-special-nav">${showNavStr}</div>`
      if($('.m-active-nav').length) {
        $('.m-active-nav').after(showNavStr)
      }else if($('.m-main-img').length) {
        $('.m-main-img').after(showNavStr)
      }else if ($(".mainshow").length) {
        $('.mainshow-wrapper').after(showNavStr)
      }
    }

    $('.m-special-nav').on('click','.more', function() {
      $(this).siblings().removeClass('hide')
      $(this).remove()
    })

    //渲染Document DOM界面
    let RenGui = (callback) => {
      RENGUI.displayHTML('.g-main-body', bodyContent.content)
      setTimeout(callback(), 0)
    }

    //让界面动起来
    let renMapGui = () => {
      const timeLineBtn = $('.timeline-holder')
      if(timeLineBtn.length) {
        timeLineBtn.find('.more-news-btn').on('click', function(){
          timeLineBtn.find('.timeline-item-hidden').removeClass()
          $(this)[0].remove()
        })
      }
      //PK
      if($('.pk-bar').length){
        NTES.pkVote()
      }
      //选项
      NTES.voteOption()

      //画廊
      if($('.m-main-img .gallery').length){
        NTES.gallery()
      }
      
      $('.circle-list').each(function() {
        NTES.circleSlider($(this))
      })

      //视频
      $('.video-area').on('click', 'video', function() {
        this.src = this.dataset.src
        this.play()
        this.webkitEnterFullscreen()
        this.style.background = ''
      })
      const videos = $('.video-area video')
      videos.forEach((item, index) => {
        let currentId = $(item).parents('article').attr('id')

        let imgurl = null
        const _width = $('.b-video').width()
        if(currentId === '视频' || currentId === '高清视频' || currentId === '视频测试' || currentId === '态度对话') {
          imgurl = utils.optImage(videoPosters[index], _width)
          item.style.background = `url(${imgurl}) no-repeat center center`
          // item.style.backgroundSize = _width + 'px'
          item.style.backgroundSize = 'cover'
        }
      })                
    }

    RenGui(renMapGui)

    TopTitle.init()
    
    lazyload({
      offset: 0,
      throttle: 1000,
      unload: false
    })
  } 
}

