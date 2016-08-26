import ChatItem from './chatitem.jsx'

export default class ChatList extends React.Component {
  constructor(props) {
    super(props)
    this.handleScroll = this.handleScroll.bind(this)
    this.initChat = this.initChat.bind(this)
    this.fetchMore = this.fetchMore.bind(this)
    this.state = {
      chatData: {}
    }
  }
  componentDidMount() {
    this.refs.dom.addEventListener('scroll', this.handleScroll, false)
  }
  componentWillUpdate(nextProps) {
    if (!this.props.active && nextProps.active && !this.loaded) {
      this.loaded = true
      this.initChat()
    }
  }
  componentWillUnmount() {
    this.refs.dom.removeEventListener('scroll', this.handleScroll, false)
  }
  initChat() {
    const time = Date.now()
    utils.importJs(`http://data.chat.126.net/route_room?topicid=${this.props.roomId}&callback=callback${time}&User_U=${this.props.nuid}`)
    this.loading = true
    window['callback' + time] = (chatData) => {
      window['callback' + time] = null
      this.loading = false
      if(chatData.last_log && chatData.last_log.length > 0){
        chatData.last_log.sort(function(i, j){
          return j.msg_id - i.msg_id
        })
      }
      this.minIndex = chatData.min_index
      this.setState({ chatData: chatData })
    }
  }
  handleScroll() {
    if (!this.props.active) { return }
    const now = Date.now()
    if(now - this.lastScroll < 300){
      return
    }
    this.lastScroll = now
    requestAnimationFrame(() => {
      const dom = this.refs.dom
      const last = document.querySelector('.section-wrap:last-child')
      const screenHeight = dom.offsetHeight
      const scrollTop = dom.scrollTop
      const height = last.offsetTop + last.offsetHeight
      const delta = height - scrollTop - screenHeight
      // 加载更多
      if (delta < 200) {
        this.fetchMore()
      }

    })
  }
  fetchMore() {
    const chatData = this.state.chatData
    const roomId = this.props.roomId
    const time = Date.now()
    if(this.loading || this.minIndex <= 0 || !chatData.code || chatData.code != 1){
      return
    }
    this.loading = true
    utils.importJs('http://data.chat.126.net/chat_log?callback=callback'+time+'&topicid='+roomId+'&roomid='+chatData.msg.room_id+'&userid='+chatData.msg.user_id+'&len=20&start='+(this.minIndex))
    window['callback' + time] = (data) => {
      window['callback' + time] = null
      this.loading = false
      if (data.msg && data.msg.length > 0) {
        data.msg = data.msg.filter((item) => {
          return item.msg_id < this.minIndex
        })
        this.minIndex = data.msg[0].msg_id
        data.msg.sort((i, j) => {
          return j.msg_id - i.msg_id
        })
        chatData.last_log = chatData.last_log.concat(data.msg)
        this.loadingMoreChat = false
        this.setState({ chatData: chatData })
      }
    }
  }
  render() {
    const chatList = this.state.chatData.last_log || []
    return <div className="chat-list" ref="dom">
      <div ref="inner">

        {
          chatList.map((item) => {
            return <ChatItem key={item.msg_id} item={item} />
          })
        }
      </div>
    </div>
  }
}