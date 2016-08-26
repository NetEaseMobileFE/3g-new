import Barrage from './barrage.jsx'
import VideoPlayer from './videoplayer.jsx'

export default class FullVideo extends React.Component {
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