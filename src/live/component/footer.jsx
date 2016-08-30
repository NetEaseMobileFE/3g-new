export default class Footer extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.openNewsapp = this.openNewsapp.bind(this)
    this.state = {
      showTip: false
    }
  }
  componentDidMount() {
    NTES.Pubsub.subscribe('shareData', (shareData) => {
      this.shareData = shareData
    })
  }
  componentWillUnmount() {
    NTES.Pubsub.unsubscribe('shareData')
  }
  openNewsapp() {
    NTES.Pubsub.publish('openNewsapp')
  }
  handleClick(type) {
    if (type === 'wechat') {
      this.setState({
        showTip: true
      }, () => {
        setTimeout(() => {
          this.setState({ showTip: false })
        }, 3000)
      })
      return
    }
    const { title, img, desc, url } = this.shareData
    const strategy = {
      wb: {
        appkey: '603437721',
        url: url + '&f=wb',
        title: title,
        pic: img
      },
      qq: {
        url: url + '&f=qq',
        title: title,
        summary: desc,
        pics: img
      },
      yx: {
        type: 'webpage',
        url: url + '&f=yx',
        title: title,
        desc: desc,
        appkey: 'yxb7d5da84ca9642ab97d73cd6301664ad'
      }
    }
    const urls = {
      yx: "http://open.yixin.im/share?",
      wb: "http://service.weibo.com/share/share.php?",
      qq: "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?",
    }
    let _url = []
    for (let key in strategy[type]) {
      if (strategy[type].hasOwnProperty(key)) {
        _url.push(`${key}=${encodeURIComponent(strategy[type][key])}`)
      }
    }
    // console.log(urls[type] + _url.join("&"))
    window.open(urls[type] + _url.join("&"))

  }
  render() {
    return (
      <footer className={'g-footer u-hide-in-newsapp' + (this.props.isFull ? ' full-video' : '')}>
        <div className="open-newsapp" data-stat="o-live-footer" onClick={this.openNewsapp}></div>
      </footer>
    )
  }
}