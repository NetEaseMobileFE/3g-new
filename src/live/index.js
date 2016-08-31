import analysis from '../common/analysis'
import * as utils from '../common/utils'
import '../common/is-newsapp'
import '../common/is-iframe'

import Alert from './component/alert.jsx'
import Carousel from './component/carousel.jsx'
import Footer from './component/footer.jsx'
import FullVideo from './component/fullvideo.jsx'
import IMoney from './component/imoney.jsx'
import Mask from './component/mask.jsx'
import NBAHeader from './component/nbaheader.jsx'
import Newsapp from './component/newsapp.jsx'
import NewsappShare from './component/newsappshare.jsx'
import NormalHeader from './component/normalheader.jsx'
import Tab from './component/tab.jsx'
import Nav from './component/nav.jsx'

require('../common/reset.css')
require('./index.less')
/* eslint-disable */
if (module && module.hot) {
  module.hot.accept()
}
const liveid = window.location.href.match(/\/l\/(\w*)\./)[1]

if (window.top != window.self) {
  window.top.location = `http://c.m.163.com/news/l/${liveid}.html`
}

// mapp and sps analysis
analysis({
  spst: 4,
  type: "article",
  modelid: liveid
})

// main body
{
  {
    function Subject(subject){
      this._subject = subject
      this.observers = []
    }

    let Pubsub = (function(){
      let topics = {}
      // {[{token: 1, func: function}]}
      // let topics = {
      //   'a': [{token: 1, func: function}]
      // }
      function subscribe(topic, observer){
        topics[topic] = topics[topic] || []
        let token = topics[topic].length
        unsubscribe(topic, observer)
        topics[topic].push({
          token: token,
          func: observer
        })
        return token
      }
      function unsubscribe(topic){
        let args = arguments[1]
        if(topics[topic]){
          topics[topic] = topics[topic].filter(function(item){
            if(item.func !== args && item.token !== args){
              return item
            }
          })
        }
      }
      function publish(topic){
        let args = [].slice.call(arguments, 1)
        if(topics[topic]){
          topics[topic].forEach(function(item, i){
            if(typeof item.func == 'function'){
              item.func.apply(null, args)
            }
          })
        }
      }
      return{
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        publish: publish
      }
    })()
    {
      let lastTime = 0;
      let prefixes = 'webkit moz ms o'.split(' '); //各浏览器前缀

      let requestAnimationFrame = window.requestAnimationFrame;
      let cancelAnimationFrame = window.cancelAnimationFrame;

      let prefix;
      //通过遍历各浏览器前缀，来得到requestAnimationFrame和cancelAnimationFrame在当前浏览器的实现形式
      for( let i = 0; i < prefixes.length; i++ ) {
        if ( requestAnimationFrame && cancelAnimationFrame ) {
          break;
        }
        prefix = prefixes[i];
        requestAnimationFrame = requestAnimationFrame || window[ prefix + 'RequestAnimationFrame' ];
        cancelAnimationFrame  = cancelAnimationFrame  || window[ prefix + 'CancelAnimationFrame' ] || window[ prefix + 'CancelRequestAnimationFrame' ];
      }

      //如果当前浏览器不支持requestAnimationFrame和cancelAnimationFrame，则会退到setTimeout
      if ( !requestAnimationFrame || !cancelAnimationFrame ) {
        requestAnimationFrame = function( callback, element ) {
          let currTime = new Date().getTime();
          //为了使setTimteout的尽可能的接近每秒60帧的效果
          let timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
          let id = window.setTimeout( function() {
          callback( currTime + timeToCall );
          }, timeToCall );
          lastTime = currTime + timeToCall;
          return id;
        };

        cancelAnimationFrame = function( id ) {
          window.clearTimeout( id );
        };
      }

      //得到兼容各浏览器的API
      window.requestAnimationFrame = requestAnimationFrame;
      window.cancelAnimationFrame = cancelAnimationFrame;
    }
    let nav = navigator.userAgent
    window.NTES = {
      formatTime: function (time){
        let _time = time
        if(typeof time !== 'number'){
          let arr = time.split(/[- :]/)
          _time = new Date(arr[0], arr[1]-1, arr[2], arr[3]||'00', arr[4]||'00', arr[5]||'00')
        }else{
          _time = new Date(time)
        }
        return {
          date: (_time.getMonth()+1) + '月' + _time.getDate() + '日',
          time: (_time.getHours()) + ':' + (_time.getMinutes() < 10? '0'+_time.getMinutes(): _time.getMinutes()),
        }
      },
      Pubsub: Pubsub,
      Subject: Subject
    }
  }
  document.addEventListener('touchmove', (ev) => {
    ev.preventDefault()
  }, false)
  utils.isQQ && utils.isAndroid && document.body.classList.add('is-qq')

  class Live extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        liveData: {},
        userCount: 0,
        header: true,
        multiHeader: true
      }
      this.expandHeader = this.expandHeader.bind(this)
      this.expandMultiHeader = this.expandMultiHeader.bind(this)
      this.openNewsapp = this.openNewsapp.bind(this)
    }
    componentDidMount() {
      const roomId = this.props.roomId
      if (utils.isNewsapp) {
        window.location.href = 'newsapp://live/' + roomId
      }
      // 加载直播室详情
      window['firstbloodCallback'] = (data) => {
        window['firstbloodCallback'] = null
        if (data.section) {
          data.section = data.section.reverse()
        }
        if (data.nextPage >= 0) {
          data.messages = data.messages.sort((i, j) => {
            return  j.id - i.id
          })
        }

        this.setState({ liveData: data })

        // 微信下，所有请求加载完后，标题可能无法更改
        document.title = data.roomName
        document.querySelector('title').textContent = data.roomName
        let iframe = document.createElement('iframe')
        iframe.style.display = 'none'
        iframe.src = '/favicon.ico'
        setTimeout(() => {
          document.body.appendChild(iframe)
        }, 100)
        setTimeout(() => {
          document.body.removeChild(iframe)
        }, 500)
        {
          let { w = 1, spss = '' } = utils.localParam().search
          w = +w + 1
          NTES.Pubsub.publish('shareData', {
            url: `${location.origin + location.pathname}?roomid=${roomId}&spss=newsapp&w=${w}`,
            title: '网易直播：' + data.roomName,
            desc: data.roomDes || ('网易直播：' + data.roomName),
            img: 'http://img6.cache.netease.com/utf8/3g/touch/images/share-logo.png',
          })
        }

        // {
        //   // 参与人数统计
        //   const form = this.refs.form
        //   form.submit()
        // }
      }
      utils.importJs('http://data.live.126.net/liveAll/' + roomId + '.json?callback=firstbloodCallback')

      // 加载参与人数
      utils.importJs('http://data.live.126.net/partake/usercount/'+roomId+'.json?callback=liveUsercount&type=1&topicid='+roomId)
      window['liveUsercount'] = (data) => {
        window['liveUsercount'] = null
        if (data.msg && data.msg.user_count >= 0) {
          this.setState({ userCount: data.msg.user_count })
        }
      }

      // 统计(新用户进来没有nuid报错)
      const _ntes_nuid = utils.getCookie('_ntes_nuid')
      const _ntes_nnid = utils.getCookie('_ntes_nnid')
      if (_ntes_nuid || _ntes_nuid) {
        this.nuid = _ntes_nuid || _ntes_nnid.split(',')[0]
      }
      // 反作弊防刷
      this.Jsession = utils.getCookie('JSESSIONID-WYZBS')

      {
        // 参与人数统计
        utils.ajax({
          method: 'POST',
          url: `http://data.live.126.net/partake/incr?User_U=${this.nuid}&User_D=${this.Jsession}`,
          data: {
            roomid: roomId,
            source: 'wap'
          }
        })
      }

    }

    expandHeader() {
      console.log(1)
      this.setState({ header: !this.state.header })
      // 需要优化，我觉得把播放video的方法提到live父级就可以通过props公用了
      const video = document.querySelector('video')
      if (video && video.paused && !this.state.header) {
        video.play()
      } else {
        video.pause()
      }
    }

    expandMultiHeader(){
      this.setState({ multiHeader: !this.state.multiHeader })
    }
    openNewsapp() {
      NTES.Pubsub.publish('openNewsapp', this.state.liveData.floatLayer.floatUrl)
    }

    render() {
      const params = utils.localParam().search
      const liveData = this.state.liveData
      const userCount = this.state.userCount
      console.log(this.state.liveData)
      // const chatData = this.state.chatData
      if (!liveData.roomId) {
        return <div className="loading"></div>
      }
      let header = <NormalHeader userCount={userCount} liveData={liveData} show={this.state.header} showMultiVideo={this.state.multiHeader} expandHeader={this.expandHeader} />
      if (!!liveData.sportsApiUrl) {
        header = <NBAHeader userCount={userCount} url={liveData.sportsApiUrl} show={this.state.header} gameInfo={liveData.messages[0]} started={liveData.nextPage >= 0} />
      }

      let content = (
        <div className="g-wrap">
          {false && !utils.isNewsapp && !this.state.liveData.video && !this.state.liveData.mutilVideo && <Nav /> }
          {params.spss === 'imoney' && !utils.isNewsapp && <IMoney />}
          {header}
          <Tab nuid={this.nuid} liveData={liveData} expandHeader={this.expandHeader} openNewsapp={this.openNewsapp} header={this.state.header} expandMultiHeader={this.expandMultiHeader} multiHeader={this.state.multiHeader} boolMultiVideo={!!this.state.liveData.mutilVideo} />
          <footer className="footer-placeholder u-hide-in-newsapp" />
        </div>
      )
      if (liveData.video && liveData.video.videoFull === 'on') {
        content = (
          <div className="g-wrap">
            <FullVideo nuid={this.nuid} src={liveData.video.videoUrl} roomId={this.props.roomId} userCount={userCount} show={this.state.header}/>
          </div>
        )
      }

      return (
        <section className={'g-live' + (utils.isNewsapp ? ' is-newsapp' : '')}>
          <Alert />
          {<Newsapp roomId={this.props.roomId} show={!utils.isNewsapp && !liveData.video && !liveData.mutilVideo} />}
          {content}
          {
            liveData.floatLayer && +liveData.floatLayer.floatType !== 0 && <a onClick={this.openNewsapp} className={"m-float-icon" + ` type${liveData.floatLayer.floatType}`} onClick={this.openNewsapp} />
          }
          <Footer isFull={liveData.video && liveData.video.videoFull === 'on'} />
          <Carousel />
          <Mask />
          {utils.isNewsapp && <NewsappShare />}
        </section>
      )
    }
  }
  ReactDOM.render(<Live roomId={utils.localParam()['search']['roomid'] || window.location.href.match(/l\/([0-9]{5,})\.html/)[1]} />, document.getElementById('container'))
}
