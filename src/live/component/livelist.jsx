import * as utils from './../../common/utils'
import LiveItem from './liveitem.jsx'

export default class LiveList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      liveList: props.liveData.messages,
      nextPage: props.liveData.nextPage,
      hasNewest: false,
      currentSection: -1
    }
    this.newMessages = []
    this.handleScroll = this.handleScroll.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.fetchMore = this.fetchMore.bind(this)
    this.fetchLatest = this.fetchLatest.bind(this)
    this.renderLatest = this.renderLatest.bind(this)
    this.changeSection = this.changeSection.bind(this)
    this.loading = false
    // 所有sectionTitle的offsetTop， 减少重绘
    this.titlesTop = []
  }
  componentDidMount() {
    this.refs.dom.addEventListener('scroll', this.handleScroll, false)
    this.lastestTimeout = setInterval(this.fetchLatest, 5000)
    // 第一个元素距离顶部的高度，排除置顶的信息
    this.firstTop = this.refs.first.offsetTop
  }
  componentWillUnmount() {
    clearInterval(this.lastestTimeout)
    this.refs.dom.removeEventListener('scroll', this.handleScroll, false)
  }
  handleClick() {
    this.refs.dom.scrollTop = this.firstTop
    this.setState({ hasNewest: false })
    this.renderLatest()
  }
  renderLatest() {
    this.setState({ liveList: this.newMessages.concat(this.state.liveList), hasNewest: false })
    this.newMessages = []
  }
  handleScroll() {
    if (!this.props.active) { return }
    const now = Date.now()
    const nextPage = this.state.nextPage
    // if(now - this.lastScroll < 300){
    //   return
    // }
    this.lastScroll = now
    requestAnimationFrame(() => {
      const dom = this.refs.dom
      const last = document.querySelector('.section-wrap:last-child')
      const screenHeight = dom.offsetHeight
      const scrollTop = dom.scrollTop
      const offsetTop = this.refs.first.offsetTop
      const height = last.offsetTop + last.offsetHeight
      const delta = height - scrollTop - screenHeight

      // 加载更多
      if (delta < 200 && nextPage) {
        this.fetchMore(nextPage)
      }
      if (scrollTop < offsetTop && this.newMessages.length > 0) {
        this.renderLatest()
      }
      this.changeSection(scrollTop)
    })
  }
  changeSection(scrollTop) {
    if (scrollTop < this.refs.first.offsetTop) {
      this.setState({ currentSection: -1 })
      return
    }
    const lastScrollTop = this.lastScrollTop || 0
    const cur = this.state.currentSection
    const sections = this.props.liveData.section
    const titles = document.querySelectorAll('.section-title')
    if (scrollTop > this.lastScrollTop) {
      // 向下滚动
      if (!this.titlesTop[cur + 1] && titles[cur + 1]) {
        // 为了减少重绘，将sectiontitle的offsetTop缓存起来
        this.titlesTop.push(titles[cur + 1].offsetTop)
      }
      if (titles[cur + 1] && this.titlesTop[cur + 1] < scrollTop) {
        this.setState({ currentSection: cur + 1})
      }
    } else {
      // 向下滚动
      if (this.titlesTop[cur] && this.titlesTop[cur] > scrollTop) {
        this.setState({currentSection: cur - 1})
      }
    }
    this.lastScrollTop = scrollTop
  }
  fetchLatest() {
    const roomId = this.props.liveData.roomId
    const time = Date.now()
    const dom = this.refs.dom
    const firstTop = this.refs.first.offsetTop
    if (this.loadingLatest) { return }
    utils.importJs(`http://data.live.126.net/live/${roomId}.json?callback=liveCallback`)
    this.loadingLatest = true
    window['liveCallback'] = (data) => {
      this.loadingLatest = false
      const scrollTop = dom.scrollTop
      const height = dom.offsetHeight
      if (!data.messages || data.messages.length < 1) { return }
      let liveList = this.state.liveList
      let newMessages = data.messages.filter((item) => {
        let exist = this.newMessages.concat(liveList.slice(0, 10)).some((_item) => { return _item.id === item.id })
        if (!exist) {
          item.newest = true
        }
        return !exist
      })
      // console.log(newMessages)
      if (newMessages.length > 0 || this.newMessages.length > 0) {
        newMessages = newMessages.sort((i, j) => {
          return  j.id - i.id
        })
        this.newMessages = newMessages.concat(this.newMessages)
        if (scrollTop - this.firstTop > height) {
          if (!this.state.hasNewest) {
            this.setState({ hasNewest: true })
          }
        } else {
          this.setState({ liveList: this.newMessages.concat(liveList), hasNewest: false })
          this.newMessages = []
        }
      }
    }
  }
  fetchMore(pageNumber) {
    const roomId = this.props.liveData.roomId
    const time = Date.now()
    if (this.loading) {
      return
    }
    utils.importJs(`http://data.live.126.net/liveAll/${roomId}/${pageNumber}.json?callback=callback${time}`)
    this.loading = true
    window['callback' + time] = (data) => {
      window['callback' + time] = null
      let liveList = this.state.liveList
      data.messages = data.messages.sort((i,j) => {
        return  j.id - i.id
      })
      liveList = liveList.concat(data.messages)
      this.loading = false
      this.setState({ liveList: liveList, nextPage: data.nextPage })
    }
  }
  render() {
    const topMessage = this.props.liveData.topMessage
    const setions = this.props.liveData.section
    let sectionList = []
    this.state.liveList.forEach((item, i) => {
      const pre = this.state.liveList[i - 1]
      const len = sectionList.length
      if (len > 0 && pre && item.section === pre.section) {
        sectionList[len - 1].list.push(item)
      } else {
        sectionList.push({ section: item.section, list: [item] })
      }
    })
    let count = -1
    return <div className="live-wrap">
      {this.state.currentSection >= 0  && <div className="static-title">{setions[this.state.currentSection]}</div>}
      <div className={'m-noti' + (this.state.hasNewest ? ' active' : '')} onClick={this.handleClick}>上面有新消息哦</div>
      <div className="live-list" ref="dom">
        <div ref="inner">
          {
            topMessage && <LiveItem item={topMessage} top />
          }
          {
            sectionList.map((section, i) => {
              return (
                <div key={section.section} ref={ i === 0 ? 'first' : ''} className="section-wrap">
                  <div className="section-title">{section.section}</div>
                  {
                    section.list.map((item, j) => {
                      count++
                      return <LiveItem showDownload={count % 10 === 1 && count !== 1} item={item} key={item.id} ref={(i === 0 && j === 0) ? 'last' : ''} />
                    })
                  }
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  }
}