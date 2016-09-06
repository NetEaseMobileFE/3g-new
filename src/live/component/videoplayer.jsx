import * as utils from './../../common/utils'

export default class VideoPlayer extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.videoPlay = this.videoPlay.bind(this)
    this.imgToVideo = this.imgToVideo.bind(this)
    this.state = {
      videoShadeCount: true,
      androidPlaying: false,
      androidPlayCount: 0
    }
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
    if (utils.isAndroid) {
      video.addEventListener('pause',() => {
        this.setState({
          androidPlaying: true,
          androidPlayCount: 1
        })
      },false)
    }
    if (this.state.androidPlaying) {
      video.play()
    }
  }

  handleClick() {
    if (utils.IsWifi()) {
      this.videoPlay()
    } else {
      if (this.state.videoShadeCount) {
        this.props.displayVideoShade()
        this.setState({
          videoShadeCount: false
        })
      } else {
        this.videoPlay()
      }
    }
  }

  videoPlay() {
    const video = this.refs.video
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
    this.props.playVideo && this.props.playVideo(!this.props.playing)
  }

  imgToVideo() {
    this.setState({
      androidPlaying: false
    })
  }

  render() {
    let centerClass = this.props.show ? 'video' : 'shrink-video'
    const finalClass = this.state.androidPlaying && !!this.state.androidPlayCount ? centerClass +' video-displayNone' : centerClass + ' video-displayBlock'
    return (
      <div>
        {
          this.state.androidPlaying && <div className="android-bug-video" onClick={this.imgToVideo}></div>
        }
        <video
          src={this.props.src}
          poster={this.props.poster}
          autoPlay={this.props.autoPlay}
          className={finalClass}
          ref="video"
          onClick={this.handleClick}
        />
      </div>
    )
  }
}