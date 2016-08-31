import * as utils from './../../common/utils'

export default class VideoPlayer extends React.Component {
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
    if (utils.isWIFI) {
      const video = this.refs.video
      if (video.paused) {
        video.play()
      } else {
        video.pause()
      }
      this.props.playVideo && this.props.playVideo(!this.props.playing)
    } else {
     this.props.displayVideoShade()
    }
  }
  render() {
    return <video src={this.props.src} poster={this.props.poster} autoPlay={this.props.autoPlay} className={this.props.show ? 'video' : 'shrink-video'} ref="video" onClick={this.handleClick} />
  }
}