// 轮播图
export default class Carousel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      images: [],
      currentIndex: 0,
      delta: 0
    }
    this.x = null
    this.y = null
    this.start = null
    this.swiping = null
    this.calculatePos = this.calculatePos.bind(this)
    this.touchStart = this.touchStart.bind(this)
    this.touchMove = this.touchMove.bind(this)
    this.touchEnd = this.touchEnd.bind(this)
    this.doMoveImage = this.doMoveImage.bind(this)
    this.prevImageScroll = this.prevImageScroll.bind(this)
    this.nextImageScroll = this.nextImageScroll.bind(this)
    this.click = this.click.bind(this)

  }
  // getDefaultProps() {
  //   return {
  //     flickThreshold: 0.6,
  //     delta: 10
  //   }
  // }
  calculatePos(e) {
    let x = e.changedTouches[0].clientX
    let y = e.changedTouches[0].clientY

    let xd = this.x - x
    let yd = this.y - y

    let axd = Math.abs(xd)
    let ayd = Math.abs(yd)

    return {
      deltaX: xd,
      deltaY: yd,
      absX: axd,
      absY: ayd
    }
  }
  touchStart(e) {
    if (e.touches.length > 1) {
      return
    }

    this.start = Date.now()
    this.x = e.touches[0].clientX
    this.y = e.touches[0].clientY
    this.swiping = false
  }
  touchMove(e) {
    if (!this.x || !this.y || e.touches.length > 1) {
      return
    }

    let cancelPageSwipe = false
    let pos = this.calculatePos(e)

    if (pos.absX < this.props.delta && pos.absY < this.props.delta) {
      return
    }

    if (pos.absX > pos.absY) {
      if (pos.deltaX > 0) {
        this.nextImageScroll(e, pos.absX)
        cancelPageSwipe = true
      } else {
        this.prevImageScroll(e, pos.absX)
        cancelPageSwipe = true
      }
    }

    this.swiping = true

    if (cancelPageSwipe) {
      e.preventDefault()
    }
  }
  touchEnd(ev) {
    if (this.swiping) {
      let pos = this.calculatePos(ev)

      let time = Date.now() - this.state.start
      let velocity = Math.sqrt(pos.absX * pos.absX + pos.absY * pos.absY) / time
      let isFlick = velocity > this.props.flickThreshold

      let currentIndex = this.state.currentIndex

      this.doMoveImage(ev, pos.deltaX, pos.deltaY, isFlick)
    }else{
      this.setState({delta: 0})
    }
    // this.setState(this.getInitialState())
  }
  addResistance(delta) {
    return delta * (1 - parseInt(Math.sqrt(Math.pow(delta, 2)), 10) / 1000)
  }
  doMoveImage(_, x) {
    let index = this.state.currentIndex
    let imageMoveIndex = this.state.currentIndex
    if (x < 0) {
      if (index > 0) {
        index = index - 1
        imageMoveIndex = index
      }
    } else if (x > 0) {
      if (index < this.state.images.length - 1) {
        index = index + 1
        imageMoveIndex = imageMoveIndex
      }
    }

    this.setState({
      currentIndex: index,
      delta: 0
    })
  }
  prevImageScroll(e, delta) {
    this.setState({
      delta: this.addResistance(delta)
    })
  }

  nextImageScroll(e, delta) {
    this.setState({
      delta: 0 - this.addResistance(delta)
    })
  }
  click(e) {
    e.preventDefault()
    this.setState({images: [], currentIndex: 0})
  }
  componentDidMount() {
    let that = this
    this.token = NTES.Pubsub.subscribe('imageClick', function(images, index){
      that.setState({images: images, currentIndex: index, delta:0.0000001})
    })
  }
  componentWillUnmount() {
    NTES.Pubsub.unsubscribe('imageClick', this.token)
  }
  render() {
    let images = this.state.images
    let delta = this.state.delta/100 - this.state.currentIndex * 7.5
    let classString = 'm-carousel'
    if(images.length !== 0){
      classString += ' active'
    }
    let transition = 'all 250ms ease-out'
    let styleString = {
      width: images.length * 7.5 + 'rem',
      'WebkitTransform': 'translate3d(' + delta + 'rem, 0, 0)',
      transition: this.state.delta === 0 ? transition : 'none'
    }
    return <div className={classString}>
      <div className="inner" style={styleString} onTouchStart={this.touchStart} onTouchMove={this.touchMove} onTouchEnd={this.touchEnd} onClick={this.click}>
        {
          images.map(function(img, i){
            return <div className="img-wrap" key={i}><img src={img.fullSizeSrc} /></div>
          })
        }
      </div>
    </div>
  }
}