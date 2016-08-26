export default class Images extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }
  handleClick(i) {
    NTES.Pubsub.publish('imageClick', this.props.images, i)
  }
  render() {
    const images = this.props.images
    let len = images.length
    len = len > 6 ? 6 : len
    let typeOfImg = ''
    switch ((len+3) % 3){
      case 0:
        typeOfImg = 'img3'
        break;
      case 1:
        typeOfImg = ''
        break;
      case 2:
        typeOfImg = 'img2'
        break;
      default:
        return false
    }
    if (len > 3) {
      typeOfImg = 'img3'
    }
    return (
      <div className='media imgs' >
        {
          images.map((item, i) => {
            const style = {
              background: `url('${item.fullSizeSrc}') no-repeat center center`
            }
            const img2Bg = {
              background: `url('${item.fullSizeSrc}') no-repeat center center`,
              backgroundSize: '100% 1.63rem'
            }
            const img3Bg = {
              background: `url('${item.fullSizeSrc}') no-repeat center center`,
              backgroundSize: '100% 1.63rem'
            }
            return <div key={i} onClick={this.handleClick.bind(null, i)} className={typeOfImg}>
              {
                len > 1 ?
                  <div className='img' style={typeOfImg === 'img3' ? img3Bg : img2Bg} ></div>
                  :
                  <img src={item.fullSizeSrc} />
              }
            </div>
          })
        }
        {
          len > 3 && len % 3 === 2 ?
            <div className={typeOfImg}>
                <div className='img'></div>
            </div> :
            ''
        }
      </div>
    )
  }
}