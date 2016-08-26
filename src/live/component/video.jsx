import VideoPlayer from './videoplayer.jsx'

export default class Video extends React.Component {
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