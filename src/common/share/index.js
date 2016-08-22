/**
 * 通用分享组件
 */
import { assign } from '../utils'

require('./index.css')

if (module && module.hot) {
  module.hot.accept()
}
export default function share(config) {
  const ua = navigator.userAgent
  const configs = assign({
    title: document.title,
    url: window.location.href,
    desc: '',
    img: 'http://img6.cache.netease.com/utf8/3g/touch/images/share-logo.png',
    statistics: {},
    other: '',
    wbText: document.title,
    wbImg: '',
    site: window.location.host,
    callback: () => {}
  }, config)

  // 分享相关
  const wapShare = {
    targetInfo: [{
      name: 'weixin',
      url: ''
    }, {
      name: 'sina',
      url: 'http://service.weibo.com/share/share.php?url={url}&title={wbText}&searchPic=true&pic={wbImg}'
    }, {
      name: 'qqzone',
      url: 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={url}&desc=&summary={desc}&title={title}&site={site}&otype=share&pics={wbImg}'
    }, {
      name: 'yixin',
      url: 'http://open.yixin.im/share?appKey=&type=webpage&title={title}&desc={desc}&userdesc=&pic={img}&url={url}'
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
      const href = target.url === '' ? '#notexist' : target.url.replace(/{([^}]*)}/g, (str, key) => encodeURIComponent(configs[key]))
      const shareLink = document.querySelectorAll(`.u-${target.name}`)
      Array.prototype.forEach.call(shareLink, elm => {
        /* eslint-disable no-param-reassign */
        elm.href = href
        /* eslint-enable no-param-reassign */
      })
    })
  }

  /**
   * 分享统计参数
   * @parameter p:统计参数对象，例statistics:{ spst: 0,docid: 'BBKBRH2G00032DGD',spss: 'newsapp',spsw: 2}
   * spst: 内容分类[0:文章/1:动效专题/2:专题/3:图集/4:直播/6:视频/7:视频列表/8:问吧/9:webvr多媒体播放器]
   * [id]: 回流页类型[docid:文章/sid:专题/setid_channelid:图集/videoid:视频/roomid:直播室]
   * spss: 平台
   * spsw: 分享次数
   * other: 自定制id（像文章回流页的id就不是固定的）
   * @method shareParam
   */
  const shareParam = (p) => {
    let param = ''
    for (let item in p) {
      if ({}.hasOwnProperty.call(p, item)) {
        let _item
        if (item === 'other') {
          _item = p[item]
        } else {
          _item = `${item}=${p[item]}`
        }
        param += `${_item}&`
      }
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
    const statistics = shareParam(configs.statistics)

    Array.prototype.forEach.call(targetHref, (link) => {
      // 非微信打开，隐藏微信icon
      if (!isWeixin && link.classList.contains('u-weixin')) {
        link.style.display = 'none'
      }

      link.addEventListener('click', (e) => {
        const target = e.target.getAttribute('data-type')

        // 根据平台显示右上角分享提示
        if ((target === 'wx' && isWeixin) || (target === 'wb' && isWeibo) || (target === 'qq' && isQzone) || (target === 'yx' && isYixin)) {
          e.stopPropagation()
          e.preventDefault()
          document.body.insertAdjacentHTML('beforeend', '<div class="share-tip"></div>')
        }

        // 点击平台分享的统计
        window.neteaseTracker && window.neteaseTracker(false, `http://sps.163.com/func/?func=sharedone&${statistics}spsf=${target}`, '', 'sps')
      })
    })

    // 隐藏提示
    document.addEventListener('click', () => {
      const dom = document.querySelector('.share-tip')
      dom && dom.parentNode.removeChild(dom)
    })
  }

  /**
   * 微信分享回调函数
   *
   * @method shareCallback
   */
  const shareCallback = (args) => {
    const statistics = shareParam(configs.statistics)
    if (args.err_msg.match(/(confirm|ok)/)) {
      configs.callback(true)
      window.neteaseTracker && window.neteaseTracker(false, `http://sps.163.com/func/?func=sharedone&${statistics}spsf=wx`, '', 'sps')
    } else {
      configs.callback(false)
      window.neteaseTracker && window.neteaseTracker(false, `http://sps.163.com/func/?func=shareerror&${statistics}spsf=wx`, '', 'sps')
    }
  }

  /**
   * 微信分享
   *
   * @method setWeixinJSBridge
   */
  const setWeixinJSBridge = () => {
    document.addEventListener('WeixinJSBridgeReady', () => {
      window.WeixinJSBridge.on('menu:share:timeline', () => {
        window.WeixinJSBridge.invoke('shareTimeline', {
          img_url: configs.img,
          img_width: 200,
          img_height: 200,
          link: `${configs.url}&f=wx`,
          desc: configs.desc,
          title: configs.title
        }, (args) => {
          shareCallback(args)
        })
      })
      // 发送给朋友
      window.WeixinJSBridge.on('menu:share:appmessage', () => {
        window.WeixinJSBridge.invoke('sendAppMessage', {
          img_url: configs.img,
          link: `${configs.url}&f=wx`,
          desc: configs.desc,
          title: configs.title
        }, (args) => {
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
    const statistics = shareParam(configs.statistics)
    window.shareData = {
      imgUrl: configs.img,
      wImgUrl: configs.wbImg,
      timeLineLink: `${configs.url}&f=yx`,
      sendFriendLink: `${configs.url}&f=yx`,
      weiboLink: `${configs.url}&f=yx`,
      tTitle: configs.title,
      tContent: configs.desc,
      fTitle: configs.title,
      fContent: configs.desc,
      wContent: configs.wbText
    }
    // 易信朋友圈
    document.addEventListener('YixinJSBridgeReady', () => {
      window.YixinJSBridge.on('menu:share:appmessage', () => {
        window.YixinJSBridge.invoke('sendAppMessage', {
          img_url: configs.img,
          link: `${configs.url}&f=yx`,
          desc: configs.desc,
          title: configs.title
        }, () => {
          window.neteaseTracker && window.neteaseTracker(false, `http://sps.163.com/func/?func=sharedone&${statistics}spsf=yx`, '', 'sps')
        })
      })
      window.YixinJSBridge.on('menu:share:timeline', () => {
        window.YixinJSBridge.invoke('shareTimeline', {
          img_url: configs.img,
          img_width: 200,
          img_height: 200,
          link: `${configs.url}&f=yx`,
          desc: configs.desc,
          title: configs.title
        }, () => {
          window.neteaseTracker && window.neteaseTracker(false, `http://sps.163.com/func/?func=sharedone&${statistics}spsf=yx`, '', 'sps')
        })
      })
    }, false)
  }

  const init = () => {
    getShareUrl()
    bindEvent()

    if (isWeixin) {
      setWeixinJSBridge()
    } else if (isYixin) {
      setYixinJSBridge()
    }
  }

  init()
}
