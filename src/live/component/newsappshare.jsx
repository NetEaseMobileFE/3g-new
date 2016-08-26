export default class NewsappShare extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      shareData: {}
    }
  }
  componentDidMount() {
    var that = this
    this.token = NTES.Pubsub.subscribe('shareData', function(shareData){
      that.setState({ shareData: shareData })
    })
  }
  render() {
    var shareData = this.state.shareData
    return (
      <div className="u-hide">
        <div id="__newsapp_sharetext">{shareData.title}</div>
        <div id="__newsapp_sharephotourl">http://img6.cache.netease.com/utf8/3g/touch/images/share-logo.png</div>
        <div id="__newsapp_sharewxtext">{shareData.desc}</div>
        <div id="__newsapp_sharewxtitle">{shareData.title}</div>
        <div id="__newsapp_sharewxurl">{shareData.url + '&spss=newsapp'}</div>
        <div id="__newsapp_sharewxthumburl">http://img6.cache.netease.com/utf8/3g/touch/images/share-logo.png</div>
      </div>
    )
  }
}