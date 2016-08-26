export default class Mask extends React.Component {
  constructor(props) {
    super(props)
    this.hide = this.hide.bind(this)
    this.state = {
      show: false
    }
  }
  componentDidMount() {
    NTES.Pubsub.subscribe('toggleMask', () => {
      this.setState({ show: !this.state.show })
    })
  }
  componentWillUnmount() {
    NTES.Pubsub.unsubscribe('toggleMask')
  }
  hide() {
    this.setState({ show: false })
  }
  render() {
    let className = 'm-mask'
    if (this.state.show) {
      className += ' show'
    }
    return <div className={className} onClick={this.hide} />
  }
}