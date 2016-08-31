import VideoPlayer from './videoplayer.jsx'
import * as utils from './../../common/utils'
export default class NormalHeader extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      playing: false,
      active: 0,
      boolPlayVideo: false,
      displayVideoShade: false
    }
    this.openNewsapp = this.openNewsapp.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.playVideo = this.playVideo.bind(this)
    this.continuePlayVideo = this.continuePlayVideo.bind(this)
    this.displayVideoShade = this.displayVideoShade.bind(this)
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

  continuePlayVideo(){
    this.setState({
      displayVideoShade: false
    })
    const video = document.querySelector('video')
    if (video && video.paused && !this.state.header) {
      video.play()
    } else {
      video.pause()
    }
  }

  displayVideoShade(){
    this.setState({
      displayVideoShade: true
    })
  }
  render() {
    const { banner, video, mutilVideo, liveVideoFull, subtitle, endDate} = this.props.liveData
    console.log('mutilVideo: ',mutilVideo)
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
    let cClassName = ''
    const boolOfexpand = !!mutilVideo ? this.props.showMultiVideo : this.props.show
    if (boolOfexpand) {
      switch (true){
        case !!video:
          cClassName = 'exp-video-height'
          break
        case !!mutilVideo:
          cClassName = 'exp-multi-height'
          break
        default:
          cClassName = 'exp-height'
          break
      }
    } else {
      switch (true){
        case !!video:
          cClassName = 'shrink-video-height'
          break
        case !!mutilVideo:
          cClassName = 'shrink-multi-height'
          break
        default:
          cClassName = 'shrink-height'
          break
      }
    }
    let liveStatus
    if(+(new Date(endDate.replace(/-/g,"/"))) - (+new Date()) < 0){
      liveStatus = false
    } else {
      liveStatus = true
    }
    console.log(endDate)
    // alert(+(new Date(endDate)))
    // alert((+new Date()))
    // alert(+(new Date(endDate)) - (+new Date()))
    return (
      <div className={cClassName}>
        <div className={className} style={style} onClick={this.click}>
          <div className="title ellipsis">{this.props.title}</div>
          <div className="subtitle">{this.props.subtitle}</div>
          {
            (video || mutilVideo) ?
              <div className="video-wrap">
                {
                  !utils.isWIFI && this.state.displayVideoShade &&
                  <div className="wifi-alert" onClick={this.continuePlayVideo}>
                    <div className="inner">
                      <div className="text">
                        <div>正在使用非Wi-Fi网络</div>
                        <div>播放将产生流量费用</div>
                      </div>
                      <div className="btn">继续播放</div>
                    </div>
                  </div>
                }
                <VideoPlayer inline playVideo={this.playVideo} show = {this.props.show} poster={videoInfo.img} playing={this.state.playing} src={videoInfo.src} displayVideoShade={this.displayVideoShade} />
                <div className="user-count video-style">
                  <div className={`video-logo ${liveStatus ? 'red-color' : 'gray-color'}`}>
                    <div className="video-text">{liveStatus ? '直播' : '回顾'}</div>
                    <div className="video-icon"></div>
                  </div>
                  <div className="polt-NO">{this.props.userCount}人参与</div></div>
              </div> :
              <div className="user-count">
                <div className="logo">{liveStatus ? '直播' : '回顾'}</div>
                <div className="polt-NO">{this.props.userCount}人参与</div>
              </div>
          }
          {
            <div className={"multi-video" + (!mutilVideo || !this.props.showMultiVideo ? ' u-hide' : '')} ref="videos">
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
            (video || mutilVideo) && !this.props.show ? <div className="open-look" onClick={!!mutilVideo ? this.props.expandMulitHeader : this.props.expandHeader}><div className="play-btn"><span className="btn"></span>点击观看视频</div></div> : null
          }
        </div>
        {
          (video || mutilVideo) ? <div className="open-newsapp-tip" data-stat="o-live-tip" onClick={this.openNewsapp}>打开网易新闻，参与直播体验更加流畅</div> : null
        }
      </div>
    )
  }
}