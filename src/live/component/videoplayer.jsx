import * as utils from './../../common/utils'

export default class VideoPlayer extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.videoPlay = this.videoPlay.bind(this)
    this.imgToVideo = this.imgToVideo.bind(this)
    this.state = {
      videoShadeCount: true,
      androidPlaying: false
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
          androidPlaying: true
        })
        alert('监听到pause事件')
      },false)
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

    // setTimeout(()=>{
    //   const video = this.refs.video
    //   video.removeEventListener('pause',() => {
    //   },false)
    //   video.addEventListener('pause',() => {
    //     this.setState({
    //       androidPlaying: true
    //     })
    //     alert('监听到pause事件')
    //   },false)
    // },200)
  }

  render() {
    const displayNone = {
      display: 'none'
    }
    const displayBlock = {
      display: 'block'
    }
    return (
      <div>
        {
          this.state.androidPlaying && <div className="android-bug-video" onClick={this.imgToVideo}></div>
        }
        <video
          src={this.props.src}
          poster={this.props.poster}
          autoPlay={this.props.autoPlay}
          className={this.props.show ? 'video' : 'shrink-video'}
          ref="video"
          onClick={this.handleClick}
          style={this.state.androidPlaying ? displayNone : displayBlock}

        />
      </div>
    )
  }
}