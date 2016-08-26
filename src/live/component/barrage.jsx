export default class Barrage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      chatData: {
        last_log: []
      }
    }
    this.avatarError = this.avatarError.bind(this)
    this.fetchLatest = this.fetchLatest.bind(this)
  }
  componentDidMount() {
    const time = Date.now()
    utils.importJs(`http://data.chat.126.net/route_room?topicid=${this.props.roomId}&callback=callback${time}&User_U=${this.props.nuid}`)
    window[`callback${time}`] = (data) => {
      window[`callback${time}`] = null
      this.setState({ chatData: data }, () => {
        ReactDOM.findDOMNode(this).querySelector('.item:last-child').scrollIntoView(false)
      })
      this.interval = setInterval(this.fetchLatest, 3000)
    }
  }
  componentWillUnmount() {
    clearInterval(this.interval)
  }
  fetchLatest (){
    const chatData = this.state.chatData
    const roomId = this.props.roomId
    const time = Date.now()
    if(this.loading || !chatData.code || chatData.code != 1){
      return
    }
    this.loading = true
    utils.importJs('http://data.chat.126.net/chat_log?callback=callback'+time+'&topicid='+roomId+'&roomid='+chatData.msg.room_id+'&userid='+chatData.msg.user_id+'&start='+(chatData.max_index))
    window['callback' + time] = (data) => {
      this.loading = false
      if (data.msg && data.msg.length > 0) {
        data.msg = data.msg.filter((item) => {
          return item.msg_id > this.state.chatData.max_index
        })
        chatData.last_log = chatData.last_log.concat(data.msg)
        this.setState({ chatData: chatData }, () => {
          ReactDOM.findDOMNode(this).querySelector('.item:last-child').scrollIntoView(false)
        })
      }
    }
  }
  avatarError() {
    ReactDOM.findDOMNode(this).querySelector('.avatar').src = 'http://img4.cache.netease.com/utf8/3g/touch/images/live2.png'
  }
  render() {
    return (
      <div className="barrage-list">
        {
          this.state.chatData.last_log.map((item) => {
            return <div className="item" key={item.msg_id}>
              <img className="avatar" src={item.avatar || 'http://img4.cache.netease.com/utf8/3g/touch/images/live2.png'} onError={this.avatarError}/>
              <div className="content">
                <div className="name">{item.nick_name.slice(0, 20)}</div>
                <div className="msg">{item.msg}</div>
              </div>
            </div>
          })
        }
      </div>
    )
  }
}