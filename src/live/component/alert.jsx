export default class Alert extends React.Component {
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