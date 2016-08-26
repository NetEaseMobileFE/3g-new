export default class Newsapp extends React.Component {
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
        <section className="m-down u-hide-in-newsapp">
          <a onClick={this.openNewsapp.bind(this, null)} data-stat="o-live-header"></a>
          <iframe ref="iframe" className="u-hide"></iframe>
        </section>
      )
    }else{
      return <iframe ref="iframe" className="u-hide"></iframe>
    }
  }
}