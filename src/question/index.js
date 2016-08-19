if (module && module.hot) {
  module.hot.accept()
}

import analysis from '../common/analysis'
import loading from '../common/loading'
import * as utils from '../common/utils'
import header from '../common/header'
import share from '../common/share'
import footer from '../common/footer'
import '../common/is-newsapp'
import '../common/is-iframe'

require('../common/reset.css')
require('./index.less')

const search = utils.localParam().search
const id = search.id
loading()

// mapp and sps analysis
analysis({
  spst: 8,
  type: "article",
  modelid: id
})

// common header
document.querySelector('.g-body-wrap').insertAdjacentHTML('beforebegin', header({
  expertid: id
}))

// main body
{
  const ua = navigator.userAgent
  let $ = document.querySelector.bind(document)
  const answerId = search.answerId
  var initPage = ()=>{
    const _get = `http://c.3g.163.com/newstopic/qa/${id}.html`
    // 渲染页面
    utils.ajax({
      method: "GET",
      dataType: 'json',
      url: _get,
      // url: `http://f2e.developer.163.com/cors/get?url=${encodeURIComponent(_get)}&cors=${encodeURIComponent('http://t.c.m.163.com')}`,
      success: (data)=>{
        var data = data.data
        var bannerHtml = getBannerHtml(data.expert)
        var relativeNewsHtml = getNewsHtml(data.expert.relatedNews)
        var oneAnswerWrap = '<ul class="one-answer-wrap"></ul>'
        var moreListHtml = getMoreListHtml(data)
        var openNewsappHtml = '<div class="m-down u-hide-in-newsapp"><a class="open-qa open-newsapp"></a></div>'
        var totalHtml = bannerHtml + relativeNewsHtml + oneAnswerWrap + moreListHtml + openNewsappHtml
        $(".page-content").innerHTML = totalHtml

        // share component
        {
          const title = data.expert.alias || ''
          const body = data.expert.description || title
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
            desc: body.replace(/<.*?>/g, "").replace(/(^\s*)/g, "").substr(0, 30) || title,
            url: _url,
            img: 'http://img6.cache.netease.com/utf8/3g/touch/images/share-logo.png',
            statistics: {
              spst: 8,
              modelid: id,
              spss: spss,
              spsw: spsw
            }
          })
        }

        oneAnswerItem();
        // 最新最热List切换

        document.querySelector('.sort-type').addEventListener('click', (e)=>{
          let target = e.target
          document.querySelector('.sort-type .cur').classList.remove('cur')
          target.classList.add('cur')
          document.querySelector('.qa-list ul.active').classList.remove('active')
          document.querySelector('.qa-list ul.' + target.dataset.type).classList.add('active')
        }, false)
        document.querySelector('.sort-type a:last-child').click()

        // 展开收起
        document.querySelector('.m-content').addEventListener('click', function(e){
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
            window.location.href = "http://m.163.com/newsapp/applinks.html?s=sps&expertid=" + id
          }, false)
        })

        if(data.hotList.length == data.expert.answerCount){
          document.querySelector(".open-qa").textContent = "打开网易新闻客户端，我要去提问！"
        }else if(data.hotList.length < data.expert.answerCount){
          document.querySelector(".open-qa").textContent = "打开网易新闻客户端，查看更多精彩问答！"
        }
      }
    })

    // 如果来自单条，插入单条问答
    var oneAnswerItem = ()=>{
      if(answerId){
        const _get = `http://c.3g.163.com/newstopic/answer/${answerId}.html`
        $('.one-answer-wrap').style.display = 'block'
        utils.ajax({
          url : _get,
          // url: `http://f2e.developer.163.com/cors/get?url=${encodeURIComponent(_get)}&cors=${encodeURIComponent('http://t.c.m.163.com')}`,
          method : "GET",
          dataType : 'json',
          success: (data)=>{
            console.log("one piece")

            var data = data.data;

            var oneAnswerHtml = qaHtml(data)
            $(".one-answer-wrap").innerHTML = oneAnswerHtml
          }
        })
      }
    }

    $('.m-loading').style.display = 'none'
    var content = $('.m-content')
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
  // 专家介绍html
  var getBannerHtml = (expertData)=>{
    var showShort = '', showNormal = 'active', showBtn = ''
    // expertData.description += '测试策才是测试策才是测试策才测试策才是测试策才是测试策才测试策才是测试策才是测试策才测试策才是测试策才是测试策才测试策才是测试策才是测试策才测试策才是测试策才是测试策才是测试策才是测试策才是测试策才是测试策才是测试策才是'
    if(tooLong(expertData.description, 36)){
      showShort = "active"
      showNormal = ""
      showBtn = 'show'
    }
    return `
      <div class="persion-info" style="background-image:url(${expertData.picurl})">
        <div class="info-text">
          <h1>${expertData.alias}</h1>
          <h4><span></span>${expertData.concernCount}关注<span></span></h4>
        </div>
      </div>
      <div class="open-newsapp-tip open-newsapp u-hide-in-newsapp" data-stat="o-expertid-tip">
        打开网易新闻，查看更多问吧讨论
      </div>
      <div class="clearfix card-wrap card-wrap-top">
        <span style="background-image: url(${expertData.headpicurl})" class="avatar-wrap"></span>
        <div class="info-wrap">
          <h4 class="name">${expertData.name} <i>|</i> ${expertData.title}</h4>
          <div class="desc normal" >${expertData.description}</div>
          <a class="open-arrow ${showBtn}" ></a>
        </div>
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
    if (!news || !news.length) {
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

  function qaHtml(item){
    let html = ''
    // item.answer.content += '测试测试测试测试测试测试测试测试测试测试测测试测试测试测试测试测试测试测试测试测试测测试测试测试测试测试测试测试测试测试测试测测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试'

    var showShort = '', showNormal = 'active', showBtn = ''

    if(tooLong(item.answer.content, 114)){
      showShort = "active"
      showNormal = ""
      showBtn = 'show'
    }

    let style = ''
    if(item.question.userHeadPicUrl){
      style = `background-image: url(${item.question.userHeadPicUrl})`
    }
    html = `
      <li>
        <a href="http://c.3g.163.com/nc/qa/newsapp/single_question.html?id=${id}&answerId=${item.answer.answerId}">
          <div class="clearfix card-wrap ">
            <span style="${style}" class="avatar-wrap"></span>
            <div class="info-wrap">
              <h4 class="name">${item.question.userName}</h4>
              <div class="comment">${item.question.content}</div>
            </div>
          </div>
          <div class="clearfix card-wrap">
            <span style="background-image: url(${item.answer.specialistHeadPicUrl})" class="avatar-wrap"></span>
            <div class="info-wrap">
              <h4 class="name">${item.answer.specialistName}</h4>
              <div class="comment normal answer">${item.answer.content}</div>
              <a class="open-arrow ${showBtn}"></a>
              <p class="answer-info">
                ${formatTime(item.answer.cTime)}
                <span class="little-circle"></span>${item.answer.replyCount}回复
                <span class="little-circle"></span>${item.answer.supportCount}赞
              </p>
            </div>
          </div>
        </a>
      </li>
    `
    return html
  }

  // 更多问答html
  var getMoreListHtml = (data)=>{

    var hotListHtml = '',
        latestListHtml = '',
        openNewsappHtml = ''

    data.hotList.forEach(function(item){
      hotListHtml += qaHtml(item)
    })
    data.latestList.forEach(function(item){
      latestListHtml += qaHtml(item)
    })
    var titleHtml = `<span class="title">${data.expert.questionCount}提问<span class="little-circle"></span>${data.expert.answerCount}回复</span>`
    if(utils.localParam().search.answerId){
      titleHtml = `<span class="icon">更多回答<span class="little-circle"></span>${data.expert.questionCount}提问<span class="little-circle"></span>${data.expert.answerCount}回复</span>`
    }

    return `
      <div class="more-wrap">
        ${titleHtml}
        <div class="sort-type" id＝"sort-type">
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
}

// common footer
document.querySelector('.g-body-wrap').insertAdjacentHTML('afterend', footer({
  expertid: id
}))
