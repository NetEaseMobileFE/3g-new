if (module && module.hot) {
  module.hot.accept()
}

import analysis from '../common/analysis'
import loading from '../common/loading'
import * as utils from '../common/utils'
import share from '../common/share'
import testFooter from '../common/test-footer'
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

// main body
{
  const ua = navigator.userAgent
  let $ = document.querySelector.bind(document)
  const id = search.id
  const answerId = search.answerId
  var initPage = ()=>{
    const _get = `http://c.3g.163.com/newstopic/qa/${id}.html`
    // 渲染页面
    utils.ajax({
      method: "GET",
      dataType: 'json',
      url: _get,
      // url: `http://f2e.developer.163.com/cors/get?url=${encodeURIComponent(_get)}&cors=${encodeURIComponent('http://3g.163.com')}`,
      success: (data)=>{
        var data = data.data
        var bannerHtml = getBannerHtml(data.expert)
        var oneAnswerWrap = "<ul class='one-answer-wrap'></ul>"
        var hotReplyWrap = "<div class='m-hot-reply'><ul class='hot-reply-wrap'></ul><div class='m-down u-hide-in-newsapp'><a class='open-newsapp'>打开网易新闻，查看更多跟贴回复</a></div></div>"
        var moreListHtml = getMoreListHtml(data)
        var openNewsappHtml = "<div class='m-down u-hide-in-newsapp'><a class='open-qa open-newsapp'>想看更多精彩问吧讨论，打开网易新闻</a></div>"
        var totalHtml = bannerHtml + oneAnswerWrap + hotReplyWrap + moreListHtml + openNewsappHtml
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
      }
    })

    // 如果来自单条，插入单条问答
    var oneAnswerItem = ()=>{
      if(answerId){
        const _get = `http://c.3g.163.com/newstopic/answer/${answerId}.html`
        utils.ajax({
          url : _get,
          // url: `http://f2e.developer.163.com/cors/get?url=${encodeURIComponent(_get)}&cors=${encodeURIComponent('http://3g.163.com')}`,
          method : "GET",
          dataType : 'json',
          success: (data)=>{
            console.log("one piece")

            var data = data.data;

            var oneAnswerHtml = qaHtml(data)
            $(".one-answer-wrap").innerHTML = oneAnswerHtml
            hotReply(data.answer.board, data.answer.commentId)
          }
        })
      }
    }

    // 取客户端前三条热门回复，若没有，就取前三条最新回复，若都没有则不显示
    var hotReply = (boardid, commentid) => {
      if(answerId){
        window.replyCount = (data) => {
          const hotPosts = data.hotPosts
          if (hotPosts.length < 1) {
            newReply(boardid, commentid)
          } else {
            var hotReplyHtml = ''
            $('.m-hot-reply').style.display = 'block'
            hotPosts.forEach((item, index) => {
              var _item = item[1]
              var username = _item.f.trim().replace('：','').split('&nbsp;')[0]
              hotReplyHtml += `
                <li>
                  <div class="userInfo">
                    <span class="user-header"></span>
                    <div class="user-text">
                      <p class="userName">${username}</p>
                      <p class="replyDesc">${_item.b}</p>
                    </div>
                  </div>
                  <div class="ding">${_item.v || 0}顶</div>
                </li>
              `
            })
            $('.hot-reply-wrap').innerHTML = hotReplyHtml 
          }
        }
        utils.importJs(`http://comment.api.163.com/api/json/post/list/new/hot/${boardid}/${commentid}/0/3/3/2/2?jsoncallback=replyCount`)
      }
    }

    var newReply = (boardid, commentid) => {
      if(answerId){
        window.replyCount = (data) => {
          const newPosts = data.newPosts
          var newReplyHtml = ''
          if (newPosts.length > 0) {
            $('.m-hot-reply').style.display = 'block'
            newPosts.forEach((item, index) => {
              var _item = item[1]
              var username = _item.f.trim().replace('：','').split('&nbsp;')[0]
              newReplyHtml += `
                <li>
                  <div class="userInfo">
                    <span class="user-header"></span>
                    <div class="user-text">
                      <p class="userName">${username}</p>
                      <p class="replyDesc">${_item.b}</p>
                    </div>
                  </div>
                  <div class="ding">${_item.v || 0}顶</div>
                </li>
              `
            })
          }
          $('.hot-reply-wrap').innerHTML = newReplyHtml 
        }
        utils.importJs(`http://comment.api.163.com/api/json/post/list/new/normal/${boardid}/${commentid}/desc/0/3/3/2/2?jsoncallback=replyCount`)
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
      <div class="open-newsapp-tip open-newsapp u-hide-in-newsapp" data-stat="o-expertid-tip">打开网易新闻，查看更多问吧讨论</div>
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
              ${utils.formatTime(item.answer.cTime)}
              <span class="little-circle"></span>${item.answer.replyCount}回复
              <span class="little-circle"></span>${item.answer.supportCount}赞
            </p>
          </div>
        </div>
      </li>
    `
    return html 
  }

  // 更多问答html
  var getMoreListHtml = (data)=>{

    var hotListHtml = '',
        latestListHtml = '',
        openNewsappHtml = '',
        num = 0

    data.hotList.forEach(function(item, index){
      if (item.answer.answerId != answerId && num < 3) {
        hotListHtml += qaHtml(item)
        num ++ 
      }
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
      </div>
      <div class="qa-list">
        <ul class="hot active">${hotListHtml}</ul>
      </div>
    </div>
    `
  }

  initPage()
}

// common footer
document.querySelector('.m-content').insertAdjacentHTML('afterend', testFooter({
  expertid: id
}))
