if (module && module.hot) {
  module.hot.accept()
}

import analysis from '../common/analysis'
import * as utils from '../common/utils'
import header from '../common/header'
import share from '../common/share'
import footer from '../common/footer'

require('../common/reset.css')
require('./index.less')

const search = utils.localParam().search
const id = search.id

// mapp and sps analysis
analysis({ 
  spst: 10,
  type: "article",
  modelid: id
})

// common header
document.querySelector('.m-body-wrap').insertAdjacentHTML('beforebegin', header({
  type: 'subjectid',
  id: id
}))

// main body
{
  const ua = navigator.userAgent
  let $ = document.querySelector.bind(document)
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
        var relativeNewsHtml = getNewsHtml(data.subject.relatedNews)
        var oneAnswerWrap = "<ul class='one-answer-wrap'></ul>"
        var moreListHtml = getMoreListHtml(data)
        var openNewsappHtml = "<div class='m-down'><a class='open-qa open-newsapp'></a></div>"
        let tabHtml = relativeNewsHtml + oneAnswerWrap + moreListHtml
        if (data.subject.timeline && data.subject.timeline.length > 0) {
          tabHtml = `
            <div class="m-tab">
              <span class="tab active" data-type="0">讨论</span>
              <span class="tab" data-type="1">新闻</span>
            </div>
            <div class="tab-panel active tab-panel-0">${tabHtml}</div>
            <div class="tab-panel tab-panel-1 news-list">
              <div>
                ${getTimelineHtml(data.subject.timeline)}
              </div>
            </div>
          `
        }
        var totalHtml = bannerHtml + tabHtml + openNewsappHtml

        $(".page-content").innerHTML = totalHtml
        
        oneAnswerItem();
        // 讨论新闻切换
        document.querySelector('.m-tab') && document.querySelector('.m-tab').addEventListener('click', function(e){

          const target = e.target
          if (target.classList.contains('active') || !target.classList.contains('tab')){
            return
          }
          this.querySelector('.active').classList.remove('active')
          target.classList.add('active')
          document.querySelector('.tab-panel.active').classList.remove('active')
          document.querySelector('.tab-panel.tab-panel-' + target.dataset.type).classList.add('active')
        }, false)

        // 最新最热List切换
        document.querySelector('.sort-type').addEventListener('click', (e)=>{
          const target = e.target
          document.querySelector('.sort-type .cur').classList.remove('cur')
          target.classList.add('cur')
          document.querySelector('.qa-list ul.active').classList.remove('active')
          document.querySelector('.qa-list ul.' + target.dataset.type).classList.add('active')
        }, false)
        document.querySelector('.sort-type a:last-child').click()

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

        if(data.hotList.length == data.subject.talkCount){
          document.querySelector(".open-qa").textContent = "打开网易新闻客户端，我也要来说两句"
        }else if(data.hotList.length < data.subject.talkCount){
          document.querySelector(".open-qa").textContent = "打开网易新闻客户端，查看更多精彩内容"
        }
      }
    })

    // 如果来自单条，插入单条问答
    var oneAnswerItem = ()=>{
      if(talkId){
        $('.one-answer-wrap').style.display = 'block'
        utils.ajax({
          url : `http://c.3g.163.com/newstopic/talk/${talkId}.html`,
          method : "GET",
          dataType : 'json',
          success: (data)=>{
            $(".one-answer-wrap").innerHTML = itemHtml(data.data)
          }
        })
      }
    }
    
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
  // 获取字符串真实长度
  // var realLength = (text)=>{
  //   var len = 0;  
  //   for (var i=0; i<text.length; i++) {  
  //     if (text.charCodeAt(i)>127 || text.charCodeAt(i)==94) {  
  //        len += 2;  
  //      } else {  
  //        len ++;  
  //      }  
  //    }  
  //   return len; 
  // }
  // 判断是否超长
  var tooLong = (text, length = 56)=>{
    return (text.length > length) ? true : false
  }
  // 话题介绍html
  function getBannerHtml(subjectData) {
    var showShort = '', showNormal = 'active', showBtn = ''
    // expertData.description += '测试策才是测试策才是测试策才测试策才是测试策才是测试策才测试策才是测试策才是测试策才测试策才是测试策才是测试策才测试策才是测试策才是测试策才测试策才是测试策才是测试策才是测试策才是测试策才是测试策才是测试策才是测试策才是'
    // if(tooLong(subjectData.description, 36)){
    //   showShort = "active"
    //   showNormal = ""
    //   showBtn = 'show'
    // }
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
  // 处理时间，n小时前之类
  const formatTime = (time)=>{
    let date = null
    
    if(typeof time == 'number'){
      date = time
    }else{
      const arr = time.split(/[- :]/)
      date = +new Date(arr[0], arr[1]-1, arr[2], arr[3], arr[4], arr[5])
    }
    time = new Date(time)
    const now = Date.now()
    const distance = {
      day: Math.floor((now - date) / (1000*60*60*24)),
      hour: Math.floor((now - date) / (1000*60*60)),
      minute: Math.floor((now - date) / (1000*60)) 
    }
    if(distance.day > 0){
      if(distance.day === 1){
        return '1天前'
      }else{
        return `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`
      }
    }else if(distance.hour > 0){
      return distance.hour + '小时前'
    }else{
      return (distance.minute || 1) + '分钟前'
    }
  }
  // 相关新闻html
  var getNewsHtml = (news)=>{
    if(!news){
      return ''
    }
    var itemsHtml = ""
    news.map(function(item,key){
      let url = `http://m.163.com/news/a/${item.docid}.html`
      if(item.skipType == 'photoset'){
        let id = item.skipId.split('|')
        url = `http://3g.163.com/ntes/special/0034073A/photoshare.html?setid=${id[1]}&channelid=${id[0].slice(-4)}`
      }else if(item.skipType == 'special'){
        url = `http://3g.163.com/ntes/special/00340EPA/wapSpecialModule.html?sid=${item.skipId}`
      }else if(item.skipType == 'live'){
        url = `http://3g.163.com/ntes/special/00340BF8/seventlive.html?spss=newsapp&roomid=${item.skipId}`
      }
      itemsHtml += `<li>
        <a href="${url}">
          <p>${item.title}</p>
        </a>
      </li>`
    })

    return `
      <div class="rel-news">
        <p class="tit">相关新闻</p>
        <ul>
          ${itemsHtml}
        </ul>
      </div>
    `
  }
  // 获取新闻时间线
  function getTimelineHtml(timeline) {
    console.log(timeline)
    let html = ''
    timeline.forEach((item, i) => {
      const key = Object.keys(item)[0] //2016
      if (i === 0) {
        html += '<div class="top date">最新</div>'
      } else {
        html += `<div class="year">${key}</div>`
      }
      item[key].forEach((_item, j) => {
        const _key = Object.keys(_item)[0] //2-11
        if (i !== 0 || j !== 0) {
          html += `<div class="date">${_key}</div>`
        }
        _item[_key].forEach((__item, l) => {
          let href = 'http://3g.163.com/ntes/special/0034073A/wechat_article.html?from=topic&docid=' + __item.docid
          if (__item.topicid) {
            href = 'http://c.3g.163.com/nc/qa/newsapp/topic.html?from=topic&id=' + __item.topicid
          }
          html += `<div class="news"><a href="${href}">${__item.title}</a></div>`
        })
      })

    })
    return html
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
        <a href="http://c.3g.163.com/nc/qa/newsapp/single_topic.html?id=${id}&talkid=${item.talkId}">
          <div class="clearfix card-wrap">
            <span style="${style}" class="avatar-wrap"></span>
            <div class="info-wrap">
              <h4 class="name">${item.userName}</h4>
              <div class="comment normal">${item.content}</div>
              ${imgs.length ? `<div class="img-wrap ${imgs.length > 1 && 'multi-img'}" data-imgs="${item.picurl.join(',')}">` + imgs.join('') + '</div>' : ''}
              <a class="open-arrow ${showBtn}"></a>
              <p class="answer-info">
                ${formatTime(item.cTime)}
                <span class="little-circle"></span>${item.discussCount}回复
                <span class="little-circle"></span>${item.supportCount}赞
              </p>
            </div>
          </div>
        </a>
      </li>
    `
    return html 
  }
  // 更多问答html
  function getMoreListHtml(data) {

    var hotListHtml = '',
        latestListHtml = '',
        openNewsappHtml = ''

    data.hotList.forEach(function(item){
      hotListHtml += itemHtml(item)
    })
    data.latestList.forEach(function(item){
      latestListHtml += itemHtml(item)
    })
    var titleHtml = `<span class="title">${data.subject.talkCount}讨论</span>`
    // if(NTES.localParam().search.talkId){
    //   titleHtml = `<span class="icon">更多回答<span class="little-circle"></span>${data.expert.questionCount}提问<span class="little-circle"></span>${data.expert.answerCount}回复</span>`
    // }

    return `
      <div class="more-wrap">
        ${titleHtml}        
        <div class="sort-type">
          <a data-type="hot" href="javascript:void(0)" class="cur">最热</a>
          <a data-type="latest" href="javascript:void(0)" >最新</a>
        </div>
      </div>
      <div class="qa-list">
        <ul class="hot active">${hotListHtml}</ul>
        <ul class="latest">${latestListHtml}</ul>
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
  type: 'subjectid',
  id: id
}))