if (module && module.hot) {
  module.hot.accept()
}

import analysis from '../common/analysis'
import loading from '../common/loading'
import * as utils from '../common/utils'
import header from '../common/header'
import share from '../common/share'
import footer from '../common/footer'

require('../common/reset.css')
require('./index.less')

const search = utils.localParam().search
const id = search.id

loading()

// mapp and sps analysis
analysis({ 
  spst: 10,
  type: "article",
  modelid: id
})

// common header
document.querySelector('.m-body-wrap').insertAdjacentHTML('beforebegin', header({
  type: 'topic',
  subjectid: id
}))

// main body
{
  const ua = navigator.userAgent
  let $ = document.querySelector.bind(document)
  const id = search.id
  const talkId = search.talkid
  var initPage = () => {
    
    // 渲染页面
    utils.ajax({
      method: "GET",
      dataType: 'json',
      url: `http://c.3g.163.com/newstopic/subject/details/${id}.html`,
      success: (json)=>{
        var data = json.data
        document.title = `#${data.subject.name}#`
        
        // share component
        {
          const title = data.subject.name || ''
          const body = data.subject.description || title
          const spss = search.s || 'newsapp'
          let _url = window.location.origin + location.pathname
          let spsw = 2
          let w = +search.w
          if (w) {
            w++
            spsw = w
          }
          _url += `?id=${id}&s=${spss}&w=${spsw}`
          share({
            title: title,
            desc: body.replace(/<.*?>/g, "").replace(/(^\s*)/g, "").substr(0, 30),
            url: _url,
            img: 'http://img6.cache.netease.com/utf8/3g/touch/images/share-logo.png',
            statistics: {
              spst: 10,
              modelid: id,
              spss: spss,
              spsw: spsw
            }
          })
        }

        var bannerHtml = getBannerHtml(data.subject)
        var oneAnswerWrap = "<ul class='one-answer-wrap'></ul>"
        var hotReplyWrap = "<ul class='hot-reply-wrap'></ul><div class='m-down'><a class='open-board open-newsapp'>打开网易新闻，查看更多跟贴回复</a></div>"
        var moreListHtml = getMoreListHtml(data)
        var openNewsappHtml = "<div class='m-down'><a class='open-qa open-newsapp'>想看更多精彩话题讨论，打开网易新闻</a></div>"
        let tabHtml = oneAnswerWrap + hotReplyWrap + moreListHtml
        if (data.subject.timeline && data.subject.timeline.length > 0) {
          tabHtml = `<div class="tab-panel active tab-panel-0">${tabHtml}</div>`
        }
        var totalHtml = bannerHtml + tabHtml + openNewsappHtml

        $(".page-content").innerHTML = totalHtml
        
        oneAnswerItem();

        // 展开收起
        document.querySelector('.g-content').addEventListener('click', function(e){
          if(!e.target.classList.contains('open-arrow')){
            return
          }
          e.target.parentElement.querySelector('.normal').classList.toggle('active')
          // let normal = e.target.parentElement.querySelector('.normal').classList.toggle('active')
          e.target.classList.toggle('active')
        }, false)

        // 跳转到客户端
        Array.prototype.slice.call(document.querySelectorAll('.open-newsapp')).forEach((item) => {
          item.addEventListener('click', (e) => {
            window.location.href = "http://m.163.com/newsapp/applinks.html?s=sps&subjectid=" + id
          }, false)
        })
      }
    })

    // 如果来自单条，插入单条问答
    var oneAnswerItem = ()=>{
      if(talkId){
        utils.ajax({
          url : `http://c.3g.163.com/newstopic/talk/${talkId}.html`,
          method : "GET",
          dataType : 'json',
          success: (data)=>{
            $(".one-answer-wrap").innerHTML = itemHtml(data.data)
            var discussList = data.data.discussList
            var hotReplyHtml = ''
            discussList.forEach((item, index) => {
              if (index < 3) {
                var img = item.userHeadPicUrl || 'http://img4.cache.netease.com/utf8/newsapp/images/default.png'
                hotReplyHtml += `
                  <li>
                    <div class="userInfo">
                      <span class="user-header" style="background:url(${img});background-size:0.7rem;"></span>
                      <div class="user-text">
                        <p class="userName">${item.userName}</p>
                        <p class="replyDesc">${item.content}</p>
                      </div>
                    </div>
                    <div class="ding">${utils.formatTime(item.cTime)}</div>
                  </li>
                `
              }
            })

            $('.hot-reply-wrap').innerHTML = hotReplyHtml 
          }
        })
      }
    }
    
    $('.m-loading').style.display = 'none'
    var content = $('.g-content')
    content.style.display = 'block'
    content.offsetWidth
    content.classList.add('active')

  }

  // 截取文字
  var substr = (text, length = 56)=>{
    var forShortText = "";
    
    if(text.length>length){
      forShortText = text.substr(0,length - 2) + "...";
    }else{
      forShortText = text
    }
    return forShortText
  }

  // 判断是否超长
  var tooLong = (text, length = 56)=>{
    return (text.length > length) ? true : false
  }
  // 话题介绍html
  function getBannerHtml(subjectData) {
    var showShort = '', showNormal = 'active', showBtn = ''
    return `
      <div class="persion-info" style="background-image:url(${subjectData.picurl})">
        <div class="info-text">
          <h1>#${subjectData.name}#</h1>
          <h2>${subjectData.alias}</h2>
          <h4><span></span>${subjectData.concernCount}关注<span></span></h4>
        </div>
      </div>
      <div class="open-newsapp-tip open-newsapp">
        打开网易新闻，查看更多话题讨论
      </div>
    `
  }

  function itemHtml(item){
    let html = ''
    // item.answer.content += '测试测试测试测试测试测试测试测试测试测试测测试测试测试测试测试测试测试测试测试测试测测试测试测试测试测试测试测试测试测试测试测测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试'
      
    var showShort = '', showNormal = 'active', showBtn = ''

    if(tooLong(item.content, 114)){
      showShort = "active"
      showNormal = ""
      showBtn = 'show'
    }

    let style = ''
    if(item.userHeadPicUrl){
      style = `background-image: url(${item.userHeadPicUrl})`
    }
    let imgs = []
    // item.picurl = ['http://dingyue.nosdn.127.net/ONG6=AH6EeYvvIywukr88w04f=AGqQ0gU=jvXSOh2WJPf1460624363092compressflag.jpg', 'http://dingyue.nosdn.127.net/ONG6=AH6EeYvvIywukr88w04f=AGqQ0gU=jvXSOh2WJPf1460624363092compressflag.jpg', 'http://dingyue.nosdn.127.net/ONG6=AH6EeYvvIywukr88w04f=AGqQ0gU=jvXSOh2WJPf1460624363092compressflag.jpg']
    if(item.picurl.length) {
      imgs = item.picurl.map((_item, i) => {
        if(item.picurl.length > 1) {
          return `
          <span class="js-img" data-index=${i} style="background-image: url(http://s.cimg.163.com/i/${_item.replace('http://', '').replace(/\?.*/, '')}.750x1500.50.auto.jpg})"></span>
          `
        }
        return `
          <img class="js-img" data-index=${i} src="http://s.cimg.163.com/i/${_item.replace('http://', '').replace(/\?.*/, '')}.750x1500.50.auto.jpg">
        `
      })
    }
    html = `
      <li>
        <div class="clearfix card-wrap">
          <span style="${style}" class="avatar-wrap"></span>
          <div class="info-wrap">
            <h4 class="name">${item.userName}</h4>
            <div class="comment normal">${item.content}</div>
            ${imgs.length ? `<div class="img-wrap ${imgs.length > 1 && 'multi-img'}" data-imgs="${item.picurl.join(',')}">` + imgs.join('') + '</div>' : ''}
            <a class="open-arrow ${showBtn}"></a>
            <p class="answer-info">
              ${utils.formatTime(item.cTime)}
              <span class="little-circle"></span>${item.discussCount}回复
              <span class="little-circle"></span>${item.supportCount}赞
            </p>
          </div>
        </div>
      </li>
    `
    return html 
  }
  // 更多问答html
  function getMoreListHtml(data) {

    var hotListHtml = '',
        openNewsappHtml = '',
        num = 0

    data.hotList.forEach(function(item, index){
      if (item.talkId != talkId && num < 3) {
        hotListHtml += itemHtml(item)
        num ++
      }
      
    })
    var titleHtml = `<span class="title">最热讨论</span>`

    return `
      <div class="more-wrap">
        ${titleHtml}        
        
      </div>
      <div class="qa-list">
        <ul class="hot active">${hotListHtml}</ul>
      </div>
    </div>
    `
  }

  initPage()
  {
    let iscroll = null
    const photoes = document.getElementById('photoes')
    document.querySelector('.g-content').addEventListener('click', (e) => {
      if (!e.target.classList.contains('js-img')) {
        return
      }
      const imgs = e.target.parentElement.dataset.imgs.split(',')
      const html = imgs.reduce((pre, cur) => {
        return pre + `<li style="width: ${document.documentElement.dataset.width}px;"><img src="${cur}"></li>`
      }, '')
      photoes.innerHTML = `<ul style="width: ${document.documentElement.dataset.width * imgs.length}px">${html}</ul>`
      photoes.style.display = 'block';
      iscroll = new IScroll('#photoes', {
        scrollX: true,
        scrollY: false,
        momentum: false,
        snap: 'li',
        // snapSpeed: 600,
        // snapThreshold: 0.08,
        // click: true,
        preventDefault: false
      })
      setTimeout(() => {
        photoes.classList.add('show')
        iscroll.refresh()
        iscroll.goToPage(+e.target.dataset.index, 0, 0)
      }, 0)
    }, false)
    photoes.addEventListener('click', (e) => {
      photoes.classList.remove('show')
      iscroll.destroy()
      iscroll = null
      setTimeout(function() {
        photoes.style.display = 'none'
      }, 202)
    }, false)
  }
}

// common footer
document.querySelector('.m-body-wrap').insertAdjacentHTML('afterend', footer({
  type: 'topic',
  subjectid: id
}))