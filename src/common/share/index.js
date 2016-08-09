/**
 * 通用分享组件
 */

if (module && module.hot) {
  module.hot.accept()
}
import { assign } from '../utils'
require('./index.css')
export default function share(config) {
  const ua = navigator.userAgent
  assign({
    title: document.title,
    url: window.location.href,
    desc: '',
    img: 'http://img6.cache.netease.com/utf8/3g/touch/images/share-logo.png',
    statistics: {},
    other: '',
    wbText: document.title,
    wbImg:'',
    site: window.location.host,
    callback: function() {}
  }, config)

  //分享相关
  const wapShare = {
    targetInfo: [{
      name: "weixin",
      url: ""
    },{
      name: "sina",
      url: "http://service.weibo.com/share/share.php?url={url}&title={wbText}&searchPic=true&pic={wbImg}"
    }, {
      name: "qqzone",
      url: "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={url}&desc=&summary={desc}&title={title}&site={site}&otype=share&pics={wbImg}"
    }, {
      name: "yixin",
      url: "http://open.yixin.im/share?appKey=&type=webpage&title={title}&desc={desc}&userdesc=&pic={img}&url={url}"
    }]
  }

  const isWeixin = ua.match(/micromessenger/gi)
  const isWeibo = ua.match(/weibo/gi)
  const isQzone = ua.match(/qzone/gi)
  const isYixin = ua.match(/yixin/gi)

  /**
   * 获取分享链接
   *
   * @method getShareUrl
   */
  const getShareUrl = () => {
    wapShare.targetInfo.forEach((target) => {
      const href = target.url == '' ? 'javascript:void(0);' : target.url.replace(/{([^}]*)}/g, (str, key) => encodeURIComponent(config[key]))
      const shareLink = document.querySelectorAll(`.u-${target.name}`)
      Array.prototype.forEach.call(shareLink, elm => {
        elm.href = href
      })
    })
  }

  /**
   * 分享统计参数
   * @parameter p:统计参数对象，例statistics:{ spst: 0,docid: 'BBKBRH2G00032DGD',spss: 'newsapp',spsw: 2}
   * spst:内容分类[0:文章/1:动效专题/2:专题/3:图集/4:直播/6:视频/7:视频列表/8:问吧/9:webvr多媒体播放器]
   * [id]:回流页类型[docid:文章/sid:专题/setid_channelid:图集/videoid:视频/roomid:直播室]
   * spss:平台
   * spsw:分享次数
   * other:自定制id（像文章回流页的id就不是固定的）
   * @method shareParam
   */
  const shareParam = (p) => {
    let param = ''
    for (const item in p) {
      let _item;
      if (item == 'other') {
        _item = p[item]
      } else {
        _item = `${item}=${p[item]}`
      }
      param += `${_item}&`
    }
    return param
  }

  /**
   * 绑定事件
   *
   * @method bindEvent
   */
  const bindEvent = () => {
    const targetHref = document.querySelectorAll('.share-icon')
    const name = wapShare.targetInfo
    const statistics = shareParam(config.statistics)

    Array.prototype.forEach.call(targetHref, (link) => {
      // 非微信打开，隐藏微信icon
      if (!isWeixin && link.classList.contains('u-weixin')) {
        link.style.display = 'none'
      }

      link.addEventListener('click', (e) => {
        const target = e.target.getAttribute('data-type')

        // 根据平台显示右上角分享提示
        if (target == 'wx' && isWeixin || target == 'wb' && isWeibo || target == 'qq' && isQzone || target == 'yx' && isYixin ) {
          // document.querySelector('.share-tip').style.display = 'block'
          document.body.insertAdjacentHTML('beforeend', '<div class="share-tip"></div>')
          e.preventDefault()
        }

        // 点击平台分享的统计
        neteaseTracker&&neteaseTracker(false,`http://sps.163.com/func/?func=sharedone&${statistics}spsf=${target}`, '', 'sps')
      })
    })

    // 隐藏提示
    document.addEventListener('click', (e) => {
      const className = e.target.classList[1] || ''
      const type = className.split('_')[1] || ''
      let typeStr = ''
      name.forEach(item => {
        typeStr += item.name
      })
      if (typeStr.indexOf(type) == -1) {
        // document.querySelector('.share-tip').style.display = 'none'
        const shareTip = document.querySelector('.share-tip')
        document.body.removeChild(shareTip)
      }
    })
  }

  /**
   * 微信分享回调函数
   *
   * @method shareCallback
   */
  const shareCallback = (args) => {
    const statistics = shareParam(config.statistics)
    if (args.err_msg.match(/(confirm|ok)/)) {
      alert(config.callback)
      config.callback(true)
      neteaseTracker && neteaseTracker(false,`http://sps.163.com/func/?func=sharedone&${statistics}spsf=wx`, '', 'sps')
    } else {
      config.callback(false)
      neteaseTracker && neteaseTracker(false,`http://sps.163.com/func/?func=shareerror&${statistics}spsf=wx`, '', 'sps')
    }
  }

  /**
   * 微信分享
   *
   * @method setWeixinJSBridge
   */
  const setWeixinJSBridge = () => {
    const statistics = shareParam(config.statistics)
    document.addEventListener('WeixinJSBridgeReady', () => {
      WeixinJSBridge.on('menu:share:timeline', (argv) => {
        WeixinJSBridge.invoke('shareTimeline', {
          "img_url": config.img,
          "img_width": "200",
          "img_height": "200",
          "link": `${config.url}&f=wx`,
          "desc": config.desc,
          "title": config.title
        }, args => {
          shareCallback(args)
        })
      })
      // 发送给朋友
      WeixinJSBridge.on('menu:share:appmessage', (argv) => {
        WeixinJSBridge.invoke('sendAppMessage', {
          "img_url": config.img,
          "link": `${config.url}&f=wx`,
          "desc": config.desc,
          "title": config.title
        }, args => {
          shareCallback(args)
        })
      })
    }, false)
  }

  /**
   * 易信分享
   * @parameter id:回流页类型[docid:文章/sid:专题/setid_channelid:图集/videoid:视频/roomid:直播室]
   * @parameter spst:内容分类[0:文章/1:动效专题/2:专题/3:图集/4:直播/6:视频/7:视频列表/8:问吧/9:webvr多媒体播放器]
   * @method setYixinJSBridge
   */
  const setYixinJSBridge = () => {
    const statistics = shareParam(config.statistics)
    window.shareData = {
      "imgUrl": config.img,
      "wImgUrl": config.wbImg,
      "timeLineLink": `${config.url}&f=yx`,
      "sendFriendLink": `${config.url}&f=yx`,
      "weiboLink": `${config.url}&f=yx`,
      "tTitle": config.title,
      "tContent": config.desc,
      "fTitle": config.title,
      "fContent": config.desc,
      "wContent": config.wbText
    }
    // 易信朋友圈
    document.addEventListener('YixinJSBridgeReady', () => {
      window.YixinJSBridge.on('menu:share:appmessage', (argv) => {
        window.YixinJSBridge.invoke('sendAppMessage', {
          "img_url": config.img,
          "link": `${config.url}&f=yx`,
          "desc": config.desc,
          "title": config.title
        }, () => {
          neteaseTracker&&neteaseTracker(false,`http://sps.163.com/func/?func=sharedone&${statistics}spsf=yx`, '', 'sps')
        })
      })
      window.YixinJSBridge.on('menu:share:timeline', (argv) => {
        window.YixinJSBridge.invoke('shareTimeline', {
          "img_url": config.img,
          "img_width": "200",
          "img_height": "200",
          "link": `${config.url}&f=yx`,
          "desc": config.desc,
          "title": config.title
        }, () => {
          neteaseTracker&&neteaseTracker(false,`http://sps.163.com/func/?func=sharedone&${statistics}spsf=yx`, '', 'sps')
        })
      })
    }, false)
  }

  const init = () => {
    getShareUrl()
    bindEvent()

    if (isWeixin) {
      setWeixinJSBridge()
    } else if(isYixin) {
      setYixinJSBridge()
    }
  }

  init()
}
