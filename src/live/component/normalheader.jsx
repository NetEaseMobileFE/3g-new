import VideoPlayer from './videoplayer.jsx'
import * as utils from './../../common/utils'
export default class NormalHeader extends React.Component {
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
      <div className={!this.props.show ? '' : 'f-height'}>
        <div className={className} style={style} onClick={this.click}>
          <div className="title ellipsis">{this.props.title}</div>
          <div className="subtitle">{this.props.subtitle}</div>
          {
            (video || mutilVideo) ? <div className="video-wrap">
              <VideoPlayer inline playVideo={this.playVideo} poster={videoInfo.img} playing={this.state.playing} src={videoInfo.src} />
              <div className="user-count1">{this.props.userCount}人参与</div>
            </div> : <div className="user-count2"><div className="logo">直播</div><div className="polt-NO">{this.props.userCount}人参与</div></div>
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