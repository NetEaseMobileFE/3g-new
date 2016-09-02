import * as utils from './../../common/utils'

export default class VideoPlayer extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.videoPlay = this.videoPlay.bind(this)
    this.state = {
      videoShadeCount: true
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

  videoPlay(){
    const video = this.refs.video
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
    this.props.playVideo && this.props.playVideo(!this.props.playing)
  }
  render() {
    return <video src={this.props.src} poster={this.props.poster} autoPlay={this.props.autoPlay} className={this.props.show ? 'video' : 'shrink-video'} ref="video" onClick={this.handleClick} />
  }
}