export default class IMoney extends React.Component {
  constructor(props) {
    super(props)
    this.toggleGuide = this.toggleGuide.bind(this)
    this.downloadApp = this.downloadApp.bind(this)
    this.state = {
      showGuide: false
    }
  }
  toggleGuide(status) {
    if (status == 'hide') {
      this.setState({ showGuide: false })
    }else{
      this.setState({showGuide: !this.state.showGuide})
    }
    NTES.Pubsub.publish('toggleMask')
  }
  downloadApp() {
    if (utils.isWeixin) {
      this.toggleGuide()
    } else if (utils.isAndroid) {
      window.location.href = 'http://i.money.163.com'
    } else if (utils.isIos) {
      window.location.href = 'https://itunes.apple.com/us/app/wang-yi-gu-piao/id910846410?ls=1&mt=8'
    }
  }
  render() {
    const spss = utils.localParam()['search']['spss']
    let className = 'm-down-imoney'
    if (this.state.showGuide) {
      className += ' show-guide'
    }
    if (spss == 'imoney') {
      return (
        <section className={className}>
          <a onClick={this.downloadApp}></a>
        </section>
      )
    } else {
      return null
    }
  }
}