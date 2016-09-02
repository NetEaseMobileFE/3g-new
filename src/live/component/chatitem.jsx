import * as utils from './../../common/utils'

export default class ChatItem extends React.Component {
  constructor(props) {
    super(props)
    this.avatarError = this.avatarError.bind(this)
  }
  avatarError() {
    ReactDOM.findDOMNode(this).querySelector('.avatar').src = 'http://img4.cache.netease.com/utf8/3g/touch/images/user-default.png'
  }
  render() {
    const item = this.props.item
    let quote = null
    if(!!item.quote){
      quote = <div className="quote">
        <div className="quote-user">{item.quote.nick_name.slice(0, 20)}</div>
        <div className="quote-text">{item.quote.msg}</div>
        <div className="quote-time">{utils.parseTime(item.quote.time)}</div>
      </div>
    }
    let avatar = item.avatar
    if (!avatar || avatar === 'null') {
      avatar = 'http://img4.cache.netease.com/utf8/3g/touch/images/live2.png'
    }
    return (
      <article className="chat-list-item">
        <header>
          <img className="avatar" src={avatar} onError={this.avatarError}/>
          <span className="name">{item.nick_name.slice(0, 20)}</span>
          <span className="time">{NTES.formatTime(item.time * 1000).time}</span>
        </header>
        <div className="content">
          <div className="text" dangerouslySetInnerHTML={{__html: item.msg || ''}} ></div>
          {quote}
        </div>
        <footer>
        </footer>
      </article>
    )
  }
}