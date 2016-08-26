export default class Nav extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }
  handleClick(e){
    if (!document.referrer || (document.referrer && document.referrer.match(/163\.com/))) {
      e.preventDefault()
      window.history.back()
    }
  }
  render() {
    const spss = utils.localParam()['search']['spss']
    if (spss) {
      return null
    } else {
      return (
        <nav className="m-nav">
          <a className="back" href="http://3g.163.com/touch/" onClick={this.handleClick}></a>
          <a target="_blank" className="menu" href="http://3g.163.com/touch/navigation/"></a>
          <a className="home" href="http://3g.163.com/touch/"></a>
        </nav>
      )
    }
  }
}