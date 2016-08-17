import analysis from '../common/analysis'
import * as utils from '../common/utils'
import '../common/is-newsapp'
import '../common/is-iframe'

if (module && module.hot) {
  module.hot.accept()
}

require('../common/reset.css')
require('./index.less')

const search = utils.localParam().search
const liveid = window.location.href.match(/\/l\/(\w*)\./)[1]

// mapp and sps analysis
analysis({ 
  spst: 4,
  type: "article",
  modelid: liveid
})

// main body
{
  {
    function Subject(subject){
      this._subject = subject
      this.observers = []
    }

    let Pubsub = (function(){
      let topics = {}
      // {[{token: 1, func: function}]}
      // let topics = {
      //   'a': [{token: 1, func: function}]
      // }
      function subscribe(topic, observer){
        topics[topic] = topics[topic] || []
        let token = topics[topic].length
        unsubscribe(topic, observer)
        topics[topic].push({
          token: token,
          func: observer
        })
        return token
      }
      function unsubscribe(topic){
        let args = arguments[1]
        if(topics[topic]){
          topics[topic] = topics[topic].filter(function(item){
            if(item.func !== args && item.token !== args){
              return item
            }
          })
        }
      }
      function publish(topic){
        let args = [].slice.call(arguments, 1)
        if(topics[topic]){
          topics[topic].forEach(function(item, i){
            if(typeof item.func == 'function'){
              item.func.apply(null, args)
            }
          })
        }
      }
      return{
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        publish: publish
      }
    })()
    {
      let lastTime = 0;
      let prefixes = 'webkit moz ms o'.split(' '); //各浏览器前缀

      let requestAnimationFrame = window.requestAnimationFrame;
      let cancelAnimationFrame = window.cancelAnimationFrame;

      let prefix;
      //通过遍历各浏览器前缀，来得到requestAnimationFrame和cancelAnimationFrame在当前浏览器的实现形式
      for( let i = 0; i < prefixes.length; i++ ) {
        if ( requestAnimationFrame && cancelAnimationFrame ) {
          break;
        }
        prefix = prefixes[i];
        requestAnimationFrame = requestAnimationFrame || window[ prefix + 'RequestAnimationFrame' ];
        cancelAnimationFrame  = cancelAnimationFrame  || window[ prefix + 'CancelAnimationFrame' ] || window[ prefix + 'CancelRequestAnimationFrame' ];
      }

      //如果当前浏览器不支持requestAnimationFrame和cancelAnimationFrame，则会退到setTimeout
      if ( !requestAnimationFrame || !cancelAnimationFrame ) {
        requestAnimationFrame = function( callback, element ) {
          let currTime = new Date().getTime();
          //为了使setTimteout的尽可能的接近每秒60帧的效果
          let timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) ); 
          let id = window.setTimeout( function() {
          callback( currTime + timeToCall );
          }, timeToCall );
          lastTime = currTime + timeToCall;
          return id;
        };
        
        cancelAnimationFrame = function( id ) {
          window.clearTimeout( id );
        };
      }

      //得到兼容各浏览器的API
      window.requestAnimationFrame = requestAnimationFrame; 
      window.cancelAnimationFrame = cancelAnimationFrame; 
    }
    let nav = navigator.userAgent
    window.NTES = {
      formatTime: function (time){
        let _time = time
        if(typeof time !== 'number'){
          let arr = time.split(/[- :]/)
          _time = new Date(arr[0], arr[1]-1, arr[2], arr[3]||'00', arr[4]||'00', arr[5]||'00')      
        }else{
          _time = new Date(time)        
        }
        return {
          date: (_time.getMonth()+1) + '月' + _time.getDate() + '日',
          time: (_time.getHours()) + ':' + (_time.getMinutes() < 10? '0'+_time.getMinutes(): _time.getMinutes()),
        }
      },
      Pubsub: Pubsub,
      Subject: Subject
    }
  }
  document.addEventListener('touchmove', (ev) => {
    ev.preventDefault()
  }, false)
  utils.isQQ && utils.isAndroid && document.body.classList.add('is-qq')
  class Nav extends React.Component {
    constructor(props) {
      super(props)
      this.handleClick = this.handleClick.bind(this)
    }
    handleClick(e){
      if (!document.referrer || (document.referrer && document.referrer.match(/163\.com/))) {
        e.preventDefault()
        window.history.back()
      }
    }
    render() {
      const spss = utils.localParam()['search']['spss']
      if (spss) {
        return null
      } else {
        return (
          <nav className="m-nav">
            <a className="back" href="http://3g.163.com/touch/" onClick={this.handleClick}></a>
            <a target="_blank" className="menu" href="http://3g.163.com/touch/navigation/"></a>
            <a className="home" href="http://3g.163.com/touch/"></a>
          </nav>
        )
      }
    }
  }
  class Newsapp extends React.Component {
    constructor(props) {
      super(props)
      this.openNewsapp = this.openNewsapp.bind(this)
      this.timeout = null
    }
    openNewsapp(url) {
      if (!url) {
        window.location.href = 'http://m.163.com/newsapp/applinks.html?s=sps&liveRoomid=' + this.props.roomId
      } else if (url === 'homepage'){
        window.location.href = 'http://m.163.com/newsapp/applinks.html'
      } else {
        window.location.href = 'http://m.163.com/newsapp/applinks.html?s=sps&url=' + encodeURIComponent(url)
      }
    }
    componentDidMount() {
      NTES.Pubsub.subscribe('openNewsapp', (url) => {
        this.openNewsapp(url)
      })
    }
    componentWillUnmount() {
      NTES.Pubsub.unsubscribe('openNewsapp')
    }
    render() {
      if (this.props.show) {
          return (
            <section className="m-down">
              <a onClick={this.openNewsapp.bind(this, null)} data-stat="o-live-header"></a>
              <iframe ref="iframe" className="u-hide"></iframe>
            </section>
          )
        }else{
          return <iframe ref="iframe" className="u-hide"></iframe>
        }
    }
  }
  class VideoPlayer extends React.Component {
    constructor(props) {
      super(props)
      this.handleClick = this.handleClick.bind(this)
    }
    componentDidMount() {
      const video = this.refs.video
      const { onPause, onEnd, onError, playVideo } = this.props
      if (this.props.inline) {
        video.setAttribute('webkit-playsinline', true)
      }
      video.onplay = () => {
        playVideo && playVideo(true)
      }
      video.onpause = () => {
        playVideo && playVideo(false)
        onPause && onPause()
      }
      video.onended = () => {
        onEnd && onEnd()
      }
      video.onerror = () => onError && onError()
    }
    handleClick() {
      const video = this.refs.video
      if (video.paused) {
        video.play()
      } else {
        video.pause()
      }
      this.props.playVideo && this.props.playVideo(!this.props.playing)
    }
    render() {
      return <video src={this.props.src} poster={this.props.poster} autoPlay={this.props.autoPlay} ref="video" onClick={this.handleClick} />
    }
  }
  class Mask extends React.Component {
    constructor(props) {
      super(props)
      this.hide = this.hide.bind(this)
      this.state = {
        show: false
      }
    }
    componentDidMount() {
      NTES.Pubsub.subscribe('toggleMask', () => {
        this.setState({ show: !this.state.show })
      })
    }
    componentWillUnmount() {
      NTES.Pubsub.unsubscribe('toggleMask')
    }
    hide() {
      this.setState({ show: false })
    }
    render() {
      let className = 'm-mask'
      if (this.state.show) {
        className += ' show'
      }
      return <div className={className} onClick={this.hide} />
    }
  }
  class IMoney extends React.Component {
    constructor(props) {
      super(props)
      this.toggleGuide = this.toggleGuide.bind(this)
      this.downloadApp = this.downloadApp.bind(this)
      this.state = {
        showGuide: false
      }
    }
    toggleGuide(status) {
      if (status == 'hide') {
        this.setState({ showGuide: false })
      }else{
        this.setState({showGuide: !this.state.showGuide})
      }
      NTES.Pubsub.publish('toggleMask')
    }
    downloadApp() {
      if (utils.isWeixin) {
        this.toggleGuide()
      } else if (utils.isAndroid) {
        window.location.href = 'http://i.money.163.com'
      } else if (utils.isIos) {
        window.location.href = 'https://itunes.apple.com/us/app/wang-yi-gu-piao/id910846410?ls=1&mt=8'
      }
    }
    render() {
      const spss = utils.localParam()['search']['spss']
      let className = 'm-down-imoney'
      if (this.state.showGuide) {
        className += ' show-guide'
      }
      if (spss == 'imoney') {
        return (
          <section className={className}>
            <a onClick={this.downloadApp}></a>
          </section>
        )
      } else {
        return null
      }
    }
  }
  class NormalHeader extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        playing: false,
        active: 0
      }
      this.openNewsapp = this.openNewsapp.bind(this)
      this.handleClick = this.handleClick.bind(this)
      this.playVideo = this.playVideo.bind(this)
    }
    componentDidMount() {
      this.refs.videos.addEventListener('touchmove', (e) => {
        e.stopPropagation()
        e.stopImmediatePropagation
      }, false)
      const { video, mutilVideo } = this.props.liveData
      let version = ''

      if (utils.isIos) {
        version = navigator.userAgent.match((/OS (\d)_(\d)/))
        version = +`${version[1]}.${version[2]}`
      }
      if (!version || version < 8.3) {
        return
      }
      if (video && video.isPano === 'on') {
        // NTES.Pubsub.publish('toggleAlert', { state: true, url: video.panoUrl})
      }
      if (mutilVideo && mutilVideo[0] && mutilVideo[0].isPano === 'on') {
        // NTES.Pubsub.publish('toggleAlert', { state: true, url: mutilVideo[0].panoUrl})
      }
    }
    openNewsapp() {
      NTES.Pubsub.publish('openNewsapp')
    }
    handleClick(i) {
      this.setState({ active: i }, () => {
        ReactDOM.findDOMNode(this).querySelector('video').play()
      })
      const { mutilVideo } = this.props.liveData
      if (mutilVideo && mutilVideo[i] && mutilVideo[i].isPano === 'on') {
        // NTES.Pubsub.publish('toggleAlert', { state: true, url: mutilVideo[i].panoUrl})
      }
    }
    playVideo(playing) {
      this.setState({ playing })
    }
    render() {
      const { banner, video, mutilVideo, liveVideoFull, subtitle } = this.props.liveData
      let style = {}
      if (banner && banner.url) {
        style = {
          backgroundImage: `url(${banner.url})`
        }
      }
      let className = 'live-header live-header-normal'
      let videoInfo = {
        src: '',
        img: ''
      }
      if (banner && +banner.type === 1 && banner.url) {
        className += ' notitle'
      } else {
        style = {}
      }
      if (video) {
        className += ' video'
        videoInfo.src = video.videoUrl
      }
      if (mutilVideo) {
        className += ' mutil video'
        videoInfo = {
          src: mutilVideo[this.state.active].url,
          img: mutilVideo[this.state.active].imgUrl
        }
      }
      if (this.state.playing) {
        className += ' playing'
      }
      if (!this.props.show) {
        className += ' expanded'
      }
      
      return (
        <div className="f-height">
          <div className={className} style={style} onClick={this.click}>
            <div className="title ellipsis">{this.props.title}</div>
            <div className="subtitle">{this.props.subtitle}</div>
            {
              (video || mutilVideo) ? <div className="video-wrap">
                <VideoPlayer inline playVideo={this.playVideo} poster={videoInfo.img} playing={this.state.playing} src={videoInfo.src} />
                <div className="user-count">{this.props.userCount}人参与</div>
              </div> : <div className="user-count">{this.props.userCount}人参与</div>
            }
            {
              <div className={"multi-video" + (!mutilVideo ? ' hide' : '')} ref="videos">
                <div className="inner">
                  {
                    mutilVideo && mutilVideo.map((item, i) => {
                      return <div key={i} className={'item' + (this.state.active === i ? ' active' : '')} style={{backgroundImage: `url(${item.imgUrl})`}} onClick={this.handleClick.bind(null, i)}>
                        <div>{item.title}</div>
                      </div>
                    })
                  }
                </div>
              </div>
            }
            {
              !this.props.show ? <div className="open-look" onClick={this.props.expandHeader}><div className="play-btn"><span className="btn"></span>点击观看视频</div></div> : null
            }
          </div>
          {
            (video || mutilVideo) ? <div className="open-newsapp-tip" data-stat="o-live-tip" onClick={this.openNewsapp}>打开网易新闻，参与直播体验更加流畅</div> : null
          }
        </div>
      )
    }
  }
  class Alert extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        show: false,
        url: ''
      }
      this.handleClick = this.handleClick.bind(this)
    }
    componentDidMount() {
      NTES.Pubsub.subscribe('toggleAlert', (data) => {
        this.setState({ show: data.state, url: data.url })
      })
    }
    handleClick() {
      this.setState({ show: false })
    }
    render() {
      return (
        <div className={'m-alert' + (this.state.show ? ' show' : '')}>
          <div className="inner">
            <div>
              网易新闻推出<span>全景直播</span>
            </div>
            <div>正在测试中，欢迎围观！</div>
            <a href={this.state.url}>抢先预览</a>
            <i onClick={this.handleClick} />
          </div>
        </div>
      )
    }
  }
  class NBAHeader extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        teamInfo: {}
      }
    }
    componentDidMount() {
      utils.importJs(this.props.url + '?jsoncallback=gameInfoCallback')
      window.gameInfoCallback = (data) => {
        window.gameInfoCallback = null
        this.setState({teamInfo: data })
      }
    }
    render() {
      if (!this.props.show) {
        return null
      }
      const teamInfo = this.state.teamInfo || {}
      const gameInfo = this.props.gameInfo || {}
      const started = this.props.started
      const style = {
        display: started ? 'block': 'none'
      }
      // 一开始不知道支持足球
      // 与篮球的区别在于统计链接
      // 变量名懒得改了~
      // 通过直播数据sportsApiUrl进行区别
      // 足球： http://goal.sports.163.com/flag/57000.json
      // 足球： http://cs.sports.163.com/flag/63925.json
      // 篮球： http://nba.sports.163.com/flag/61959.json
      let className = 'live-header live-header-nba'
      let href = `http://3g.163.com/ntes/special/00340BF8/basketballgame.html?mid=${teamInfo.mid}&cid=${teamInfo.cid}&sid=${teamInfo.sid}&source=${teamInfo.source}`
      const url = this.props.url
      if (url.match(/http\:\/\/cs|goal\./) || url.match(/football/)) {
        href = `http://3g.163.com/ntes/special/00340BF8/footballgame.html?mid=${teamInfo.mid}&cid=${teamInfo.cid}&sid=${teamInfo.sid}&source=${teamInfo.source}`
        className += ' soccer'
      }
      return (
        <div className={className}>
          <div className="section">{gameInfo.section || ''}&nbsp;&nbsp;{this.props.userCount || 0}人参与</div>
          <div className="teams">
            <div className="team">
              <img src={teamInfo.homeFlag} />
              <span>{teamInfo.homeName}</span>
            </div>
            <div className="scores" style={style}>
              <div>{gameInfo.homeScore} - {gameInfo.awayScore}</div>
            </div>
            <div className="team">
              <img src={teamInfo.awayFlag} />
              <span>{teamInfo.awayName}</span>
            </div>
          </div>
        </div>
      )
    }
  }
  class Tab extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        active: 0
      }
      this.tabChange = this.tabChange.bind(this)
    }
    componentDidMount() {
      ReactDOM.findDOMNode(this).addEventListener('touchmove', (e) => {
        e.stopPropagation()
        e.stopImmediatePropagation
      }, false)
      const roomId = this.props.liveData.roomId
      this.tabChange(0, { target: ReactDOM.findDOMNode(this).querySelectorAll('.tab-item')[0], index: 0})
    }
    tabChange(index, e) {
      this.setState({ active: index })
      const dom = e.target
      const left = e.target.offsetLeft
      const width = e.target.offsetWidth
      const css = e.index === 0 ? '-webkit-transition: none' : ''
      this.refs.underscore.style.cssText = `-webkit-transform: translate3d(${left}px, 0, 0); width: ${width}px; ${css}`
      // let style = {
      //   left: this.tabs[active] && this.tabs[active].offsetLeft,
      //   width: this.tabs[active] && this.tabs[active].offsetWidth
      // }
    }
    render() {
      const active = this.state.active
      const liveData = this.props.liveData
      let appFrame = [{ title : '直播', url: 'live' }]
      if (liveData.chatRoomTrigger !== 'off') {
        appFrame.push({ title : '聊天室', url: 'chat' })
      }
      appFrame = appFrame.concat(liveData.appFrame ? liveData.appFrame : [] )

      return (
        <div className="m-tab-wrap">
          <div className="m-tab">
            <div className={'inner' + ' tab' + appFrame.length}>
              {
                appFrame.map((item, i) => {
                  return <span key={i} className={'tab-item' + (i === active ? ' active' : '')} onClick={this.tabChange.bind(null, i)}>{item.title}</span>
                })
              }
            </div>
            <span className={'expand-button' + (this.props.header ? '': ' rotate')} onClick={this.props.expandHeader}></span>
            <span className="underscore" ref="underscore"></span>
          </div>
          <div className="m-tab-content">
            {
              appFrame.map((item, i) => {
                return (
                  <div className={'tab-panel' + (active === i ? ' active' : '')}>
                  {
                    item.url === 'live' && (liveData.nextPage < 0 ? <section className="live-not-start-tip">本次直播将于{getTime(liveData.startDate)}开始</section> : <LiveList liveData={liveData} active={active === i} />)
                  }
                  {
                    item.url === 'chat' && <ChatList nuid={this.props.nuid} roomId={liveData.roomId} active={active === i} />
                  }
                  {
                    item.url !== 'live' && item.url !== 'chat' && active === i && <div className="tab3-wrap">
                      {
                        item.url.indexOf('CreditMarket') !== -1 ? <div className="credit-market"><div className="credit-img"></div><a href={`http://m.163.com/newsapp/applinks.html?s=sps&liveRoomid=${liveData.roomId}`}>点击前往</a></div> : <iframe className="tab3-iframe" src={item.sid ? `http://3g.163.com/ntes/special/00340EPA/wapSpecialModule.html?sid=${item.sid}` : item.url} scrolling="yes"></iframe>
                      }
                    </div>
                  }
                  </div>
                )
              })              
            }

          </div>
        </div>
      )
    }
  }
  function getTime(time) {
    const t = +(new Date(time.replace(/-/g,"/")))
    if (t - Date.now() < 1000 * 60 * 60 * 24){
      return `今天${time.slice(11, 16)}`
    } 
    if (t - Date.now() < 1000 * 60 * 60 * 24 * 2){
      return `明天${time.slice(11, 16)}`
    }
    return time.slice(5,16)
  }
  class LiveList extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        liveList: props.liveData.messages,
        nextPage: props.liveData.nextPage,
        hasNewest: false,
        currentSection: -1
      }
      this.newMessages = []
      this.handleScroll = this.handleScroll.bind(this)
      this.handleClick = this.handleClick.bind(this)
      this.fetchMore = this.fetchMore.bind(this)
      this.fetchLatest = this.fetchLatest.bind(this)
      this.renderLatest = this.renderLatest.bind(this)
      this.changeSection = this.changeSection.bind(this)
      this.loading = false
      // 所有sectionTitle的offsetTop， 减少重绘
      this.titlesTop = []
    }
    componentDidMount() {
      this.refs.dom.addEventListener('scroll', this.handleScroll, false)
      this.lastestTimeout = setInterval(this.fetchLatest, 5000)
      // 第一个元素距离顶部的高度，排除置顶的信息
      this.firstTop = this.refs.first.offsetTop
    }
    componentWillUnmount() {
      clearInterval(this.lastestTimeout)
      this.refs.dom.removeEventListener('scroll', this.handleScroll, false)
    }
    handleClick() {
      this.refs.dom.scrollTop = this.firstTop
      this.setState({ hasNewest: false })
      this.renderLatest()
    }
    renderLatest() {
      this.setState({ liveList: this.newMessages.concat(this.state.liveList), hasNewest: false })
      this.newMessages = []
    }
    handleScroll() {
      if (!this.props.active) { return }
      const now = Date.now()
      const nextPage = this.state.nextPage
      // if(now - this.lastScroll < 300){
      //   return 
      // }
      this.lastScroll = now
      requestAnimationFrame(() => {
        const dom = this.refs.dom
        const last = document.querySelector('.section-wrap:last-child')
        const screenHeight = dom.offsetHeight
        const scrollTop = dom.scrollTop
        const offsetTop = this.refs.first.offsetTop
        const height = last.offsetTop + last.offsetHeight
        const delta = height - scrollTop - screenHeight

        // 加载更多
        if (delta < 200 && nextPage) {
          this.fetchMore(nextPage)
        }
        if (scrollTop < offsetTop && this.newMessages.length > 0) {
          this.renderLatest()
        }
        this.changeSection(scrollTop)
      })
    }
    changeSection(scrollTop) {
      if (scrollTop < this.refs.first.offsetTop) {
        this.setState({ currentSection: -1 })
        return
      }
      const lastScrollTop = this.lastScrollTop || 0
      const cur = this.state.currentSection
      const sections = this.props.liveData.section
      const titles = document.querySelectorAll('.section-title')
      if (scrollTop > this.lastScrollTop) {
        // 向下滚动
        if (!this.titlesTop[cur + 1] && titles[cur + 1]) {
          // 为了减少重绘，将sectiontitle的offsetTop缓存起来
          this.titlesTop.push(titles[cur + 1].offsetTop)
        }
        if (titles[cur + 1] && this.titlesTop[cur + 1] < scrollTop) {
          this.setState({ currentSection: cur + 1})
        }
      } else {
        // 向下滚动
        if (this.titlesTop[cur] && this.titlesTop[cur] > scrollTop) {
          this.setState({currentSection: cur - 1})
        }
      }
      this.lastScrollTop = scrollTop
    }
    fetchLatest() {
      const roomId = this.props.liveData.roomId
      const time = Date.now()
      const dom = this.refs.dom
      const firstTop = this.refs.first.offsetTop
      if (this.loadingLatest) { return }
      utils.importJs(`http://data.live.126.net/live/${roomId}.json?callback=liveCallback`)
      this.loadingLatest = true
      window['liveCallback'] = (data) => {
        this.loadingLatest = false
        const scrollTop = dom.scrollTop
        const height = dom.offsetHeight
        if (!data.messages || data.messages.length < 1) { return }
        let liveList = this.state.liveList
        let newMessages = data.messages.filter((item) => {
          let exist = this.newMessages.concat(liveList.slice(0, 10)).some((_item) => { return _item.id === item.id })
          if (!exist) {
            item.newest = true
          }
          return !exist
        })
        // console.log(newMessages)
        if (newMessages.length > 0 || this.newMessages.length > 0) {
          newMessages = newMessages.sort((i, j) => {
            return  j.id - i.id
          })
          this.newMessages = newMessages.concat(this.newMessages)
          if (scrollTop - this.firstTop > height) {
            if (!this.state.hasNewest) {
              this.setState({ hasNewest: true })
            }
          } else {
            this.setState({ liveList: this.newMessages.concat(liveList), hasNewest: false })
            this.newMessages = []
          }
        }
      }
    }
    fetchMore(pageNumber) {
      const roomId = this.props.liveData.roomId
      const time = Date.now()
      if (this.loading) {
        return
      }
      utils.importJs(`http://data.live.126.net/liveAll/${roomId}/${pageNumber}.json?callback=callback${time}`)
      this.loading = true
      window['callback' + time] = (data) => {
        window['callback' + time] = null
        let liveList = this.state.liveList
        data.messages = data.messages.sort((i,j) => {
          return  j.id - i.id
        })
        liveList = liveList.concat(data.messages)
        this.loading = false
        this.setState({ liveList: liveList, nextPage: data.nextPage })
      }

    }
    render() {
      const topMessage = this.props.liveData.topMessage
      const setions = this.props.liveData.section
      let sectionList = []
      this.state.liveList.forEach((item, i) => {
        const pre = this.state.liveList[i - 1]
        const len = sectionList.length
        if (len > 0 && pre && item.section === pre.section) {
          sectionList[len - 1].list.push(item)
        } else {
          sectionList.push({ section: item.section, list: [item] })
        }
      })
      let count = -1
      return <div className="live-wrap">
        {this.state.currentSection >= 0  && <div className="static-title">{setions[this.state.currentSection]}</div>}
        <div className={'m-noti' + (this.state.hasNewest ? ' active' : '')} onClick={this.handleClick}>上面有新消息哦</div>
        <div className="live-list" ref="dom">
          <div ref="inner">
            {
              topMessage && <LiveItem item={topMessage} top />
            }
            {
              sectionList.map((section, i) => {
                return (
                  <div key={section.section} ref={ i === 0 ? 'first' : ''} className="section-wrap">
                    <div className="section-title">{section.section}</div>
                    {
                      section.list.map((item, j) => {
                        count++
                        return <LiveItem showDownload={count % 10 === 1 && count !== 1} item={item} key={item.id} ref={(i === 0 && j === 0) ? 'last' : ''} />
                      })
                    }
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    }
  }
  class LiveItem extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        newest: props.item.newest
      }
      this.openNewsapp = this.openNewsapp.bind(this)
      this.avatarError = this.avatarError.bind(this)
    }
    componentDidMount() {
      const item = this.props.item
      if (item.newest) {
        this.timeout = setTimeout(() => {
          this.setState({ newest: false })
        }, 6000)
      }
    }
    componentWillUnmount() {
      clearTimeout(this.timeout)
    }
    openNewsapp() {
      NTES.Pubsub.publish('openNewsapp')
    }
    avatarError() {
      ReactDOM.findDOMNode(this).querySelector('.avatar').src = 'http://img4.cache.netease.com/utf8/3g/touch/images/live2.png'
    }
    render() {
      let className = ['live-list-item']
      const item = this.props.item
      if (this.props.top) {
        className.push('top')
      }
      if(item.quote){
        className.push('quote-wrap')
      }
      if(this.state.newest){
        className.push('newest')
      }
       // 内容
      let content = item.msg.content || ''
      if(item.msg.href){
        content = '<a class="link" href="' + item.msg.href + '">' + content + '</a>'
      }
      let color = ''
      if (item.msg.fontColor) {
        color = item.msg.fontColor.match(/.*(#.*);/)
      }
      let contentStyle = {
        color: !!color? color[1] : '#1f1f1f',
        // textAlign: item.msg.align,
        fontWeight: item.msg.fontType.match(/normal/)? 'normal': 'bold'
      }
      let images = null
      let video = null
      let album = null
      let news = null
      let quote = null
      let nbaScore = null
      // 图片
      if (item.images) {
        images = <Images images={item.images} />
      }
      // 视频
      if (item.video) {
        video = <Video href={item.video.url} image={item.video.coverImg} />
      }
      // 图集
      if (item.album) {
        album = <Album album={item.album} />
      }
      // 新闻
      if (item.news) {
        news = <News href={item.news.url} title={item.news.title} />
      }
      // 引用
      if (item.quote) {
        quote = <Quote info={item.quote}/>
      }
      // NBA 比分
      if(item.homeTeam && item.homeScore && item.awayTeam && item.awayScore){
        nbaScore = <NBAScore item={item} />
      }
      let avatar = item.commentator.imgUrl
      if (!avatar || avatar === 'null') {
        avatar = 'http://img4.cache.netease.com/utf8/3g/touch/images/live2.png'
      }
      return <article className={className.join(' ')}>
        <header>
          <img className="avatar" src={avatar} onError={this.avatarError}/>
          <span className="name">{item.commentator.name}</span>
          <span className="time">{NTES.formatTime(item.time).time}</span>
        </header>
        <div className="content">
          {images}{video}{album}{news}
          <div className="text" style={contentStyle} dangerouslySetInnerHTML={{__html: content || ''}} ></div>
          {nbaScore}{quote}{(this.props.showDownload || quote) && <a className="down-link" onClick={this.openNewsapp}>打开网易新闻客户端，与主播互动上榜 &gt;&gt;</a>}
        </div>
      </article>
    }
  }

  // 消息体 -> 引用
  function Quote(props) {
    return (
      <div className="quote">
        <div className="quote-user ellipsis">{ '回复用户： ' + props.info.nick_name}</div>
        <div>{props.info.msg}</div>
      </div>
    )
  }

  // 消息体 -> 图片
  class Images extends React.Component {
    constructor(props) {
      super(props)
      this.handleClick = this.handleClick.bind(this)
    }
    handleClick(i) {
      NTES.Pubsub.publish('imageClick', this.props.images, i)
    }
    render() {
      const images = this.props.images
      let len = images.length
      len = len > 6 ? 6 : len
      return (
        <div className={'media imgs' + ' img' + len} >
          {
            images.map((item, i) => {
              const style = {
                backgroundImage: 'url(' + item.fullSizeSrc + ')'
              }
              return <div key={i} onClick={this.handleClick.bind(null, i)} className="img-wrap">
              {
                len > 1 ?
                <span className="img" style={{backgroundImage: `url(${item.fullSizeSrc})`}} />
                :
                <img src={item.fullSizeSrc} />

              }
              </div>
            })
          }
        </div>
      )
    }
  }
  // 消息体 -> 视频
  class Video extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        playing: false
      }
      this.handleClick = this.handleClick.bind(this)
    }
    handleClick(playing) {
      this.setState({ playing: playing })
    }
    render() {
      return <div className={'media video-wrap' + (this.state.playing ? ' playing' : '')} >
        <VideoPlayer inline playVideo={this.handleClick} playing={this.state.playing} poster={this.props.image} src={this.props.href} />
      </div>
    }
  }
  // 消息体 -> 图集
  function Album(props) {
    const album = props.album
    return <a className="media album" href={'http://3g.163.com/touch/photoview.html?setid=' + album.articleId + '&channelid=' + album.channelId}>
      <img src={album.coverImg} />
      <span className="tip">图集</span>
    </a> 
  }
  // 消息体 -> 新闻
  function News(props) {
    let docid = props.href.match(/\/(.{16})\.html/)
    if(docid){
      docid = docid[1]
    }
    return <a className="news" href={'http://3g.163.com/touch/article.html?docid=' + docid}>
      {'原文：' + props.title}
    </a>
  }
  // 消息体 -> NBA比分
  function NBAScore(props) {
    const scores = props.item
    return <div className="nba-score">{scores.homeTeam} {scores.homeScore} : {scores.awayScore} {scores.awayTeam}</div>
  }
  class ChatList extends React.Component {
    constructor(props) {
      super(props)
      this.handleScroll = this.handleScroll.bind(this)
      this.initChat = this.initChat.bind(this)
      this.fetchMore = this.fetchMore.bind(this)
      this.state = {
        chatData: {}
      }
    }
    componentDidMount() {
      this.refs.dom.addEventListener('scroll', this.handleScroll, false)
    }
    componentWillUpdate(nextProps) {
      if (!this.props.active && nextProps.active && !this.loaded) {
        this.loaded = true
        this.initChat()
      }
    }
    componentWillUnmount() {
      this.refs.dom.removeEventListener('scroll', this.handleScroll, false)
    }
    initChat() {
      const time = Date.now()
      utils.importJs(`http://data.chat.126.net/route_room?topicid=${this.props.roomId}&callback=callback${time}&User_U=${this.props.nuid}`)
      this.loading = true
      window['callback' + time] = (chatData) => {
        window['callback' + time] = null
        this.loading = false
        if(chatData.last_log && chatData.last_log.length > 0){
          chatData.last_log.sort(function(i, j){
            return j.msg_id - i.msg_id
          })
        }
        this.minIndex = chatData.min_index
        this.setState({ chatData: chatData })
      }
    }
    handleScroll() {
      if (!this.props.active) { return }
      const now = Date.now()
      if(now - this.lastScroll < 300){
        return 
      }
      this.lastScroll = now
      requestAnimationFrame(() => {
        const dom = this.refs.dom
        const last = document.querySelector('.section-wrap:last-child')
        const screenHeight = dom.offsetHeight
        const scrollTop = dom.scrollTop
        const height = last.offsetTop + last.offsetHeight
        const delta = height - scrollTop - screenHeight
        // 加载更多
        if (delta < 200) {
          this.fetchMore()
        }

      })
    }
    fetchMore() {
      const chatData = this.state.chatData
      const roomId = this.props.roomId
      const time = Date.now()
      if(this.loading || this.minIndex <= 0 || !chatData.code || chatData.code != 1){
        return
      }  
      this.loading = true
      utils.importJs('http://data.chat.126.net/chat_log?callback=callback'+time+'&topicid='+roomId+'&roomid='+chatData.msg.room_id+'&userid='+chatData.msg.user_id+'&len=20&start='+(this.minIndex))
      window['callback' + time] = (data) => {
        window['callback' + time] = null
        this.loading = false
        if (data.msg && data.msg.length > 0) {
          data.msg = data.msg.filter((item) => {
            return item.msg_id < this.minIndex
          })
          this.minIndex = data.msg[0].msg_id
          data.msg.sort((i, j) => {
            return j.msg_id - i.msg_id
          })
          chatData.last_log = chatData.last_log.concat(data.msg)
          this.loadingMoreChat = false
          this.setState({ chatData: chatData })
        }
      }
    }
    render() {
      const chatList = this.state.chatData.last_log || []
      return <div className="chat-list" ref="dom">
        <div ref="inner">

          {
            chatList.map((item) => {
              return <ChatItem key={item.msg_id} item={item} />
            })
          }
        </div>
      </div>
    }
  }
  class ChatItem extends React.Component {
    constructor(props) {
      super(props)
      this.avatarError = this.avatarError.bind(this)
    }
    avatarError() {
      ReactDOM.findDOMNode(this).querySelector('.avatar').src = 'http://img4.cache.netease.com/utf8/3g/touch/images/user-default.png'
    }
    render() {
      const item = this.props.item
      let quote = null
      if(!!item.quote){
        quote = <div className="quote">
          <div className="name">{item.quote.nick_name.slice(0, 20)}</div>
          <div>{item.quote.msg}</div>
        </div>
      }
      let avatar = item.avatar
      if (!avatar || avatar === 'null') {
        avatar = 'http://img4.cache.netease.com/utf8/3g/touch/images/live2.png'
      }
      return (
        <article className="chat-list-item">
          <header>
            <img className="avatar" src={avatar} onError={this.avatarError}/>
            <span className="name">{item.nick_name.slice(0, 20)}</span>
            <span className="time">{NTES.formatTime(item.time * 1000).time}</span>
          </header>
          <div className="content">
            <div className="text" dangerouslySetInnerHTML={{__html: item.msg || ''}} ></div>
            {quote}
          </div>
          <footer>
          </footer>
        </article>
      )
    }
  }

  // 全屏视频
  class FullVideo extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        end: false,
        playing: false,
        showBarrage: true,
      }
      this.playVideo = this.playVideo.bind(this)
      this.openNewsapp = this.openNewsapp.bind(this)
      this.onVideoEnd = this.onVideoEnd.bind(this)
      this.toggleBarrage = this.toggleBarrage.bind(this)
    }
    componentDidMount() {
      ReactDOM.findDOMNode(this).addEventListener('touchmove', (e) => {
        e.stopPropagation()
        e.stopImmediatePropagation
      }, false)
    }
    openNewsapp() {
      NTES.Pubsub.publish('openNewsapp', 'http://m.163.com/newsapp/applinks.html')
    }
    toggleBarrage() {
      this.setState({ showBarrage: !this.state.showBarrage })
    }
    onVideoEnd() {
      this.setState({ playing: false, end: true })
    }
    playVideo(playing) {
      this.setState({ playing: playing })
    }
    render() {
      const { playing, showBarrage } = this.state
      const userCount = this.props.userCount
      if (this.state.end) {
        return <div className="g-full-video end">
          <div>
            <div className="status">直播已结束</div>
            <div><span className="user-count">{userCount}人参与</span></div>
            <div className="button" onClick={this.openNewsapp}>打开网易新闻,看下一场直播</div>
          </div>
        </div>
      }
      return (
        <div className={'g-full-video' + (playing ? ' playing' : '')}>
          <div className="video-wrap">
            <VideoPlayer autoPlay inline src={this.props.src} playing={playing} playVideo={this.playVideo} onEnd={this.onVideoEnd} />
          </div>
          {playing && <span className="barrage-trigger" onClick={this.toggleBarrage}>{showBarrage ? '关闭弹幕' : '显示弹幕'}</span>}
          <span className={'user-count' + ((showBarrage && playing) ? ' on' : '')}>{userCount}人参与</span>
          {showBarrage && playing && <Barrage nuid={this.props.nuid} userCount={userCount} roomId={this.props.roomId} />}
        </div>
      )
    }
  }

  // 弹幕
  class Barrage extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        chatData: {
          last_log: []
        }
      }
      this.avatarError = this.avatarError.bind(this)
      this.fetchLatest = this.fetchLatest.bind(this)
    }
    componentDidMount() {
      const time = Date.now()
      utils.importJs(`http://data.chat.126.net/route_room?topicid=${this.props.roomId}&callback=callback${time}&User_U=${this.props.nuid}`)
      window[`callback${time}`] = (data) => {
        window[`callback${time}`] = null
        this.setState({ chatData: data }, () => {
          ReactDOM.findDOMNode(this).querySelector('.item:last-child').scrollIntoView(false)
        })
        this.interval = setInterval(this.fetchLatest, 3000)
      }
    }
    componentWillUnmount() {
      clearInterval(this.interval)
    }
    fetchLatest (){
      const chatData = this.state.chatData
      const roomId = this.props.roomId
      const time = Date.now()
      if(this.loading || !chatData.code || chatData.code != 1){
        return
      }  
      this.loading = true
      utils.importJs('http://data.chat.126.net/chat_log?callback=callback'+time+'&topicid='+roomId+'&roomid='+chatData.msg.room_id+'&userid='+chatData.msg.user_id+'&start='+(chatData.max_index))
      window['callback' + time] = (data) => {
        this.loading = false
        if (data.msg && data.msg.length > 0) {
          data.msg = data.msg.filter((item) => {
            return item.msg_id > this.state.chatData.max_index
          })
          chatData.last_log = chatData.last_log.concat(data.msg)
          this.setState({ chatData: chatData }, () => {
            ReactDOM.findDOMNode(this).querySelector('.item:last-child').scrollIntoView(false)
          })
        }
      }
    }
    avatarError() {
      ReactDOM.findDOMNode(this).querySelector('.avatar').src = 'http://img4.cache.netease.com/utf8/3g/touch/images/live2.png'
    }
    render() {
      return (
        <div className="barrage-list">
          {
            this.state.chatData.last_log.map((item) => {
              return <div className="item" key={item.msg_id}>
                <img className="avatar" src={item.avatar || 'http://img4.cache.netease.com/utf8/3g/touch/images/live2.png'} onError={this.avatarError}/>
                <div className="content">
                  <div className="name">{item.nick_name.slice(0, 20)}</div>
                  <div className="msg">{item.msg}</div>
                </div>
              </div>
            })
          }
        </div>
      )
    }
  }

  class Footer extends React.Component {
    constructor(props) {
      super(props)
      this.handleClick = this.handleClick.bind(this)
      this.openNewsapp = this.openNewsapp.bind(this)
      this.state = {
        showTip: false
      }
    }
    componentDidMount() {
      NTES.Pubsub.subscribe('shareData', (shareData) => {
        this.shareData = shareData
        console.log(shareData)
      })
    }
    componentWillUnmount() {
      NTES.Pubsub.unsubscribe('shareData')
    }
    openNewsapp() {
      NTES.Pubsub.publish('openNewsapp')
    }
    handleClick(type) {
      if (type === 'wechat') {
        this.setState({
          showTip: true
        }, () => {
          setTimeout(() => {
            this.setState({ showTip: false })
          }, 3000)
        })
        return
      }
      const { title, img, desc, url } = this.shareData
      const strategy = {
        wb: {
          appkey: '603437721',
          url: url + '&f=wb',
          title: title,
          pic: img
        },
        qq: {
          url: url + '&f=qq',
          title: title,
          summary: desc,
          pics: img
        },
        yx: {
          type: 'webpage',
          url: url + '&f=yx',
          title: title,
          desc: desc,
          appkey: 'yxb7d5da84ca9642ab97d73cd6301664ad'
        }
      }
      const urls = {
        yx: "http://open.yixin.im/share?",
        wb: "http://service.weibo.com/share/share.php?",
        qq: "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?",
      }
      let _url = []
      for (let key in strategy[type]) {
        if (strategy[type].hasOwnProperty(key)) {
          _url.push(`${key}=${encodeURIComponent(strategy[type][key])}`)
        }
      }
      // console.log(urls[type] + _url.join("&"))
      window.open(urls[type] + _url.join("&"))

    }
    render() {
      return (
        <footer className={'g-footer' + (this.props.isFull ? ' full-video' : '')}>
          { this.state.showTip && <div className="share-tip" /> }
          <div className="open-newsapp" data-stat="o-live-footer" onClick={this.openNewsapp}>立即打开&gt;</div>
          <div className="share-list" data-stat="live-footer-share">
            分享
            {utils.isWeixin && <span className="wechat" onClick={this.handleClick.bind(null, 'wechat')} />}
            <span className="weibo" onClick={this.handleClick.bind(null, 'wb')} />
            <span className="qzone" onClick={this.handleClick.bind(null, 'qq')} />
            <span className="yixin" onClick={this.handleClick.bind(null, 'yx')} />
          </div>
        </footer>
      )
    }
  }

    // 轮播图
  class Carousel extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        images: [],
        currentIndex: 0,
        delta: 0
      }
      this.x = null
      this.y = null
      this.start = null
      this.swiping = null
      this.calculatePos = this.calculatePos.bind(this)
      this.touchStart = this.touchStart.bind(this)
      this.touchMove = this.touchMove.bind(this)
      this.touchEnd = this.touchEnd.bind(this)
      this.doMoveImage = this.doMoveImage.bind(this)
      this.prevImageScroll = this.prevImageScroll.bind(this)
      this.nextImageScroll = this.nextImageScroll.bind(this)
      this.click = this.click.bind(this)

    }
    // getDefaultProps() {
    //   return {
    //     flickThreshold: 0.6,
    //     delta: 10
    //   }
    // }
    calculatePos(e) {
      let x = e.changedTouches[0].clientX
      let y = e.changedTouches[0].clientY

      let xd = this.x - x
      let yd = this.y - y

      let axd = Math.abs(xd)
      let ayd = Math.abs(yd)

      return {
        deltaX: xd,
        deltaY: yd,
        absX: axd,
        absY: ayd
      }
    }
    touchStart(e) {
      if (e.touches.length > 1) {
        return
      }
      
      this.start = Date.now()
      this.x = e.touches[0].clientX
      this.y = e.touches[0].clientY
      this.swiping = false
    }
    touchMove(e) {
      if (!this.x || !this.y || e.touches.length > 1) {
        return
      }

      let cancelPageSwipe = false
      let pos = this.calculatePos(e)

      if (pos.absX < this.props.delta && pos.absY < this.props.delta) {
        return
      }

      if (pos.absX > pos.absY) {
        if (pos.deltaX > 0) {
          this.nextImageScroll(e, pos.absX)
          cancelPageSwipe = true
        } else {
          this.prevImageScroll(e, pos.absX)
          cancelPageSwipe = true
        }
      } 

      this.swiping = true

      if (cancelPageSwipe) {
        e.preventDefault()
      }
    }
    touchEnd(ev) {
      if (this.swiping) {
        let pos = this.calculatePos(ev)

        let time = Date.now() - this.state.start
        let velocity = Math.sqrt(pos.absX * pos.absX + pos.absY * pos.absY) / time
        let isFlick = velocity > this.props.flickThreshold

        let currentIndex = this.state.currentIndex

        this.doMoveImage(ev, pos.deltaX, pos.deltaY, isFlick)
      }else{
        this.setState({delta: 0})
      }
      // this.setState(this.getInitialState())
    }
    addResistance(delta) {
      return delta * (1 - parseInt(Math.sqrt(Math.pow(delta, 2)), 10) / 1000)
    }
    doMoveImage(_, x) {
      let index = this.state.currentIndex
      let imageMoveIndex = this.state.currentIndex
      if (x < 0) {
        if (index > 0) {
          index = index - 1
          imageMoveIndex = index
        }
      } else if (x > 0) {
        if (index < this.state.images.length - 1) {
          index = index + 1
          imageMoveIndex = imageMoveIndex
        }
      }

      this.setState({
        currentIndex: index,
        delta: 0
      })
    }
    prevImageScroll(e, delta) {
      this.setState({
        delta: this.addResistance(delta)
      })
    }

    nextImageScroll(e, delta) {
      this.setState({
        delta: 0 - this.addResistance(delta)
      })
    }
    click(e) {
      e.preventDefault()
      this.setState({images: [], currentIndex: 0})
    }
    componentDidMount() {
      let that = this
      this.token = NTES.Pubsub.subscribe('imageClick', function(images, index){
        that.setState({images: images, currentIndex: index, delta:0.0000001})
      })
    }
    componentWillUnmount() {
      NTES.Pubsub.unsubscribe('imageClick', this.token)
    }
    render() {
      let images = this.state.images
      let delta = this.state.delta/100 - this.state.currentIndex * 7.5
      let classString = 'm-carousel'
      if(images.length !== 0){
        classString += ' active'
      }
      let transition = 'all 250ms ease-out'
      let styleString = {
        width: images.length * 7.5 + 'rem',
        'WebkitTransform': 'translate3d(' + delta + 'rem, 0, 0)',
        transition: this.state.delta === 0 ? transition : 'none'
      }
      return <div className={classString}>
        <div className="inner" style={styleString} onTouchStart={this.touchStart} onTouchMove={this.touchMove} onTouchEnd={this.touchEnd} onClick={this.click}>
          {
            images.map(function(img, i){
              return <div className="img-wrap" key={i}><img src={img.fullSizeSrc} /></div>
            })
          }
        </div>
      </div>
    }
  }
  class NewsappShare extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        shareData: {}
      }
    }
    componentDidMount() {
      var that = this
      this.token = NTES.Pubsub.subscribe('shareData', function(shareData){
        that.setState({ shareData: shareData })
      })
    }
    render() {
      var shareData = this.state.shareData
      return (
        <div className="u-hide">
          <div id="__newsapp_sharetext">{shareData.title}</div>
          <div id="__newsapp_sharephotourl">http://img6.cache.netease.com/utf8/3g/touch/images/share-logo.png</div>
          <div id="__newsapp_sharewxtext">{shareData.desc}</div>
          <div id="__newsapp_sharewxtitle">{shareData.title}</div>
          <div id="__newsapp_sharewxurl">{shareData.url + '&spss=newsapp'}</div>
          <div id="__newsapp_sharewxthumburl">http://img6.cache.netease.com/utf8/3g/touch/images/share-logo.png</div>
        </div>
      )
    }
  }
  class Live extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        liveData: {},
        userCount: 0,
        header: true
      }
      this.expandHeader = this.expandHeader.bind(this)
      this.openNewsapp = this.openNewsapp.bind(this)
    }
    componentDidMount() {

      const roomId = this.props.roomId
      if (utils.isNewsapp) {
        window.location.href = 'newsapp://live/' + roomId
      }
      // 加载直播室详情
      window['firstbloodCallback'] = (data) => {
        window['firstbloodCallback'] = null
        if (data.section) {
          data.section = data.section.reverse()
        }
        if (data.nextPage >= 0) {
          data.messages = data.messages.sort((i, j) => {
            return  j.id - i.id
          })
        }

        this.setState({ liveData: data })

        // 微信下，所有请求加载完后，标题可能无法更改
        document.title = data.roomName
        document.querySelector('title').textContent = data.roomName
        let iframe = document.createElement('iframe')
        iframe.style.display = 'none'
        iframe.src = '/favicon.ico'
        setTimeout(() => {
          document.body.appendChild(iframe)
        }, 100)
        setTimeout(() => {
          document.body.removeChild(iframe)
        }, 500)
        {
          let { w = 1, spss = '' } = utils.localParam().search
          w = +w + 1
          NTES.Pubsub.publish('shareData', {
            url: `${location.origin + location.pathname}?roomid=${roomId}&spss=newsapp&w=${w}`,
            title: '网易直播：' + data.roomName,
            desc: data.roomDes || ('网易直播：' + data.roomName),
            img: 'http://img6.cache.netease.com/utf8/3g/touch/images/share-logo.png',
          })
        }

        {
          // 参与人数统计
          const form = this.refs.form
          form.submit()
        }
      }
      utils.importJs('http://data.live.126.net/liveAll/' + roomId + '.json?callback=firstbloodCallback')

      // 加载参与人数
      utils.importJs('http://data.live.126.net/partake/usercount/'+roomId+'.json?callback=liveUsercount&type=1&topicid='+roomId)
      window['liveUsercount'] = (data) => {
        window['liveUsercount'] = null
        if (data.msg && data.msg.user_count >= 0) {
          this.setState({ userCount: data.msg.user_count })
        }
      }

      // 统计(新用户进来没有nuid报错)
      const _ntes_nuid = utils.getCookie('_ntes_nuid')
      const _ntes_nnid = utils.getCookie('_ntes_nnid')
      if (_ntes_nuid || _ntes_nuid) {
        this.nuid = _ntes_nuid || _ntes_nnid.split(',')[0]
      }
      // 反作弊防刷
      this.Jsession = utils.getCookie('JSESSIONID-WYZBS')
    }
    expandHeader() {
      this.setState({ header: !this.state.header })
      // 需要优化，我觉得把播放video的方法提到live父级就可以通过props公用了
      const video = document.querySelector('video')
      if (video.paused && !this.state.header) {
        video.play()
      } else {
        video.pause()
      }
    }
    openNewsapp() {
      NTES.Pubsub.publish('openNewsapp', this.state.liveData.floatLayer.floatUrl)
    }
    render() {
      const params = utils.localParam().search
      const liveData = this.state.liveData
      const userCount = this.state.userCount
      
      // const chatData = this.state.chatData
      if (!liveData.roomId) {
        return <div className="loading"></div>
      }
      let header = <NormalHeader userCount={userCount} liveData={liveData} show={this.state.header} expandHeader={this.expandHeader}/>
      if (!!liveData.sportsApiUrl) {
        header = <NBAHeader userCount={userCount} url={liveData.sportsApiUrl} show={this.state.header} gameInfo={liveData.messages[0]} started={liveData.nextPage >= 0} /> 
      }

      let content = (
        <div className="g-wrap">
          {false && !utils.isNewsapp && !this.state.liveData.video && !this.state.liveData.mutilVideo && <Nav /> }
          {params.spss === 'imoney' && !utils.isNewsapp && <IMoney />}
          {header}
          <Tab nuid={this.nuid} liveData={liveData} expandHeader={this.expandHeader} header={this.state.header} />
          <footer className="footer-placeholder" />
        </div>        
      )
      if (liveData.video && liveData.video.videoFull === 'on') {
        content = (
          <div className="g-wrap">
            <FullVideo nuid={this.nuid} src={liveData.video.videoUrl} roomId={this.props.roomId} userCount={userCount} show={this.state.header}/>
          </div>
        )
      }

      return (
        <section className={'g-live' + (utils.isNewsapp ? ' is-newsapp' : '')}>
          <Alert />
          {<Newsapp roomId={this.props.roomId} show={!utils.isNewsapp && !liveData.video && !liveData.mutilVideo} />}
          {content}
          {
            liveData.floatLayer && +liveData.floatLayer.floatType !== 0 && <a onClick={this.openNewsapp} className={"m-float-icon" + ` type${liveData.floatLayer.floatType}`}onClick={this.openNewsapp} />
          }
          <Footer isFull={liveData.video && liveData.video.videoFull === 'on'} />
          <Carousel />
          <Mask />
          <div className="u-hide">
            <form ref="form" method="POST" target="post" action={`http://data.live.126.net/partake/incr?User_U=${this.nuid}&User_D=${this.Jsession}`}>
              <input type="hidden" name="roomid" value={liveData.roomId} />
              <input type="hidden" name="source" value="wap" />
            </form>
            <iframe name="post" id="post"></iframe>
          </div>
          {utils.isNewsapp && <NewsappShare />}
        </section>
      )
    }
  }
  ReactDOM.render(<Live roomId={utils.localParam()['search']['roomid'] || window.location.href.match(/l\/([0-9]{5,})\.html/)[1]} />, document.getElementById('container'))
}