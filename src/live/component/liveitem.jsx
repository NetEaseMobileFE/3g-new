import Images from './image.jsx'
import Video from './video.jsx'
import Album from './album.jsx'
import News from './news.jsx'
import NBAScore from './nbascore.jsx'
import Quote from './quote.jsx'

export default class LiveItem extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      newest: props.item.newest,
      topSpread: false
    }
    this.openNewsapp = this.openNewsapp.bind(this)
    this.avatarError = this.avatarError.bind(this)
    this.controlHeight = this.controlHeight.bind(this)
  }
  componentDidMount() {
    const item = this.props.item
    if (item.newest) {
      this.timeout = setTimeout(() => {
        this.setState({ newest: false })
      }, 6000)
    }
  }
  componentWillUnmount() {
    clearTimeout(this.timeout)
  }

  openNewsapp() {
    NTES.Pubsub.publish('openNewsapp')
  }

  avatarError() {
    ReactDOM.findDOMNode(this).querySelector('.avatar').src = 'http://img4.cache.netease.com/utf8/3g/touch/images/live2.png'
  }

  controlHeight() {
    this.setState({
      topSpread: !this.state.topSpread
    })
  }

  render() {
    console.log(this.state.topSpread)
    let className = ['live-list-item']
    const item = this.props.item
    if (this.props.top) {
      className.push('top')
    }
    if(item.quote){
      className.push('quote-wrap')
    }
    if(this.state.newest){
      className.push('newest')
    }
    if(this.props.firstItem){
      className.push('f-item')
    }
    // 内容
    let content = item.msg.content || ''
    if(item.msg.href){
      content = '<a class="link" href="' + item.msg.href + '">' + content + '</a>'
    }
    let color = ''
    if (item.msg.fontColor) {
      color = item.msg.fontColor.match(/.*(#.*);/)
    }
    let contentStyle = {
      color: !!color? color[1] : '#1f1f1f',
      // textAlign: item.msg.align,
      fontWeight: item.msg.fontType.match(/normal/)? 'normal': 'bold'
    }
    let images = null
    let video = null
    let album = null
    let news = null
    let quote = null
    let nbaScore = null
    // 图片
    if (item.images) {
      images = <Images images={item.images} />
    }
    // 视频
    if (item.video) {
      video = <Video href={item.video.url} image={item.video.coverImg} />
    }
    // 图集
    if (item.album) {
      album = <Album album={item.album} />
    }
    // 新闻
    if (item.news) {
      news = <News href={item.news.url} title={item.news.title} />
    }
    // 引用
    if (item.quote) {
      quote = <Quote info={item.quote}/>
    }
    // NBA 比分
    if(item.homeTeam && item.homeScore && item.awayTeam && item.awayScore){
      nbaScore = <NBAScore item={item} />
    }
    let avatar = item.commentator.imgUrl
    if (!avatar || avatar === 'null') {
      avatar = 'http://img4.cache.netease.com/utf8/3g/touch/images/live2.png'
    }
    // 时间线
    const currentTime = (new Date()).getTime()
    let pastTime = (currentTime - new Date(item.time).getTime()) / (1000*60)
    let timeText = ''
    if (pastTime <= 10) {
      timeText = pastTime + '分钟前'
    } else {
      timeText = NTES.formatTime(item.time).time
    }
    return <article className={className.join(' ')}>
      {
        <div className="timeline">
          <div className="time-text">{!!this.props.top ? '刚刚' : timeText}</div>
          <div className="circle">
            <div className="circle-inner"></div>
          </div>
          <div className="line"></div>
        </div> 
      }
      <header>
        <img className="avatar" src={avatar} onError={this.avatarError}/>
        <span className="name">{item.commentator.name}</span>
        { !!this.props.top && <div className="logo"></div> }
      </header>
      <div className={!!this.props.top && this.state.topSpread ? "content spread-height" : "content"}>
        <div className="text" style={contentStyle} dangerouslySetInnerHTML={{__html: content || ''}} ></div>
        {images}{video}{album}{news}
        {nbaScore}{quote}{(this.props.showDownload || quote) && <a className="down-link" onClick={this.openNewsapp}>打开网易新闻客户端，与主播互动上榜 &gt;&gt;</a>}
      </div>
      {
        !!this.props.top &&
        <div className='control-height' onClick={this.controlHeight}>
          <div className="logo"><span className={this.state.topSpread ? 'expand-button rotate' : 'expand-button'}></span><span>{!this.state.topSpread ? '收起' : '展开'}</span></div>
        </div>
      }
    </article>
  }
}