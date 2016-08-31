import LiveList from './livelist.jsx'
import ChatList from './chatlist.jsx'

export default class Tab extends React.Component {
  constructor(props) {
    super(props)
    this.getTime = this.getTime.bind(this)
    this.state = {
      active: 0
    }
    this.tabChange = this.tabChange.bind(this)
  }

  componentDidMount() {
    ReactDOM.findDOMNode(this).addEventListener('touchmove', (e) => {
      e.stopPropagation()
      e.stopImmediatePropagation
    }, false)
    const roomId = this.props.liveData.roomId
    this.tabChange(0, { target: ReactDOM.findDOMNode(this).querySelectorAll('.tab-item')[0], index: 0})
  }

  tabChange(index, e) {
    this.setState({ active: index })
    const dom = e.target
    const left = e.target.offsetLeft
    const width = e.target.offsetWidth
    const css = e.index === 0 ? '-webkit-transition: none' : ''
    this.refs.underscore.style.cssText = `-webkit-transform: translate3d(${left}px, 0, 0); width: ${width}px; ${css}`
    // let style = {
    //   left: this.tabs[active] && this.tabs[active].offsetLeft,
    //   width: this.tabs[active] && this.tabs[active].offsetWidth
    // }
  }

  getTime(time) {
    console.log(time)
    const t = +(new Date(time.replace(/-/g,"/")))
    if (t - Date.now() < 1000 * 60 * 60 * 24){
      return `今天${time.slice(11, 16)}`
    }
    if (t - Date.now() < 1000 * 60 * 60 * 24 * 2){
      return `明天${time.slice(11, 16)}`
    }
    return time.slice(5,16)
  }

  render() {
    const active = this.state.active
    const liveData = this.props.liveData
    console.log(liveData)
    let appFrame = [{ title : '直播', url: 'live' }]
    if (liveData.chatRoomTrigger !== 'off') {
      appFrame.push({ title : '聊天室', url: 'chat' })
    }
    appFrame = appFrame.concat(liveData.appFrame ? liveData.appFrame : [] )

    return (
      <div className="m-tab-wrap">
        <div className="m-tab">
          <div className={'inner' + ' tab' + appFrame.length}>
            {
              appFrame.map((item, i) => {
                return <span key={i} className={'tab-item' + (i === active ? ' active' : '')} onClick={this.tabChange.bind(null, i)}>{item.title}</span>
              })
            }
          </div>
          <span className={this.props.boolMultiVideo ? (this.props.multiHeader ? 'expand-button' : 'expand-button rotate') : (this.props.header ? 'expand-button' : 'expand-button rotate')} onClick={this.props.boolMultiVideo ? this.props.expandMultiHeader : this.props.expandHeader}></span>
          <span className="underscore" ref="underscore"></span>
        </div>
        <div className="m-tab-content">
          {

            appFrame.map((item, i) => {
              return (
                <div className={'tab-panel' + (active === i ? ' active' : '')}>
                  {
                    item.url === 'live' && (+(new Date(liveData.startDate.replace(/-/g,"/"))) > +(new Date())?
                      <section className="live-not-start-tip">
                        <div className="set-alert">
                          <div className="title">————本次直播将于{this.getTime(liveData.startDate)}开始————</div>
                          <div className="button" onClick={this.props.openNewsapp}>
                            <div className="logo"></div>
                            <div className="text">打开应用 开启提醒</div>
                          </div>
                        </div>
                      </section> :
                      liveData.nextPage > 0 && <LiveList liveData={liveData} active={active === i} />)
                  }
                  {
                    item.url === 'chat' && <ChatList nuid={this.props.nuid} roomId={liveData.roomId} active={active === i} />
                  }
                  {
                    item.url !== 'live' && item.url !== 'chat' && active === i && <div className="tab3-wrap">
                      {
                        item.url.indexOf('CreditMarket') !== -1 ? <div className="credit-market"><div className="credit-img"></div><a href={`http://m.163.com/newsapp/applinks.html?s=sps&liveRoomid=${liveData.roomId}`}>点击前往</a></div> : <iframe className="tab3-iframe" src={item.sid ? `http://c.m.163.com/news/s/${item.sid}.html` : item.url}></iframe>
                      }
                    </div>
                  }
                </div>
              )
            })
          }

        </div>
      </div>
    )
  }
}